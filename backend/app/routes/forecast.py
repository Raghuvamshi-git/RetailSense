from fastapi import APIRouter
from backend.app.schemas.forecast import ForecastRequest
from backend.app.services.forecast_service import predict_demand

router = APIRouter(
    prefix="/forecast",
    tags=["Forecasting"]
)

@router.post("/")
def forecast(request: ForecastRequest):
    return predict_demand(request)
