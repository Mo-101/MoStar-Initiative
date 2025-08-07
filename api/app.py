from flask import Flask, jsonify, request
from flasgger import Swagger

app = Flask(__name__)
swagger_config = {
    "swagger_ui": True,
    "specs_route": "/docs"
}
swagger = Swagger(
    app,
    template_file="MoStarIndustries-api-1.0.0-swagger.json",

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
if __name__ == "__main__":
    app.run(port=5000)
