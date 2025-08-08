import os
import json
import time
from flask import Flask, request, jsonify
from web3 import Web3, exceptions as w3ex
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_PROVIDER_URL")))
acct = w3.eth.account.from_key(os.getenv("PRIVATE_KEY"))

with open(os.path.join(os.path.dirname(__file__), "MoStarPayoutVault.abi.json")) as f:
    VAULT_ABI = json.load(f)

vault = w3.eth.contract(
    address=Web3.to_checksum_address(os.getenv("VAULT_ADDRESS")),
    abi=VAULT_ABI,
)


@app.post("/payout")
def payout():
    body = request.get_json()
    wallet = Web3.to_checksum_address(body["wallet"])
    wei_amount = w3.to_wei(body["amount"], "ether")

    try:
        tx = vault.functions.payout(wallet, wei_amount).build_transaction(
            {
                "from": acct.address,
                "nonce": w3.eth.get_transaction_count(acct.address),
                "gas": 130_000,
                "maxFeePerGas": w3.to_wei("80", "gwei"),
                "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
                "chainId": w3.eth.chain_id,
            }
        )
        signed = acct.sign_transaction(tx)
        txhash = w3.eth.send_raw_transaction(signed.rawTransaction)
        log_payout(txhash.hex(), wallet, body["amount"])
        return jsonify({"tx_hash": txhash.hex()})
    except w3ex.SolidityError as e:
        return jsonify({"error": str(e)}), 400


def log_payout(tx_hash: str, wallet: str, amount_eth: float):
    with open(os.path.join(os.path.dirname(__file__), "ops_log.txt"), "a", encoding="utf-8") as f:
        f.write(f"{int(time.time())},{tx_hash},{wallet},{amount_eth}\n")
