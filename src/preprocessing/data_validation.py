import pandas as pd


def validate_calendar(df):
    required_columns = ["d", "date", "wm_yr_wk"]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing calendar columns: {missing_columns}"
        )

    return True


def validate_sales(df):
    required_columns = [
        "id",
        "item_id",
        "dept_id",
        "cat_id",
        "store_id",
        "state_id"
    ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing sales columns: {missing_columns}"
        )

    return True


def validate_prices(df):
    required_columns = [
        "store_id",
        "item_id",
        "wm_yr_wk",
        "sell_price"
    ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing price columns: {missing_columns}"
        )

    return True


def validate_no_duplicates(df):
    return not df.duplicated().any()


def validate_dataframe(df):
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Input must be a pandas DataFrame")

    if df.empty:
        raise ValueError("DataFrame is empty")

    return True