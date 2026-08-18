from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = ROOT_DIR / "data" / "raw"


def load_calendar():
    return pd.read_csv(RAW_DATA_DIR / "calendar.csv")


def load_sales():
    return pd.read_csv(RAW_DATA_DIR / "sales_train_validation.csv")


def load_prices():
    return pd.read_csv(RAW_DATA_DIR / "sell_prices.csv")