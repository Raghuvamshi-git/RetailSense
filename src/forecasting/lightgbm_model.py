from lightgbm import LGBMRegressor


def create_lightgbm_model():
    return LGBMRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbosity=-1
    )


def train_lightgbm(X_train, y_train):
    model = create_lightgbm_model()
    model.fit(X_train, y_train)
    return model


def predict_lightgbm(model, X_test):
    return model.predict(X_test)