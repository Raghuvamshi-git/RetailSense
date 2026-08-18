import pandas as pd
import numpy as np


def prepare_dates(calendar):
    calendar = calendar.copy()
    calendar["date"] = pd.to_datetime(calendar["date"])
    return calendar


def create_calendar_features(data):
    data = data.copy()

    data["is_weekend"] = (
        data["weekday"].isin(["Saturday", "Sunday"])
        .astype(int)
    )

    data["month"] = data["date"].dt.month
    data["quarter"] = data["date"].dt.quarter

    data["is_festival"] = (
        data["event_name_1"].notna()
        .astype(int)
    )

    data["snap"] = data[
        ["snap_CA", "snap_TX", "snap_WI"]
    ].max(axis=1)

    return data


def create_price_features(data):
    data = data.copy()

    data = data.sort_values(
        ["id", "date"]
    )

    data["sell_price"] = (
        data.groupby("id")["sell_price"]
        .transform(lambda x: x.ffill())
    )

    return data


def create_lag_features(data):
    data = data.copy()

    data = data.sort_values(
        ["id", "date"]
    )

    data["lag_7"] = (
        data.groupby("id")["sales"]
        .shift(7)
    )

    data["lag_28"] = (
        data.groupby("id")["sales"]
        .shift(28)
    )

    return data


def create_rolling_features(data):
    data = data.copy()

    data = data.sort_values(
        ["id", "date"]
    )

    data["rolling_mean_7"] = (
        data.groupby("id")["sales"]
        .transform(
            lambda x: x.shift(1).rolling(7).mean()
        )
    )

    data["rolling_std_7"] = (
        data.groupby("id")["sales"]
        .transform(
            lambda x: x.shift(1).rolling(7).std()
        )
    )

    return data


def create_features(data):
    data = prepare_dates(data)
    data = create_calendar_features(data)
    data = create_price_features(data)
    data = create_lag_features(data)
    data = create_rolling_features(data)

    return data