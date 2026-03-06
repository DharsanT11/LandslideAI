"""
Landslide risk prediction module.

Loads the trained model and provides prediction functions.
"""
import os
import numpy as np
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'model.pkl')

# Feature order (must match training)
FEATURE_ORDER = [
    'rainfall_mm', 'humidity_pct', 'temperature_c', 'soil_moisture',
    'slope_angle', 'elevation_m', 'rainfall_3h', 'rainfall_trend', 'wind_speed'
]

_model = None


def get_model():
    """Load the trained model (lazy singleton)."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run train_model.py first."
            )
        _model = joblib.load(MODEL_PATH)
        print(f"  ✓ ML model loaded from {MODEL_PATH}")
    return _model


def predict_landslide_risk(features):
    """
    Predict landslide risk from a feature dictionary.

    Args:
        features: dict with keys matching FEATURE_ORDER

    Returns:
        dict with risk_level (HIGH/MEDIUM/LOW) and probability (0-100)
    """
    model = get_model()

    # Build feature vector in the correct order
    X = np.array([[features.get(f, 0) for f in FEATURE_ORDER]])

    # Get probability
    proba = model.predict_proba(X)[0]
    landslide_prob = float(proba[1]) * 100  # percentage

    # Determine risk level
    if landslide_prob >= 65:
        risk_level = 'HIGH'
    elif landslide_prob >= 35:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'

    return {
        'risk_level': risk_level,
        'probability': round(landslide_prob, 1),
    }


def predict_batch(feature_list):
    """
    Predict risk for multiple feature sets.

    Args:
        feature_list: list of feature dicts

    Returns:
        list of prediction dicts
    """
    model = get_model()

    X = np.array([
        [f.get(feat, 0) for feat in FEATURE_ORDER]
        for f in feature_list
    ])

    probas = model.predict_proba(X)
    results = []

    for proba in probas:
        p = float(proba[1]) * 100
        if p >= 65:
            level = 'HIGH'
        elif p >= 35:
            level = 'MEDIUM'
        else:
            level = 'LOW'
        results.append({'risk_level': level, 'probability': round(p, 1)})

    return results
