"""Sensor data API routes."""
from flask import Blueprint, jsonify
from app.services.risk_engine import get_cached_readings

sensor_bp = Blueprint('sensors', __name__)


@sensor_bp.route('/api/sensors', methods=['GET'])
def get_sensors():
    """
    Get latest real-time sensor/weather readings for all monitored zones.

    Returns live data fetched from OpenWeatherMap API.
    """
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
