"""Application configuration."""
import os
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class Config:
    """Central configuration for the Landslide Early Warning System."""

    # OpenWeatherMap
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
    OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

    # Database
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    DB_PATH = os.path.join(BASE_DIR, 'landslide.db')

    # ML Model
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'model.pkl')
    DATASET_PATH = os.path.join(BASE_DIR, '..', 'dataset', 'landslide_training_data.csv')
    TERRAIN_PATH = os.path.join(BASE_DIR, '..', 'dataset', 'terrain_sample_data.csv')

    # Data refresh interval (seconds)
    REFRESH_INTERVAL = 300  # 5 minutes

    # Monitored zones (lat, lon, name, slope, elevation)
    MONITORED_ZONES = [
        {
            'zone_id': 1,
            'name': 'NH-44 Highway Corridor',
            'lat': 34.08,
            'lon': 74.79,
            'slope_angle': 35.0,
            'elevation': 1620,
        },
        {
            'zone_id': 2,
            'name': 'Mountain Pass Zone',
            'lat': 34.15,
            'lon': 74.85,
            'slope_angle': 42.0,
            'elevation': 2150,
        },
        {
            'zone_id': 3,
            'name': 'Valley Supply Route',
            'lat': 34.02,
            'lon': 74.72,
            'slope_angle': 22.0,
            'elevation': 1540,
        },
        {
            'zone_id': 4,
            'name': 'Strategic Defense Post',
            'lat': 34.12,
            'lon': 74.92,
            'slope_angle': 38.0,
            'elevation': 1890,
        },
        {
            'zone_id': 5,
            'name': 'Bridge Crossing Zone',
            'lat': 34.05,
            'lon': 74.68,
            'slope_angle': 28.0,
            'elevation': 1580,
        },
    ]

    # Risk thresholds
    HIGH_RISK_THRESHOLD = 0.65
    MEDIUM_RISK_THRESHOLD = 0.35
