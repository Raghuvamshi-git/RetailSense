from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.forecast import router as forecast_router
from backend.app.routes.inventory import router as inventory_router

app = FastAPI(
    title="RetailSense AI+",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)
app.include_router(inventory_router)

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
