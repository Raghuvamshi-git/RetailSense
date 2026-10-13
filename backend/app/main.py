from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.forecast import router as forecast_router
from backend.app.routes.inventory import router as inventory_router
from backend.app.routes.pricing import router as pricing_router

app = FastAPI(
    title="RetailSense AI+",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)
app.include_router(inventory_router)
app.include_router(pricing_router)

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
