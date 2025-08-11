from flask import Blueprint, request, jsonify
from web3 import Web3
import os, time, uuid, json

payments = Blueprint("payments", __name__)

w3 = Web3(Web3.HTTPProvider(os.environ.get("CHAIN_RPC", "https://polygon-rpc.com")))
TREASURY = Web3.to_checksum_address(os.environ.get("TREASURY_ADDRESS", "0x17ef75896e3e9dae9e4f354d1fd568262435c11b"))
PRICE_WEI = int(os.environ.get("PRICE_MATIC_WEI", "100000000000000000"))  # 0.1
MIN_CONF = int(os.environ.get("MIN_CONFIRMATIONS", "2"))

PLAN_CREDITS = {"starter": 500, "standard": 1200, "pro": 3000}

@payments.route("/status", methods=["GET"])
def status():
    return jsonify({
        "network": "polygon",
        "block": w3.eth.block_number,
        "treasury": TREASURY,
        "priceWei": str(PRICE_WEI)
    })

@payments.route("/pay/matic/confirm", methods=["POST"])
def confirm_matic():
    data = request.get_json(force=True)
    tx_hash = data["txHash"]
    plan = data.get("plan", "starter")
    buyer = data.get("buyer")

    try:
        tx = w3.eth.get_transaction(tx_hash)
        rcpt = w3.eth.get_transaction_receipt(tx_hash)
    except Exception as e:
        return jsonify({"ok": False, "error": f"tx not found: {e}"}), 400

    if rcpt.status != 1:
        return jsonify({"ok": False, "error": "tx failed"}), 400

    if not tx["to"] or Web3.to_checksum_address(tx["to"]) != TREASURY:
        return jsonify({"ok": False, "error": "tx not to treasury"}), 400

    if tx["value"] < PRICE_WEI:
        return jsonify({"ok": False, "error": "amount too low",
                        "receivedWei": str(tx["value"])}), 400

    confs = w3.eth.block_number - rcpt.blockNumber + 1
    if confs < MIN_CONF:
        return jsonify({"ok": False, "pending": True, "confirmations": confs}), 202

    key = "ms_" + uuid.uuid4().hex
    credits = PLAN_CREDITS.get(plan, 500)
    record = {
        "key": key, "buyer": buyer, "plan": plan, "credits": credits,
        "txHash": tx_hash, "amountWei": str(tx["value"]), "issuedAt": int(time.time())
    }
    try:
        # Make sure the api directory exists
        keys_path = os.path.join(os.path.dirname(__file__), "keys.json")
        with open(keys_path, "a") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as e:
        print(f"Error writing to keys.json: {e}")
        # Continue anyway, as we'll return the API key to the user

    return jsonify({"ok": True, "apiKey": key, "credits": credits, "txHash": tx_hash})
