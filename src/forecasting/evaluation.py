import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error


def calculate_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    wape = (
        np.abs(y_true - y_pred).sum()
        / np.abs(y_true).sum()
    ) * 100

    return {
        "MAE": float(mae),
        "RMSE": float(rmse),
        "WAPE": float(wape)
    }


def create_model_comparison(
    xgb_metrics,
    lgbm_metrics,
    lstm_metrics
):
    results = pd.DataFrame([
        {
            "Model": "XGBoost",
            **xgb_metrics
        },
        {
            "Model": "LightGBM",
            **lgbm_metrics
        },
        {
            "Model": "LSTM",
            **lstm_metrics
        }
    ])

    return results.sort_values(
        "MAE",
        ascending=True
    ).reset_index(drop=True)


def save_model_comparison(results, path):
    results.to_csv(
        path,
        index=False
    )