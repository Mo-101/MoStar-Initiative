import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3

# --- App Setup ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Web3 Setup ---
try:
    w3 = Web3(Web3.HTTPProvider(os.environ.get('WEB3_PROVIDER_URL')))
    vault_address = os.environ.get('VAULT_ADDRESS')
    private_key = os.environ.get('PRIVATE_KEY')
    account = w3.eth.account.from_key(private_key)
except Exception as e:
    print(f"Error initializing Web3: {e}")

# --- Payouts ---
PACKS = {"starter": 0.5, "standard": 1.0, "pro": 2.0}  # MATIC

@app.route('/payout', methods=['POST'])
def payout():
    data = request.get_json()
    if not data or 'wallet' not in data or 'pack' not in data:
        return jsonify({"error": "wallet and pack are required"}), 400

    to_address = data['wallet']
    pack = data.get('pack')

    if not Web3.is_address(to_address):
        return jsonify({"error": "invalid wallet address"}), 400

    if pack not in PACKS:
        return jsonify({"error": "invalid pack"}), 400

    amount_matic = PACKS[pack]
    amount_wei = w3.to_wei(amount_matic, 'ether')

    try:
        nonce = w3.eth.get_transaction_count(account.address)
        tx = {
            'from': account.address,
            'to': to_address,
            'value': amount_wei,
            'nonce': nonce,
            'gas': 21000,
            'maxFeePerGas': w3.to_wei('60', 'gwei'),
            'maxPriorityFeePerGas': w3.to_wei('30', 'gwei'),
            'chainId': 137  # Polygon Mainnet
        }

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        return jsonify({"tx_hash": tx_hash.hex()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Health Check ---
@app.route('/status')
def status():
    try:
        balance_wei = w3.eth.get_balance(vault_address)
        balance_matic = w3.from_wei(balance_wei, 'ether')
        return jsonify({
            "network": w3.client_version,
            "vault_address": vault_address,
            "balance_matic": str(balance_matic)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
