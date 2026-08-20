import shap


def create_explainer(model):
    return shap.TreeExplainer(model)


def calculate_shap_values(explainer, X):
    return explainer.shap_values(X)


def get_feature_importance(shap_values, X):
    importance = abs(shap_values).mean(axis=0)

    return {
        feature: float(value)
        for feature, value in sorted(
            zip(X.columns, importance),
            key=lambda item: item[1],
            reverse=True
        )
    }