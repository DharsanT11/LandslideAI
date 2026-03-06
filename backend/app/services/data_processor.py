"""
Data processor service — fetches real weather data from OpenWeatherMap.
"""
import requests
from datetime import datetime
from app.config import Config
from app.utils.feature_engineering import compute_soil_moisture, compute_rainfall_trend


def fetch_weather_for_zone(zone):
    """
    Fetch current weather data from OpenWeatherMap for a single zone.

    Returns a dict with standardized weather fields.
    """
    api_key = Config.OPENWEATHER_API_KEY

    if not api_key or api_key == 'your_api_key_here':
        # Fallback: return None so the caller can handle it
        return None

    url = f"{Config.OPENWEATHER_BASE_URL}/weather"
    params = {
        'lat': zone['lat'],
        'lon': zone['lon'],
        'appid': api_key,
        'units': 'metric',
    }

    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        print(f"  ✗ Weather API error for {zone['name']}: {e}")
        return None

    # Extract fields
    main = data.get('main', {})
    wind = data.get('wind', {})
    weather = data.get('weather', [{}])[0]
    rain = data.get('rain', {})

    rainfall_1h = rain.get('1h', 0)
    rainfall_3h = rain.get('3h', rainfall_1h * 2.5)  # estimate if not available
    humidity = main.get('humidity', 0)
    temperature = main.get('temp', 0)
    wind_speed = wind.get('speed', 0)
    weather_desc = weather.get('description', '')

    # Estimate soil moisture from weather data
    soil_moisture = compute_soil_moisture(rainfall_1h, humidity, temperature, rainfall_3h)
    rainfall_trend = compute_rainfall_trend(rainfall_1h, rainfall_3h)

    return {
        'zone_id': zone['zone_id'],
        'zone_name': zone['name'],
        'timestamp': datetime.utcnow().isoformat(),
        'rainfall_mm': round(rainfall_1h, 1),
        'humidity_pct': humidity,
        'temperature_c': round(temperature, 1),
        'soil_moisture': soil_moisture,
        'slope_angle': zone['slope_angle'],
        'elevation_m': zone['elevation'],
        'wind_speed': round(wind_speed, 1),
        'weather_desc': weather_desc,
        'rainfall_3h': round(rainfall_3h, 1),
        'rainfall_trend': rainfall_trend,
        'data_source': 'openweathermap',
    }


def fetch_all_zones():
    """Fetch weather data for all monitored zones."""
    results = []
    for zone in Config.MONITORED_ZONES:
        data = fetch_weather_for_zone(zone)
        if data:
            results.append(data)
        else:
            # If API call fails, still return zone with minimal data
            results.append({
                'zone_id': zone['zone_id'],
                'zone_name': zone['name'],
                'timestamp': datetime.utcnow().isoformat(),
                'rainfall_mm': 0,
                'humidity_pct': 0,
                'temperature_c': 0,
                'soil_moisture': 0,
                'slope_angle': zone['slope_angle'],
                'elevation_m': zone['elevation'],
                'wind_speed': 0,
                'weather_desc': 'data unavailable',
                'rainfall_3h': 0,
                'rainfall_trend': 0,
                'data_source': 'unavailable',
            })
    return results


def fetch_forecast_for_zone(zone):
    """
    Fetch 5-day/3-hour weather forecast from OpenWeatherMap.

    Returns list of forecast timesteps with weather data.
    """
    api_key = Config.OPENWEATHER_API_KEY

    if not api_key or api_key == 'your_api_key_here':
        return None

    url = f"{Config.OPENWEATHER_BASE_URL}/forecast"
    params = {
        'lat': zone['lat'],
        'lon': zone['lon'],
        'appid': api_key,
        'units': 'metric',
        'cnt': 8,  # next 24 hours (8 x 3h steps)
    }

    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        print(f"  ✗ Forecast API error for {zone['name']}: {e}")
        return None

    forecasts = []
    for item in data.get('list', []):
        main = item.get('main', {})
        wind = item.get('wind', {})
        rain = item.get('rain', {})

        rainfall = rain.get('3h', 0) / 3.0  # convert 3h to 1h estimate
        humidity = main.get('humidity', 0)
        temperature = main.get('temp', 0)
        wind_speed = wind.get('speed', 0)
        rainfall_3h = rain.get('3h', 0)

        soil_moisture = compute_soil_moisture(rainfall, humidity, temperature, rainfall_3h)
        rainfall_trend = compute_rainfall_trend(rainfall, rainfall_3h)

        forecasts.append({
            'timestamp': item.get('dt_txt', ''),
            'rainfall_mm': round(rainfall, 1),
            'humidity_pct': humidity,
            'temperature_c': round(temperature, 1),
            'soil_moisture': soil_moisture,
            'slope_angle': zone['slope_angle'],
            'elevation_m': zone['elevation'],
            'rainfall_3h': round(rainfall_3h, 1),
            'rainfall_trend': rainfall_trend,
            'wind_speed': round(wind_speed, 1),
        })

    return forecasts
