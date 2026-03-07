"""Sensor data API routes."""
from flask import Blueprint, jsonify, request
from app.services.risk_engine import get_cached_readings
from app.services.data_processor import fetch_weather_for_zone
from app.utils.feature_engineering import compute_soil_moisture

sensor_bp = Blueprint('sensors', __name__)


@sensor_bp.route('/api/sensors', methods=['GET'])
def get_sensors():
    """
    Get latest real-time sensor/weather readings.

    If lat and lon query parameters are provided, fetch weather for
    that specific location. Otherwise, return the cached zone data.
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
                'message': 'Could not fetch weather data for the given coordinates.',
            }), 200

        return jsonify({
            'status': 'ok',
            'timestamp': reading['timestamp'],
            'zones': [reading],
            'summary': {
                'soilMoisture': reading.get('soil_moisture', 0),
                'rainfall': reading['rainfall_mm'],
                'humidity': reading['humidity_pct'],
                'temperature': reading['temperature_c'],
                'slopeAngle': reading['slope_angle'],
            },
            'data_source': reading.get('data_source', 'openweathermap'),
            'location': {'lat': lat, 'lon': lon},
        })

    # Default: return cached zone data
    readings = get_cached_readings()

    if not readings:
        return jsonify({
            'status': 'waiting',
            'message': 'Data is being fetched. Please wait a moment.',
            'data': [],
        }), 200

    # Compute aggregate values for the dashboard summary
    avg_rainfall = sum(r['rainfall_mm'] for r in readings) / len(readings)
    avg_humidity = sum(r['humidity_pct'] for r in readings) / len(readings)
    avg_temp = sum(r['temperature_c'] for r in readings) / len(readings)
    avg_moisture = sum(r.get('soil_moisture', 0) for r in readings) / len(readings)
    max_slope = max(r['slope_angle'] for r in readings)

    return jsonify({
        'status': 'ok',
        'timestamp': readings[0]['timestamp'] if readings else None,
        'zones': readings,
        'summary': {
            'soilMoisture': round(avg_moisture),
            'rainfall': round(avg_rainfall, 1),
            'humidity': round(avg_humidity, 1),
            'temperature': round(avg_temp, 1),
            'slopeAngle': round(max_slope, 1),
        },
        'data_source': 'openweathermap',
    })
