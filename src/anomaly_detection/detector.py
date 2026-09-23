import numpy as np
import pandas as pd


def calculate_anomaly_score(actual, predicted):
    error = np.abs(actual - predicted)
    scale = np.abs(predicted).replace(0, np.nan)
    score = (error / scale) * 100
    return score.fillna(0)


def detect_anomalies(
    data,
    actual_column="sales",
    predicted_column="predicted_demand",
    threshold=50
):
    result = data.copy()

    result["anomaly_score"] = calculate_anomaly_score(
        result[actual_column],
        result[predicted_column]
    )

    result["is_anomaly"] = np.where(
        result["anomaly_score"] >= threshold,
        1,
        0
    )

    result["anomaly_type"] = np.select(
        [
            (result["is_anomaly"] == 1) &
            (result[actual_column] > result[predicted_column]),
            (result["is_anomaly"] == 1) &
            (result[actual_column] < result[predicted_column])
        ],
        [
            "Unexpected demand increase",
            "Unexpected demand decrease"
        ],
        default="Normal"
    )

    return result