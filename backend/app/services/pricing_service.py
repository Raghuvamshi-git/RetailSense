from fastapi import HTTPException
from src.pricing.recommendation import generate_price_recommendation


def calculate_pricing_decisions(data):
    if data.current_price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Current price must be greater than zero"
        )

    if data.price_change_percent <= 0:
        raise HTTPException(
            status_code=400,
            detail="Price change percentage must be greater than zero"
        )

    curr_rev = data.current_revenue
    down_rev = data.price_down_revenue
    up_rev = data.price_up_revenue

    # If revenues are not passed directly, derive from demands
    if curr_rev is None and data.predicted_demand is not None:
        curr_rev = float(data.current_price * data.predicted_demand)

    step = data.price_change_percent / 100.0
    price_down = data.current_price * (1.0 - step)
    price_up = data.current_price * (1.0 + step)

    if down_rev is None and data.price_down_demand is not None:
        down_rev = float(price_down * data.price_down_demand)

    if up_rev is None and data.price_up_demand is not None:
        up_rev = float(price_up * data.price_up_demand)

    if curr_rev is None or down_rev is None or up_rev is None:
        raise HTTPException(
            status_code=400,
            detail="Either revenue metrics (current_revenue, price_down_revenue, price_up_revenue) or demand metrics (predicted_demand, price_down_demand, price_up_demand) must be provided."
        )

    if curr_rev < 0 or down_rev < 0 or up_rev < 0:
        raise HTTPException(
            status_code=400,
            detail="Revenue metrics must be non-negative"
        )

    # Call existing pricing algorithm function directly
    raw_recommendation = generate_price_recommendation(
        current_revenue=curr_rev,
        price_down_revenue=down_rev,
        price_up_revenue=up_rev
    )
    recommendation = str(raw_recommendation)

    if recommendation == "Consider reducing price":
        suggested_price = price_down
        projected_rev = down_rev
    elif recommendation == "Consider increasing price":
        suggested_price = price_up
        projected_rev = up_rev
    else:
        suggested_price = data.current_price
        projected_rev = curr_rev

    uplift = projected_rev - curr_rev
    uplift_percent = (uplift / curr_rev * 100.0) if curr_rev > 0 else 0.0

    return {
        "item_id": str(data.item_id),
        "current_price": float(round(float(data.current_price), 2)),
        "suggested_price": float(round(float(suggested_price), 2)),
        "price_change_percent": float(round(float(data.price_change_percent), 2)),
        "current_revenue": float(round(float(curr_rev), 4)),
        "projected_revenue": float(round(float(projected_rev), 4)),
        "price_down_revenue": float(round(float(down_rev), 4)),
        "price_up_revenue": float(round(float(up_rev), 4)),
        "revenue_uplift": float(round(float(uplift), 4)),
        "revenue_uplift_percent": float(round(float(uplift_percent), 2)),
        "recommendation": str(recommendation),
        "message": f"Pricing recommendation '{recommendation}' calculated successfully."
    }
