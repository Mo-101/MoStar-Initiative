# MoStar-Initiative

## API Server

A simple Flask server is provided under the `api/` directory. It uses the
`AkanimoIniobong-mo-star_ai_api-1.0.0-swagger.json` specification to define
available endpoints and exposes interactive documentation.

### Setup

```bash
pip install -r requirements.txt
python api/app.py
```

The server runs on `http://localhost:5000` with Swagger UI available at
`http://localhost:5000/docs`.
