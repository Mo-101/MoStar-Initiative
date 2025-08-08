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

Set `STRIPE_SECRET_KEY` before starting the server to enable this route. The
landing page defines `purchaseCredits(tier)` which calls this endpoint and
redirects the browser to the returned Stripe Checkout URL.

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

### Payout Vault

A Solidity vault contract and companion Flask service enable scripted MATIC payouts.

#### Smart Contract

The contract resides at `contracts/MoStarPayoutVault.sol`. Compile and deploy with Hardhat:

```bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon
```

Fund the printed `VAULT_ADDRESS` with MATIC once deployed.

#### Payout API

Create a `.env` file using `.env.example` and set:

```
WEB3_PROVIDER_URL=https://polygon-rpc.com
VAULT_ADDRESS=0x...
PRIVATE_KEY=0x...
```

Run the payout server:

```bash
python api/payout.py
```

POST `{ "wallet": "0x...", "amount": 0.5 }` to `/payout` to trigger transfers.

#### Wallet Widget

`platform/payout-widget.html` demonstrates a simple web widget that connects a
wallet and requests a payout from the API.

### Continuous Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) can trigger Render
deployments on pushes to `main` when configured with your deploy hook.
