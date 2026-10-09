from pathlib import Path
import joblib
import pandas as pd
from backend.app.database.connection import get_db_connection

ROOT_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = ROOT_DIR / "models" / "xgboost_model.pkl"

model = joblib.load(MODEL_PATH)

FEATURES = [
    "lag_7",
    "lag_28",
    "rolling_mean_7",
    "rolling_std_7",
    "sell_price",
    "month",
    "quarter",
    "is_weekend",
    "is_festival",
    "snap"
]


def predict_demand(data):
    input_data = pd.DataFrame([data.model_dump()])
    prediction = float(max(model.predict(input_data[FEATURES])[0], 0))

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO forecasts
        (item_id, store_id, forecast_date, predicted_demand, model_name)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            data.item_id,
            data.store_id,
            data.forecast_date,
            prediction,
            "XGBoost"
        )
    )

    db.commit()
    cursor.close()
    db.close()

    return {
        "predicted_demand": prediction,
        "model_name": "XGBoost",
        "message": "Forecast generated and saved successfully"
    }
