"""
Flask application factory for the Landslide Early Warning System.
"""
import threading
import time
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.database.db import Database
from app.routes.sensor_routes import sensor_bp
from app.routes.prediction_routes import prediction_bp
from app.routes.alert_routes import alert_bp
from app.routes.esp32_routes import esp32_bp
from app.services.risk_engine import run_risk_assessment
from app.services.forecast_engine import generate_forecast


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    db = Database(Config.DB_PATH)
    app.config['db'] = db

    # Register blueprints
    app.register_blueprint(sensor_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(esp32_bp)

    # Health check
    @app.route('/api/health', methods=['GET'])
    def health():
        return {
            'status': 'ok',
            'system': 'AI Landslide Early Warning System',
            'api_configured': bool(Config.OPENWEATHER_API_KEY and
                                   Config.OPENWEATHER_API_KEY != 'your_api_key_here'),
            'zones_monitored': len(Config.MONITORED_ZONES),
        }

    # Status endpoint
    @app.route('/api/status', methods=['GET'])
    def status():
        from app.services.risk_engine import get_cached_readings, get_cached_predictions
        readings = get_cached_readings()
        predictions = get_cached_predictions()
        return {
            'status': 'ok',
            'has_data': len(readings) > 0,
            'zones_with_data': len(readings),
            'zones_with_predictions': len(predictions),
            'refresh_interval': Config.REFRESH_INTERVAL,
        }

    # Start background data fetcher
    _start_background_fetcher(db)

    return app


def _start_background_fetcher(db):
    """Start a background thread that periodically fetches data and runs predictions."""

    def _fetch_loop():
        print("\n🛡️  Landslide Early Warning System — Background Fetcher Started")
        print(f"   Refresh interval: {Config.REFRESH_INTERVAL}s")
        print(f"   Monitoring {len(Config.MONITORED_ZONES)} zones\n")

        # Initial fetch
        time.sleep(2)  # let server start first
        try:
            run_risk_assessment(db)
            generate_forecast()
            print("  ✓ Initial data fetch and forecast complete\n")
        except Exception as e:
            print(f"  ✗ Initial fetch error: {e}\n")

        # Periodic updates
        while True:
            time.sleep(Config.REFRESH_INTERVAL)
            try:
                run_risk_assessment(db)
                generate_forecast()
            except Exception as e:
                print(f"  ✗ Periodic fetch error: {e}")

    thread = threading.Thread(target=_fetch_loop, daemon=True)
    thread.start()
