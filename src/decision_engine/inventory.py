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
    ratio = (
        reorder_point - current_inventory
    ) / reorder_point.replace(0, np.nan)

    return (
        ratio.clip(lower=0) * 100
    ).fillna(0)


def assign_risk_level(risk_score):
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