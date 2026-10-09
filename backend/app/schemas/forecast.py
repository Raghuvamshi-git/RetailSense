from pydantic import BaseModel
from datetime import date

class ForecastRequest(BaseModel):
    item_id: str
    store_id: str
    forecast_date: date
    lag_7: float
    lag_28: float
    rolling_mean_7: float
    rolling_std_7: float
    sell_price: float
    month: int
    quarter: int
    is_weekend: int
    is_festival: int
    snap: int
