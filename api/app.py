import os

import stripe
from flask import Flask, jsonify, request
from flasgger import Swagger

app = Flask(__name__)
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
swagger_config = {
    "swagger_ui": True,
    "specs_route": "/docs"
}
swagger = Swagger(
    app,
    template_file="MoStarIndustries-api-1.0.0-swagger.json",
    config=swagger_config,
)

@app.route("/", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"message": "Service is up"})


@app.route("/predict", methods=["POST"])
def predict():
    """Generate placeholder response based on provided prompt."""
    data = request.get_json() or {}
    prompt = data.get("prompt", "")
    response_text = prompt[::-1]
    return jsonify({"response": response_text})


@app.route("/demo/climate", methods=["GET"])
def demo_climate():
    """Return a sample climate anomaly prediction."""
    return jsonify({"prediction": "No anomaly detected"})


@app.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    """Create Stripe Checkout session for purchasing credits."""
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": "MoStar API Access"},
                    "unit_amount": 500,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=request.host_url.rstrip("/") + "/success",
            cancel_url=request.host_url.rstrip("/") + "/cancel",
        )
        return jsonify({"url": session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 403


if __name__ == "__main__":
    app.run(port=5000)
