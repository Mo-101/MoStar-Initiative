# MoStar-Initiative

## API Server

A simple Flask server is provided under the `api/` directory. It uses the

`MoStarIndustries-api-1.0.0-swagger.json` specification to define

available endpoints and exposes interactive documentation.

### Setup

```bash
python -m venv venv
source venv/bin/activate
pip install --upgrade pip

python -m venv venv
source venv/bin/activate
pip install --upgrade pip

pip install -r requirements.txt
python api/app.py
```

The server runs on `http://localhost:5000` with Swagger UI available at
`http://localhost:5000/docs`.

If package installation fails, manually install the dependencies:

```bash
pip install Flask flasgger gunicorn
```

### Demo Route

An example endpoint illustrates climate anomaly prediction:

```
GET /demo/climate
```

This returns a sample JSON prediction payload.

### Stripe Checkout

Initiate a payment session to purchase API credits:

```
POST /create-checkout-session
```

### Landing Page

A minimal Vite site lives under `platform/` and can be used as a landing page
or future web client.

```bash
cd platform
npm install
npm run dev
```

The development server defaults to `http://localhost:5173`.

If `npm install` returns registry errors, reset the registry:

```bash
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

### Deploying to Render

A basic `render.yaml` is included for deployment.

```bash
render.yaml
```

This configuration installs requirements and runs the API using `gunicorn` on
Render's free plan.
### Continuous Deployment

A GitHub Actions workflow (`.github/workflows/render-deploy.yml`) can trigger
Render deployments on pushes to `main` when configured with your deploy hook.

Render's free plan.

