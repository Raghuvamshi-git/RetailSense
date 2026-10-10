import unittest
import pandas as pd
import numpy as np
from backend.app.schemas.inventory import InventoryRequest, InventoryResponse
from backend.app.services.inventory_service import calculate_inventory_decisions
from src.decision_engine.inventory import (
    calculate_safety_stock,
    calculate_reorder_point,
    calculate_recommended_order,
    calculate_risk_score,
    assign_risk_level
)
from src.decision_engine.recommendations import generate_inventory_recommendation
from fastapi import HTTPException
from pydantic import ValidationError


class TestInventoryDecision(unittest.TestCase):

    def test_calculate_inventory_decisions_valid(self):
        req = InventoryRequest(
            predicted_demand=10.0,
            demand_std=2.0,
            current_inventory=20.0,
            lead_time=7,
            service_level_z=1.65
        )
        res = calculate_inventory_decisions(req)
        self.assertIn("safety_stock", res)
        self.assertIn("reorder_point", res)
        self.assertIn("recommended_order_quantity", res)
        self.assertIn("risk_score", res)
        self.assertIn("risk_level", res)
        self.assertIn("recommendation", res)

        self.assertAlmostEqual(res["safety_stock"], 8.731, places=3)
        self.assertAlmostEqual(res["reorder_point"], 78.731, places=3)
        self.assertAlmostEqual(res["recommended_order_quantity"], 58.731, places=3)
        self.assertAlmostEqual(res["risk_score"], 74.5967, places=3)
        self.assertEqual(res["risk_level"], "CRITICAL")
        self.assertEqual(res["recommendation"], "Urgent stock replenishment required")

    def test_calculate_inventory_decisions_zero_order(self):
        req = InventoryRequest(
            predicted_demand=2.0,
            demand_std=0.5,
            current_inventory=100.0,
            lead_time=7,
            service_level_z=1.65
        )
        res = calculate_inventory_decisions(req)
        self.assertEqual(res["recommended_order_quantity"], 0.0)
        self.assertEqual(res["risk_score"], 0.0)
        self.assertEqual(res["risk_level"], "LOW")
        self.assertEqual(res["recommendation"], "Sufficient inventory available")

    def test_zero_reorder_point_safety(self):
        score = calculate_risk_score(0.0, 50.0)
        self.assertEqual(score, 0.0)
        level = assign_risk_level(score)
        self.assertEqual(level, "LOW")

    def test_scalar_and_series_risk_score_consistency(self):
        scalar_score = calculate_risk_score(78.731, 20.0)
        series_score = calculate_risk_score(pd.Series([78.731]), pd.Series([20.0])).iloc[0]
        self.assertAlmostEqual(scalar_score, series_score, places=5)

    def test_scalar_and_series_risk_level_consistency(self):
        scalar_level = assign_risk_level(74.597)
        series_level = str(assign_risk_level(pd.Series([74.597])).iloc[0])
        self.assertEqual(scalar_level, series_level)

    def test_invalid_negative_demand(self):
        with self.assertRaises(ValidationError):
            InventoryRequest(
                predicted_demand=-5.0,
                demand_std=2.0,
                current_inventory=20.0,
                lead_time=7,
                service_level_z=1.65
            )

    def test_invalid_zero_lead_time(self):
        with self.assertRaises(ValidationError):
            InventoryRequest(
                predicted_demand=10.0,
                demand_std=2.0,
                current_inventory=20.0,
                lead_time=0,
                service_level_z=1.65
            )


if __name__ == "__main__":
    unittest.main()
