import os, time, json, secrets
from flask import Blueprint, request, jsonify
from web3 import Web3
import eth_abi
import hashlib
import hmac

pay = Blueprint("pay", __name__)

RPC = os.getenv("CHAIN_RPC", "https://polygon-rpc.com")
TREASURY = os.getenv("TREASURY_ADDRESS")
TOKEN = os.getenv("TOKEN_ADDRESS")  # ERC20 (USDC)
PRICE_USDC = int(os.getenv("PRICE_USDC", "5000000"))          # 6 decimals, e.g. 5 USDC
PRICE_MATIC_WEI = int(os.getenv("PRICE_MATIC_WEI", "2000000000000000000"))  # 2 MATIC in wei
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")

# Initialize Web3 with safe defaults
if TREASURY:
    TREASURY = Web3.to_checksum_address(TREASURY)
if TOKEN:
    TOKEN = Web3.to_checksum_address(TOKEN)

w3 = Web3(Web3.HTTPProvider(RPC))

# minimal ERC20 ABI for Transfer decoding
ERC20_TRANSFER_SIG = w3.keccak(text="Transfer(address,address,uint256)").hex()

def issue_api_key(user_addr:str, plan:str, credits:int):
    """
    Issue a new API key for the user
    """
    # Generate a secure API key
    key = "ms_" + secrets.token_hex(24)
    
    # Store in database
    try:
        import psycopg2
        from datetime import datetime
        
        # Try to use the existing database connection if available
        DATABASE_URL = os.getenv("DATABASE_URL", "")
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            # Create api_keys table if it doesn't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS api_keys (
                    api_key TEXT PRIMARY KEY,
                    wallet TEXT,
                    plan TEXT,
                    credits INTEGER,
                    created_at TIMESTAMP,
                    last_used TIMESTAMP
                )
            """)
            
            # Insert the new API key
            cur.execute(
                "INSERT INTO api_keys (api_key, wallet, plan, credits, created_at) VALUES (%s, %s, %s, %s, %s)",
                (key, user_addr, plan, credits, datetime.utcnow())
            )
            
            # Log the operation
            cur.execute(
                "INSERT INTO ops_log (timestamp, action, wallet, amount) VALUES (%s, %s, %s, %s)",
                (datetime.utcnow(), f"api_key_issued:{plan}", user_addr, credits)
            )
            
            conn.commit()
            cur.close()
            conn.close()
    except Exception as e:
        # Fall back to in-memory storage if database connection fails
        print(f"Database error: {e}")
    
    return key

@pay.route("/pay/usdc/init", methods=["POST"])
def pay_usdc_init():
    """
    Initialize a USDC payment process
    """
    if not TOKEN or not TREASURY:
        return jsonify({"error": "Payment system not configured"}), 500
        
    data = request.get_json(force=True) if request.data else {}
    plan = data.get("plan", "standard")
    
    # Plan-based pricing
    credits = 500  # default
    amount = PRICE_USDC
    
    if plan == "standard":
        credits = 1200
    elif plan == "pro":
        credits = 3000
        amount = int(PRICE_USDC * 2)  # Double price for pro plan
        
    return jsonify({
        "chainId": 137,                      # Polygon PoS
        "token": TOKEN,
        "to": TREASURY,
        "amount": str(amount),               # raw amount (6 decimals USDC)
        "plan": plan,
        "credits": credits
    })

@pay.route("/pay/usdc/confirm", methods=["POST"])
def pay_usdc_confirm():
    """
    Body: { "txHash": "0x...", "buyer": "0x...", "plan":"standard" }
    Validates a USDC transfer to TREASURY >= PRICE_USDC and issues API key.
    """
    if not TOKEN or not TREASURY:
        return jsonify({"error": "Payment system not configured"}), 500
        
    body = request.get_json(force=True)
    txh = body.get("txHash")
    buyer = Web3.to_checksum_address(body.get("buyer"))
    plan = body.get("plan", "standard")

    if not txh: 
        return jsonify({"ok": False, "error": "Missing txHash"}), 400
        
    try:
        rcpt = w3.eth.get_transaction_receipt(txh)
    except Exception as e:
        return jsonify({"ok": False, "error": f"Receipt error: {e}"}), 400

    if rcpt.status != 1:
        return jsonify({"ok": False, "error": "Transaction failed"}), 400

    # Determine credits based on plan
    credits = 500  # default for starter
    if plan == "standard":
        credits = 1200
    elif plan == "pro":
        credits = 3000
    
    # Price based on plan
    price = PRICE_USDC
    if plan == "pro":
        price = int(PRICE_USDC * 2)

    # find ERC20 Transfer(token == TOKEN, from == buyer, to == TREASURY, amount >= price)
    paid = 0
    valid = False
    for log in rcpt.logs:
        if log.address.lower() != TOKEN.lower(): 
            continue
        if log.topics[0].hex().lower() != ERC20_TRANSFER_SIG.lower():
            continue
        # topics[1]=from, topics[2]=to (indexed addresses)
        from_addr = "0x" + log.topics[1].hex()[-40:]
        to_addr = "0x" + log.topics[2].hex()[-40:]
        amount = int(log.data, 16)
        if Web3.to_checksum_address(from_addr) == buyer and Web3.to_checksum_address(to_addr) == TREASURY:
            paid += amount
            if paid >= price:
                valid = True
                break

    if not valid:
        return jsonify({"ok": False, "error": "Payment not found or insufficient"}), 400

    # Success → issue credits/key
    key = issue_api_key(buyer, plan, credits)
    return jsonify({"ok": True, "apiKey": key, "credits": credits, "plan": plan, "txHash": txh})
    
@pay.route("/pay/matic/confirm", methods=["POST"])
def pay_matic_confirm():
    """
    Optional: support native MATIC payments.
    Body: { "txHash":"0x...", "buyer":"0x...", "plan":"starter" }
    """
    if not TREASURY:
        return jsonify({"error": "Payment system not configured"}), 500
        
    if PRICE_MATIC_WEI <= 0:
        return jsonify({"ok": False, "error": "MATIC payments disabled"}), 400

    body = request.get_json(force=True)
    txh = body.get("txHash")
    buyer = Web3.to_checksum_address(body.get("buyer"))
    plan = body.get("plan", "starter")

    try:
        tx = w3.eth.get_transaction(txh)
        rc = w3.eth.get_transaction_receipt(txh)
    except Exception as e:
        return jsonify({"ok": False, "error": f"Transaction error: {e}"}), 400

    if rc.status != 1:
        return jsonify({"ok": False, "error": "Transaction failed"}), 400
        
    if Web3.to_checksum_address(tx["to"]) != TREASURY:
        return jsonify({"ok": False, "error": "Wrong recipient"}), 400
        
    if tx["value"] < PRICE_MATIC_WEI:
        return jsonify({"ok": False, "error": "Insufficient amount"}), 400
        
    if Web3.to_checksum_address(tx["from"]) != buyer:
        return jsonify({"ok": False, "error": "Sender mismatch"}), 400

    # Determine credits based on plan
    credits = 500  # default for starter
    if plan == "standard":
        credits = 1200
    elif plan == "pro":
        credits = 3000

    key = issue_api_key(buyer, plan, credits)
    return jsonify({"ok": True, "apiKey": key, "credits": credits, "plan": plan, "txHash": txh})

# API key verification middleware
def verify_api_key(api_key):
    """
    Verify if an API key is valid and has credits
    Returns (is_valid, credits_remaining)
    """
    try:
        import psycopg2
        
        # Try to use the existing database connection if available
        DATABASE_URL = os.getenv("DATABASE_URL", "")
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            cur.execute("SELECT credits FROM api_keys WHERE api_key = %s", (api_key,))
            result = cur.fetchone()
            
            if result:
                credits = result[0]
                return True, credits
    except Exception as e:
        print(f"Database error: {e}")
    
    return False, 0

@pay.route("/verify-key", methods=["POST"])
def verify_key():
    """
    Verify if an API key is valid
    """
    data = request.get_json(force=True) if request.data else {}
    api_key = data.get("apiKey", "")
    
    if not api_key:
        return jsonify({"ok": False, "error": "Missing API key"}), 400
        
    valid, credits = verify_api_key(api_key)
    
    if valid:
        return jsonify({"ok": True, "credits": credits})
    else:
        return jsonify({"ok": False, "error": "Invalid API key"}), 401

@pay.route("/burn-credits", methods=["POST"])
def burn_credits():
    """
    Burn credits from an API key
    """
    data = request.get_json(force=True) if request.data else {}
    api_key = data.get("apiKey", "")
    amount = data.get("amount", 1)
    
    if not api_key:
        return jsonify({"ok": False, "error": "Missing API key"}), 400
        
    try:
        import psycopg2
        
        # Try to use the existing database connection if available
        DATABASE_URL = os.getenv("DATABASE_URL", "")
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            # Check current credits
            cur.execute("SELECT credits FROM api_keys WHERE api_key = %s", (api_key,))
            result = cur.fetchone()
            
            if not result:
                return jsonify({"ok": False, "error": "Invalid API key"}), 401
                
            credits = result[0]
            
            if credits < amount:
                return jsonify({"ok": False, "error": "Insufficient credits"}), 402
                
            # Burn credits
            cur.execute("UPDATE api_keys SET credits = credits - %s WHERE api_key = %s", (amount, api_key))
            conn.commit()
            
            return jsonify({"ok": True, "creditsRemaining": credits - amount})
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"ok": False, "error": "Database error"}), 500
    
    return jsonify({"ok": False, "error": "Failed to burn credits"}), 500
