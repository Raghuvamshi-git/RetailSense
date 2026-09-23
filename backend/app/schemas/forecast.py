from pydantic import BaseModel


class ForecastRequest(BaseModel):
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
