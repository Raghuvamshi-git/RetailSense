import numpy as np


def generate_promotion_recommendation(
    demand,
    predicted_demand,
    stockout_risk
):
    demand_ratio = (
        predicted_demand /
        demand.replace(0, np.nan)
    ).fillna(1)

    recommendation = np.select(
        [
            (demand_ratio < 0.8) &
            (stockout_risk == "LOW"),

            (demand_ratio >= 1.2) &
            (stockout_risk.isin(["HIGH", "CRITICAL"])),

            stockout_risk.isin(["HIGH", "CRITICAL"])
        ],
        [
            "Consider promotional campaign",
            "Avoid promotion and prioritize inventory",
            "Monitor inventory before promotion"
        ],
        default="No promotion required"
    )

    return recommendation