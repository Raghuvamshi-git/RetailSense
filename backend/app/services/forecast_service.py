from pathlib import Path
import joblib
import pandas as pd

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
    prediction = model.predict(input_data[FEATURES])[0]

    return {
        "predicted_demand": float(max(prediction, 0))
    }
