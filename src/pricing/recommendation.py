import numpy as np


def generate_price_recommendation(
    current_revenue,
    price_down_revenue,
    price_up_revenue
):
    recommendation = np.select(
        [
            (price_down_revenue > current_revenue) &
            (price_down_revenue >= price_up_revenue),

            (price_up_revenue > current_revenue) &
            (price_up_revenue > price_down_revenue)
        ],
        [
            "Consider reducing price",
            "Consider increasing price"
        ],
        default="Keep current price"
    )

    return recommendation