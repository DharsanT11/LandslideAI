"""Prediction API routes."""
from flask import Blueprint, jsonify
from app.services.risk_engine import get_cached_predictions
from app.services.forecast_engine import get_cached_forecast

prediction_bp = Blueprint('predictions', __name__)


@prediction_bp.route('/api/prediction', methods=['GET'])
def get_prediction():
    """
    Get current AI risk predictions for all monitored zones.

    Uses the trained ML model (Random Forest + Gradient Boosting ensemble).
    """
    predictions = get_cached_predictions()

    if not predictions:
        return jsonify({
            'status': 'waiting',
            'message': 'Predictions are being computed. Please wait.',
            'data': [],
        }), 200

    # Find the highest risk zone for the dashboard summary
    highest = max(predictions, key=lambda p: p['probability'])

    return jsonify({
        'status': 'ok',
        'zones': predictions,
        'overall': {
            'riskLevel': highest['risk_level'],
            'probability': highest['probability'],
            'highestRiskZone': highest['zone_name'],
        },
        'model': 'Random Forest + Gradient Boosting Ensemble v2.4',
    })


@prediction_bp.route('/api/forecast', methods=['GET'])
def get_forecast():
    """
    Get 24-hour risk forecast timeline.

    Uses real weather forecast data from OpenWeatherMap + ML model.
    """
    forecast = get_cached_forecast()

    if not forecast:
        return jsonify({
            'status': 'waiting',
            'message': 'Forecast is being generated. Please wait.',
            'data': [],
        }), 200

    return jsonify({
        'status': 'ok',
        'timeline': forecast,
        'zone': 'NH-44 Highway Corridor',
    })
