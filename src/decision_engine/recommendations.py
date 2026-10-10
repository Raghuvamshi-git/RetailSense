import numpy as np
import pandas as pd


def generate_inventory_recommendation(risk_level):
    if isinstance(risk_level, (pd.Series, np.ndarray)):
        return np.select(
            [
                risk_level == "CRITICAL",
                risk_level == "HIGH",
                risk_level == "MEDIUM"
            ],
            [
                "Urgent stock replenishment required",
                "Stock replenishment required",
                "Monitor inventory levels closely"
            ],
            default="Sufficient inventory available"
        )

    mapping = {
        "CRITICAL": "Urgent stock replenishment required",
        "HIGH": "Stock replenishment required",
        "MEDIUM": "Monitor inventory levels closely",
        "LOW": "Sufficient inventory available"
    }

    return mapping.get(str(risk_level), "Sufficient inventory available")
