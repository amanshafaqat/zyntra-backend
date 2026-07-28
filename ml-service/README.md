# Zyntra ML Prediction Service

FastAPI microservice for admission-success prediction, called by the Node backend via `ML_SERVICE_URL`.

```
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

When `ML_SERVICE_URL` is unset, the Node backend falls back to an identical local model, so this service is optional.

Endpoints: `GET /health`, `POST /predict`, `POST /predict/batch`.
