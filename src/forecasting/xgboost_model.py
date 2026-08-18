from xgboost import XGBRegressor


def create_xgboost_model():
    return XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1
    )


def train_xgboost(X_train, y_train):
    model = create_xgboost_model()
    model.fit(X_train, y_train)
    return model


def predict_xgboost(model, X_test):
    return model.predict(X_test)