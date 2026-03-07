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
    'rainfall', 'soil_moisture', 'humidity', 'temperature', 'slope'
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

    # Get probability from the ensemble
    proba = model.predict_proba(X)[0]
    landslide_prob = float(proba[1]) * 100  # percentage

    # Get probabilities from individual models
    # The pipeline is: [('scaler', StandardScaler), ('model', VotingClassifier)]
    voting_clf = model.named_steps['model']
    
    # Store individual predictions
    individual_probs = {}
    for name, estimator in voting_clf.named_estimators_.items():
        # The estimator receives pre-scaled data because it's inside the pipeline's voting classifier,
        # but sklearn's pipeline handles the scaling BEFORE handing to voting_clf.
        # Actually, if we access estimators directly, we must pass the SCALED data.
        # Let's cleanly just use the pipeline's transform step to get scaled X
        X_scaled = model.named_steps['scaler'].transform(X)
        est_proba = estimator.predict_proba(X_scaled)[0]
        individual_probs[name] = float(est_proba[1]) * 100

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
        'model_breakdown': {
            'rf': round(individual_probs.get('rf', 0), 1),
            'lstm': round(individual_probs.get('lstm', 0), 1),
            'mlp': round(individual_probs.get('mlp', 0), 1),
        }
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
