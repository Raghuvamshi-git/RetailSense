from pydantic import BaseModel, Field
from typing import Optional


class PricingRequest(BaseModel):
    item_id: str = Field("ITEM_001", description="Item identifier or SKU")
    current_price: float = Field(..., gt=0, description="Current selling price of the item")
    current_revenue: Optional[float] = Field(None, ge=0, description="Current baseline revenue")
    price_down_revenue: Optional[float] = Field(None, ge=0, description="Projected revenue if price is decreased")
    price_up_revenue: Optional[float] = Field(None, ge=0, description="Projected revenue if price is increased")
    predicted_demand: Optional[float] = Field(None, ge=0, description="Current baseline demand units")
    price_down_demand: Optional[float] = Field(None, ge=0, description="Projected demand if price is decreased")
    price_up_demand: Optional[float] = Field(None, ge=0, description="Projected demand if price is increased")
    price_change_percent: float = Field(10.0, gt=0, le=100.0, description="Percentage adjustment for scenario simulation (default 10%)")


class PricingResponse(BaseModel):
    item_id: str
    current_price: float
    suggested_price: float
    price_change_percent: float
    current_revenue: float
    projected_revenue: float
    price_down_revenue: float
    price_up_revenue: float
    revenue_uplift: float
    revenue_uplift_percent: float
    recommendation: str
    message: str
