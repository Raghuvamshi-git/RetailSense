import numpy as np
import pandas as pd


def calculate_safety_stock(demand_std, service_level_z=1.65, lead_time_days=7):
    return (
        service_level_z
        * demand_std
        * np.sqrt(lead_time_days)
    )


def calculate_reorder_point(
    predicted_demand,
    demand_std,
    lead_time_days=7,
    service_level_z=1.65
):
    safety_stock = calculate_safety_stock(
        demand_std,
        service_level_z,
        lead_time_days
    )

    reorder_point = (
        predicted_demand * lead_time_days
        + safety_stock
    )

    return safety_stock, reorder_point


def calculate_recommended_order(
    reorder_point,
    current_inventory
):
    return np.maximum(
        reorder_point - current_inventory,
        0
    )


def calculate_risk_score(
    reorder_point,
    current_inventory
):
    if isinstance(reorder_point, (int, float, np.number)):
        if pd.isna(reorder_point) or reorder_point == 0:
            return 0.0
        return float(max((reorder_point - current_inventory) / reorder_point, 0.0) * 100)

    ratio = (
        reorder_point - current_inventory
    ) / reorder_point.replace(0, np.nan)

    return (
        ratio.clip(lower=0) * 100
    ).fillna(0)


def assign_risk_level(risk_score):
    if isinstance(risk_score, (int, float, np.number)):
        result = pd.cut(
            [risk_score],
            bins=[-np.inf, 10, 30, 60, np.inf],
            labels=[
                "LOW",
                "MEDIUM",
                "HIGH",
                "CRITICAL"
            ]
        )
        return str(result[0])

    return pd.cut(
        risk_score,
        bins=[-np.inf, 10, 30, 60, np.inf],
        labels=[
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ]
    )