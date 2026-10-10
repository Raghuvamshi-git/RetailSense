from pydantic import BaseModel, Field


class InventoryRequest(BaseModel):
    predicted_demand: float = Field(..., ge=0)
    demand_std: float = Field(..., ge=0)
    current_inventory: float = Field(..., ge=0)
    lead_time: int = Field(7, gt=0)
    service_level_z: float = Field(1.65, gt=0)


class InventoryResponse(BaseModel):
    safety_stock: float
    reorder_point: float
    recommended_order_quantity: float
    risk_score: float
    risk_level: str
    recommendation: str
