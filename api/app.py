from flask import Flask, request, jsonify
import os
from web3 import Web3
import json
from flask_cors import CORS
from payments import payments

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register the payments blueprint
app.register_blueprint(payments, url_prefix='/api')

# -----------------------
# ENV VARS
# -----------------------
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER", "https://polygon-pokt.nodies.app")
VAULT_ADDRESS = os.getenv("VAULT_ADDRESS", "0x17ef75896e3e9dae9e4f354d1fd568262435c11b")  # Fallback to known address
VAULT_OWNER_KEY = os.getenv("VAULT_OWNER_KEY", "")  # Empty string fallback
DATABASE_URL = os.getenv("DATABASE_URL", "")  # Empty string fallback

# -----------------------
# WEB3 CONFIG
# -----------------------
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))

# Load ABI - hardcoded to avoid path issues
import json
import os

# Try to load from file if it exists, otherwise use hardcoded ABI
try:
    # Try relative path from api directory
    relative_path = "../hardhat/artifacts/contracts/MoStarPayoutVault.sol/MoStarPayoutVault.json"
    if os.path.exists(relative_path):
        with open(relative_path) as f:
            vault_abi = json.load(f)["abi"]
    else:
        # Fallback to hardcoded minimal ABI
        vault_abi = [
            {
                "inputs": [
                    {"internalType": "address payable", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "payout",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
except Exception as e:
    print(f"Error loading ABI: {e}")
    # Fallback to hardcoded minimal ABI
    vault_abi = [
        {
            "inputs": [
                {"internalType": "address payable", "name": "to", "type": "address"},
                {"internalType": "uint256", "name": "amount", "type": "uint256"}
            ],
            "name": "payout",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

vault_contract = w3.eth.contract(address=Web3.to_checksum_address(VAULT_ADDRESS), abi=vault_abi)

# -----------------------
# DB CONNECT
# -----------------------
def get_db_conn():
    if not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def log_operation(action, wallet, amount=None, tx_hash=None):
    try:
        conn = get_db_conn()
        if not conn:
            print(f"Skipping log: {action} - No database connection")
            return
            
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO ops_log (timestamp, action, wallet, amount, tx_hash) VALUES (%s,%s,%s,%s,%s)",
            (datetime.utcnow(), action, wallet, amount, tx_hash)
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Log operation failed: {e}")
        # Continue execution even if logging fails

# -----------------------
# ROUTES
# -----------------------
@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "OK", "network": w3.is_connected()})

@app.route("/register-wallet", methods=["POST"])
def register_wallet():
    data = request.json
    wallet = data.get("wallet")
    if not wallet:
        return jsonify({"error": "Wallet address required"}), 400

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO wallets (wallet) VALUES (%s) ON CONFLICT DO NOTHING", (wallet,))
    conn.commit()
    cur.close()
    conn.close()

    log_operation("REGISTER_WALLET", wallet)
    return jsonify({"status": "Wallet registered", "wallet": wallet})

@app.route("/payout", methods=["POST"])
def payout():
    data = request.json
    wallet = data.get("wallet")
    amount_matic = data.get("amount")

    if not wallet or not amount_matic:
        return jsonify({"error": "Wallet and amount required"}), 400

    owner_account = w3.eth.account.from_key(VAULT_OWNER_KEY)
    tx = vault_contract.functions.payout(wallet, w3.to_wei(amount_matic, 'ether')).build_transaction({
        'from': owner_account.address,
        'nonce': w3.eth.get_transaction_count(owner_account.address),
        'gas': 200000,
        'gasPrice': w3.to_wei('50', 'gwei')
    })

    signed_tx = w3.eth.account.sign_transaction(tx, VAULT_OWNER_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    log_operation("PAYOUT", wallet, amount_matic, tx_hash.hex())

    return jsonify({"status": "Payout sent", "tx_hash": tx_hash.hex()})

@app.route("/ops-log", methods=["GET"])
def ops_log():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT timestamp, action, wallet, amount, tx_hash FROM ops_log ORDER BY timestamp DESC LIMIT 50")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([
        {"timestamp": str(r[0]), "action": r[1], "wallet": r[2], "amount": r[3], "tx_hash": r[4]}
        for r in rows
    ])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
