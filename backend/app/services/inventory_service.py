from fastapi import HTTPException
from src.decision_engine.inventory import (
    calculate_reorder_point,
    calculate_recommended_order,
    calculate_risk_score,
    assign_risk_level
)
from src.decision_engine.recommendations import generate_inventory_recommendation


def calculate_inventory_decisions(data):
    if data.predicted_demand < 0 or data.demand_std < 0 or data.current_inventory < 0:
        raise HTTPException(
            status_code=400,
            detail="Demand, standard deviation, and current inventory must be non-negative"
        )

    if data.lead_time <= 0:
        raise HTTPException(
            status_code=400,
            detail="Lead time must be greater than zero"
        )

    if data.service_level_z <= 0:
        raise HTTPException(
            status_code=400,
            detail="Service level Z value must be greater than zero"
        )

    safety_stock, reorder_point = calculate_reorder_point(
        predicted_demand=data.predicted_demand,
        demand_std=data.demand_std,
        lead_time_days=data.lead_time,
        service_level_z=data.service_level_z
    )

    recommended_order = calculate_recommended_order(
        reorder_point=reorder_point,
        current_inventory=data.current_inventory
    )

    risk_score = calculate_risk_score(
        reorder_point=reorder_point,
        current_inventory=data.current_inventory
    )

    risk_level = assign_risk_level(risk_score)

    recommendation = generate_inventory_recommendation(risk_level)

    return {
        "safety_stock": float(round(float(safety_stock), 4)),
        "reorder_point": float(round(float(reorder_point), 4)),
        "recommended_order_quantity": float(round(float(recommended_order), 4)),
        "risk_score": float(round(float(risk_score), 4)),
        "risk_level": str(risk_level),
        "recommendation": str(recommendation)
    }
