"""Prediction API routes."""
from flask import Blueprint, jsonify, request
from app.services.risk_engine import get_cached_predictions
from app.services.forecast_engine import get_cached_forecast
from app.services.data_processor import fetch_weather_for_zone, fetch_forecast_for_zone
from app.ml.predict import predict_landslide_risk, predict_batch
from app.utils.feature_engineering import build_feature_vector

prediction_bp = Blueprint('predictions', __name__)


@prediction_bp.route('/api/prediction', methods=['GET'])
def get_prediction():
    """
    Get current AI risk predictions.

    If lat and lon query params are provided, runs a live prediction
    for that specific location. Otherwise, returns cached zone predictions.
    """
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    # Custom location mode
    if lat is not None and lon is not None:
        is_demo = round(lat, 2) == 99.99 and round(lon, 2) == 99.99
        custom_zone = {
            'zone_id': 0,
            'name': 'DEMONSTRATION: Critical Risk Zone' if is_demo else f'Custom ({lat:.4f}, {lon:.4f})',
            'lat': lat,
            'lon': lon,
            'slope_angle': 48.5 if is_demo else 25.0,
            'elevation': 1500 if is_demo else 1000,
        }
        reading = fetch_weather_for_zone(custom_zone)

        if not reading:
            return jsonify({
                'status': 'error',
                'message': 'Could not fetch weather data for prediction.',
            }), 200

        zone_data = {
            'slope_angle': custom_zone['slope_angle'],
            'elevation': custom_zone['elevation'],
        }
        features = build_feature_vector(reading, zone_data)
        prediction = predict_landslide_risk(features)

        return jsonify({
            'status': 'ok',
            'zones': [{
                'zone_id': 0,
                'zone_name': custom_zone['name'],
                'timestamp': reading['timestamp'],
                'risk_level': prediction['risk_level'],
                'probability': prediction['probability'],
                'model_breakdown': prediction.get('model_breakdown', {}),
            }],
            'overall': {
                'riskLevel': prediction['risk_level'],
                'probability': prediction['probability'],
                'highestRiskZone': custom_zone['name'],
            },
            'model': 'Random Forest + LSTM + Neural Network Ensemble v3.0',
            'location': {'lat': lat, 'lon': lon},
        })

    # Default: cached predictions
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

    If lat and lon query params are provided, generates a live forecast
    for the custom coordinates. Otherwise, returns cached forecast.
    """
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    # Custom location mode
    if lat is not None and lon is not None:
        custom_zone = {
            'zone_id': 0,
            'name': f'Custom Location ({lat:.4f}, {lon:.4f})',
            'lat': lat,
            'lon': lon,
            'slope_angle': 25.0,
            'elevation': 1000,
        }
        forecast_data = fetch_forecast_for_zone(custom_zone)

        if not forecast_data:
            return jsonify({
                'status': 'ok',
                'timeline': [],
                'zone': custom_zone['name'],
                'message': 'Forecast data unavailable for this location.',
            }), 200

        # Build feature vectors and run ML predictions
        zone_data = {
            'slope_angle': custom_zone['slope_angle'],
            'elevation': custom_zone['elevation'],
        }
        feature_list = [build_feature_vector(step, zone_data) for step in forecast_data]
        predictions = predict_batch(feature_list)

        timeline = []
        for i, (step, pred) in enumerate(zip(forecast_data, predictions)):
            hours = i * 3
            label = 'Now' if hours == 0 else f'+{hours}h'
            timeline.append({
                'time': label,
                'hours': hours,
                'timestamp': step['timestamp'],
                'risk': pred['probability'],
                'level': pred['risk_level'].capitalize(),
                'rainfall_mm': step['rainfall_mm'],
                'humidity_pct': step['humidity_pct'],
                'temperature_c': step['temperature_c'],
            })

        return jsonify({
            'status': 'ok',
            'timeline': timeline,
            'zone': custom_zone['name'],
            'location': {'lat': lat, 'lon': lon},
        })

    # Default: cached forecast
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
