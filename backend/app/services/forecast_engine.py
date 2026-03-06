"""
Forecast engine — generates real risk forecasts using weather forecast API.
"""
from app.config import Config
from app.services.data_processor import fetch_forecast_for_zone
from app.ml.predict import predict_batch
from app.utils.feature_engineering import build_feature_vector

_cached_forecast = []


def generate_forecast(zone_index=0):
    """
    Generate a risk forecast timeline using the weather forecast API.

    Uses zone_index=0 (NH-44 Highway) by default as the primary forecast zone.
    Runs ML predictions on each forecast timestep.
    """
    global _cached_forecast

    zone = Config.MONITORED_ZONES[zone_index]

    # Fetch real weather forecast
    forecast_data = fetch_forecast_for_zone(zone)

    if not forecast_data:
        return _cached_forecast if _cached_forecast else []

    # Build feature vectors for each timestep
    feature_list = []
    zone_data = {
        'slope_angle': zone['slope_angle'],
        'elevation': zone['elevation'],
    }

    for step in forecast_data:
        features = build_feature_vector(step, zone_data)
        feature_list.append(features)

    # Run batch ML predictions
    predictions = predict_batch(feature_list)

    # Build timeline
    timeline = []
    for i, (step, pred) in enumerate(zip(forecast_data, predictions)):
        hours = i * 3
        if hours == 0:
            label = 'Now'
        else:
            label = f'+{hours}h'

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

    _cached_forecast = timeline
    return timeline


def get_cached_forecast():
    """Return the last computed forecast."""
    return _cached_forecast
