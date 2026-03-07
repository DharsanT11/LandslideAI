"""Alert API routes."""
from flask import Blueprint, jsonify, request
from app.services.risk_engine import get_cached_alerts, get_recommendation
from app.services.data_processor import fetch_weather_for_zone
from app.ml.predict import predict_landslide_risk
from app.utils.feature_engineering import build_feature_vector

alert_bp = Blueprint('alerts', __name__)

# In-memory historical alerts list (persisted across requests)
_alert_history = []


from app.services.telegram_service import send_telegram_alert

def _update_history(new_alerts):
    """Append new alerts to history (max 200)."""
    global _alert_history
    from datetime import datetime, timedelta

    for alert in new_alerts:
        zone = alert.get('zone_name', '')
        _alert_history.insert(0, alert)
        
        # Send Telegram message for HIGH and MEDIUM risks
        risk = alert.get('risk_level', '')
        if risk in ('HIGH', 'MEDIUM'):
            print(f"Triggering Telegram delivery for {zone}...")
            send_telegram_alert(alert)
    _alert_history = _alert_history[:200]


@alert_bp.route('/api/alerts', methods=['GET'])
def get_alerts():
    """
    Get current active alerts.

    If lat and lon query params are provided, generates alerts based on
    a live prediction for that location. Otherwise, returns cached alerts.
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
                'status': 'ok',
                'alerts': [],
                'count': 0,
                'critical': 0,
                'message': 'Could not fetch data for alert generation.',
            })

        zone_data = {
            'slope_angle': custom_zone['slope_angle'],
            'elevation': custom_zone['elevation'],
        }
        features = build_feature_vector(reading, zone_data)
        prediction = predict_landslide_risk(features)

        alerts = []
        if prediction['risk_level'] in ('HIGH', 'MEDIUM'):
            alerts.append({
                'zone_id': 0,
                'zone_name': custom_zone['name'],
                'timestamp': reading['timestamp'],
                'risk_level': prediction['risk_level'],
                'probability': prediction['probability'],
                'recommendation': get_recommendation(prediction['risk_level']),
            })

        # Only save to history when explicitly requested (user clicked Search)
        if alerts and request.args.get('save'):
            _update_history(alerts)

        return jsonify({
            'status': 'ok',
            'alerts': alerts,
            'count': len(alerts),
            'critical': sum(1 for a in alerts if a['risk_level'] == 'HIGH'),
            'location': {'lat': lat, 'lon': lon},
        })

    # Default: cached alerts
    alerts = get_cached_alerts()
    _update_history(alerts)

    return jsonify({
        'status': 'ok',
        'alerts': alerts,
        'count': len(alerts),
        'critical': sum(1 for a in alerts if a['risk_level'] == 'HIGH'),
    })


@alert_bp.route('/api/alerts/history', methods=['GET'])
def get_alerts_history():
    """
    Get historical alerts with optional filtering.

    Query params:
      - risk_level: HIGH, MEDIUM, LOW, or ALL (default: ALL)
      - hours: number of hours to look back (default: all)
    """
    risk_filter = request.args.get('risk_level', 'ALL')
    hours_filter = request.args.get('hours', None)

    alerts = list(_alert_history)

    # Filter by risk level
    if risk_filter and risk_filter != 'ALL':
        alerts = [a for a in alerts if a['risk_level'] == risk_filter]

    # Filter by time
    if hours_filter:
        try:
            from datetime import datetime, timedelta
            cutoff = (datetime.utcnow() - timedelta(hours=int(hours_filter))).isoformat()
            alerts = [a for a in alerts if a['timestamp'] >= cutoff]
        except (ValueError, KeyError):
            pass

    return jsonify({
        'status': 'ok',
        'alerts': alerts,
        'total': len(alerts),
        'filters': {
            'risk_level': risk_filter,
            'hours': hours_filter,
        },
    })


@alert_bp.route('/api/alerts/history', methods=['DELETE'])
def clear_alerts_history():
    """Clear all historical alerts."""
    global _alert_history
    _alert_history = []
    return jsonify({'status': 'ok', 'message': 'Alert history cleared.', 'total': 0})
