from fastapi import APIRouter
from backend.app.schemas.pricing import PricingRequest, PricingResponse
from backend.app.services.pricing_service import calculate_pricing_decisions

router = APIRouter(
    prefix="/pricing",
    tags=["Pricing"]
)


@router.post("/", response_model=PricingResponse)
def pricing_decision(request: PricingRequest):
    return calculate_pricing_decisions(request)
