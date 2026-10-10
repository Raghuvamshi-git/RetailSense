from fastapi import APIRouter
from backend.app.schemas.inventory import InventoryRequest, InventoryResponse
from backend.app.services.inventory_service import calculate_inventory_decisions

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post("/", response_model=InventoryResponse)
def inventory_decision(request: InventoryRequest):
    return calculate_inventory_decisions(request)
