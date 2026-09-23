from fastapi import FastAPI
from backend.app.routes.forecast import router as forecast_router

app = FastAPI(
    title="RetailSense AI+",
    version="1.0.0"
)

app.include_router(forecast_router)

@app.get("/")
def root():
    return {
        "message": "RetailSense AI+ API is running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy" 
    }
