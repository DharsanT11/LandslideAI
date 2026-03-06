"""
Risk engine — orchestrates the prediction pipeline.

Fetches weather → builds features → runs ML model → stores results → generates alerts.
"""
from datetime import datetime
from app.config import Config
from app.services.data_processor import fetch_all_zones
from app.ml.predict import predict_landslide_risk
from app.utils.feature_engineering import build_feature_vector

# In-memory cache of latest results
_latest_readings = []
_latest_predictions = []
_active_alerts = []

RECOMMENDATIONS = {
    'HIGH': [
        'Evacuate personnel from the risk zone immediately',
        'Halt all vehicular movement on affected routes',
        'Deploy emergency response teams to standby positions',
        'Activate emergency drainage and barrier systems',
        'Issue Level-3 alert to regional command center',
    ],
    'MEDIUM': [
        'Increase monitoring frequency to every 30 minutes',
        'Prepare alternate routes for logistics convoys',
        'Deploy field inspection teams to verify ground conditions',
        'Issue Level-2 advisory to all units in the sector',
        'Pre-position emergency equipment near the sector',
    ],
    'LOW': [
        'Continue standard monitoring procedures',
        'Maintain current route operations with caution',
        'Schedule routine inspection within 24 hours',
    ],
}


def get_recommendation(risk_level):
    """Get a contextual recommendation based on risk level."""
    import random
    options = RECOMMENDATIONS.get(risk_level, RECOMMENDATIONS['LOW'])
    return random.choice(options)


def run_risk_assessment(db=None):
    """
    Run the full risk assessment pipeline for all monitored zones.

    1. Fetch real-time weather data
    2. Build feature vectors
    3. Run ML predictions
    4. Store in database
    5. Generate alerts for HIGH risk zones
    """
    global _latest_readings, _latest_predictions, _active_alerts

    print(f"\n[{datetime.utcnow().isoformat()}] Running risk assessment...")

    # 1. Fetch real weather data
    readings = fetch_all_zones()
    _latest_readings = readings

    predictions = []
    new_alerts = []

    for reading in readings:
        # 2. Build feature vector for the zone
        zone_data = {
            'slope_angle': reading['slope_angle'],
            'elevation': reading['elevation_m'],
        }
        features = build_feature_vector(reading, zone_data)

        # 3. Run ML prediction
        prediction = predict_landslide_risk(features)

        pred_record = {
            'zone_id': reading['zone_id'],
            'zone_name': reading['zone_name'],
            'timestamp': reading['timestamp'],
            'risk_level': prediction['risk_level'],
            'probability': prediction['probability'],
            'rainfall_mm': reading['rainfall_mm'],
            'humidity_pct': reading['humidity_pct'],
            'soil_moisture': reading.get('soil_moisture', 0),
            'slope_angle': reading['slope_angle'],
        }
        predictions.append(pred_record)

        # 4. Store in database
        if db:
            db.insert_reading(reading)
            db.insert_prediction(pred_record)

        # 5. Generate alerts for HIGH/MEDIUM risk
        if prediction['risk_level'] in ('HIGH', 'MEDIUM'):
            alert = {
                'zone_id': reading['zone_id'],
                'zone_name': reading['zone_name'],
                'timestamp': reading['timestamp'],
                'risk_level': prediction['risk_level'],
                'probability': prediction['probability'],
                'recommendation': get_recommendation(prediction['risk_level']),
            }
            new_alerts.append(alert)
            if db:
                db.insert_alert(alert)

    _latest_predictions = predictions
    _active_alerts = new_alerts

    # Deactivate old alerts
    if db:
        db.deactivate_old_alerts(hours=24)

    high_count = sum(1 for p in predictions if p['risk_level'] == 'HIGH')
    med_count = sum(1 for p in predictions if p['risk_level'] == 'MEDIUM')
    print(f"  ✓ Assessment complete: {high_count} HIGH, {med_count} MEDIUM, "
          f"{len(predictions) - high_count - med_count} LOW risk zones")

    return {
        'readings': readings,
        'predictions': predictions,
        'alerts': new_alerts,
    }


def get_cached_readings():
    """Get the latest cached sensor readings."""
    return _latest_readings


def get_cached_predictions():
    """Get the latest cached predictions."""
    return _latest_predictions


def get_cached_alerts():
    """Get the latest cached alerts."""
    return _active_alerts
