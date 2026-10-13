import unittest
from backend.app.schemas.pricing import PricingRequest, PricingResponse
from backend.app.services.pricing_service import calculate_pricing_decisions
from src.pricing.recommendation import generate_price_recommendation
from fastapi import HTTPException
from pydantic import ValidationError


class TestPricingDecision(unittest.TestCase):

    def test_pricing_decision_reduce_price(self):
        req = PricingRequest(
            item_id="ITEM_001",
            current_price=10.0,
            current_revenue=100.0,
            price_down_revenue=120.0,
            price_up_revenue=90.0,
            price_change_percent=10.0
        )
        res = calculate_pricing_decisions(req)
        self.assertEqual(res["recommendation"], "Consider reducing price")
        self.assertEqual(res["suggested_price"], 9.0)
        self.assertEqual(res["projected_revenue"], 120.0)
        self.assertEqual(res["revenue_uplift"], 20.0)
        self.assertEqual(res["revenue_uplift_percent"], 20.0)

    def test_pricing_decision_increase_price(self):
        req = PricingRequest(
            item_id="ITEM_002",
            current_price=5.0,
            current_revenue=100.0,
            price_down_revenue=85.0,
            price_up_revenue=115.0,
            price_change_percent=10.0
        )
        res = calculate_pricing_decisions(req)
        self.assertEqual(res["recommendation"], "Consider increasing price")
        self.assertEqual(res["suggested_price"], 5.5)
        self.assertEqual(res["projected_revenue"], 115.0)
        self.assertEqual(res["revenue_uplift"], 15.0)
        self.assertEqual(res["revenue_uplift_percent"], 15.0)

    def test_pricing_decision_keep_price(self):
        req = PricingRequest(
            item_id="ITEM_003",
            current_price=8.0,
            current_revenue=100.0,
            price_down_revenue=95.0,
            price_up_revenue=95.0,
            price_change_percent=10.0
        )
        res = calculate_pricing_decisions(req)
        self.assertEqual(res["recommendation"], "Keep current price")
        self.assertEqual(res["suggested_price"], 8.0)
        self.assertEqual(res["projected_revenue"], 100.0)
        self.assertEqual(res["revenue_uplift"], 0.0)
        self.assertEqual(res["revenue_uplift_percent"], 0.0)

    def test_pricing_decision_from_demands(self):
        req = PricingRequest(
            item_id="ITEM_004",
            current_price=10.0,
            predicted_demand=20.0,       # current rev = 200.0
            price_down_demand=26.0,     # price down = 9.0, down rev = 9.0 * 26.0 = 234.0
            price_up_demand=15.0,       # price up = 11.0, up rev = 11.0 * 15.0 = 165.0
            price_change_percent=10.0
        )
        res = calculate_pricing_decisions(req)
        self.assertEqual(res["recommendation"], "Consider reducing price")
        self.assertAlmostEqual(res["current_revenue"], 200.0, places=2)
        self.assertAlmostEqual(res["price_down_revenue"], 234.0, places=2)
        self.assertAlmostEqual(res["price_up_revenue"], 165.0, places=2)
        self.assertEqual(res["suggested_price"], 9.0)

    def test_validation_error_negative_price(self):
        with self.assertRaises(ValidationError):
            PricingRequest(
                current_price=-10.0,
                current_revenue=100.0,
                price_down_revenue=90.0,
                price_up_revenue=90.0
            )

    def test_validation_error_negative_revenue(self):
        with self.assertRaises(ValidationError):
            PricingRequest(
                current_price=10.0,
                current_revenue=-50.0,
                price_down_revenue=90.0,
                price_up_revenue=90.0
            )

    def test_missing_both_revenues_and_demands_raises_http_exception(self):
        req = PricingRequest(
            current_price=10.0
        )
        with self.assertRaises(HTTPException):
            calculate_pricing_decisions(req)


if __name__ == "__main__":
    unittest.main()
