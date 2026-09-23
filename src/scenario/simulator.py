def run_price_scenario(data, model, features, price_change):
    scenario = data.copy()

    scenario["scenario_price"] = (
        scenario["sell_price"] * (1 + price_change)
    )

    model_features = scenario[features].copy()
    model_features["sell_price"] = scenario["scenario_price"]

    scenario["scenario_predicted_demand"] = model.predict(
        model_features
    )

    scenario["current_revenue"] = (
        scenario["sell_price"] *
        scenario["predicted_demand"]
    )

    scenario["scenario_revenue"] = (
        scenario["scenario_price"] *
        scenario["scenario_predicted_demand"]
    )

    scenario["revenue_change"] = (
        scenario["scenario_revenue"] -
        scenario["current_revenue"]
    )

    scenario["revenue_change_percent"] = (
        scenario["revenue_change"] /
        scenario["current_revenue"].replace(0, float("nan"))
    ) * 100

    return scenario