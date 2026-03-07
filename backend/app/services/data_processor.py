"""
Data processor service — fetches real weather data from OpenWeatherMap.
"""
import requests
from datetime import datetime
from app.config import Config
from app.utils.feature_engineering import compute_soil_moisture, compute_rainfall_trend
from app.services.hardware_data import get_hardware_reading


def fetch_weather_for_zone(zone):
    """
    Fetch current weather data from OpenWeatherMap for a single zone.

    Returns a dict with standardized weather fields.
    """
    api_key = Config.OPENWEATHER_API_KEY

    if not api_key or api_key == 'your_api_key_here':
        # Fallback: return None so the caller can handle it
        return None

    # Demo Mode Intercept for Presentation
    if round(zone.get('lat', 0), 2) == 99.99 and round(zone.get('lon', 0), 2) == 99.99:
        return {
            'zone_id': zone.get('zone_id', 0),
            'zone_name': zone.get('name', 'Demo Zone'),
            'timestamp': datetime.utcnow().isoformat(),
            'rainfall_mm': 210.5,
            'humidity_pct': 98.0,
            'temperature_c': 26.5,
            'soil_moisture': 95.5,
            'slope_angle': zone.get('slope_angle', 48.5),
            'elevation_m': zone.get('elevation', 1500),
            'wind_speed': 65.0,
            'weather_desc': 'extreme torrential downpour',
            'rainfall_3h': 450.0,
            'rainfall_trend': 2.8,
            'data_source': 'DEMO_OVERRIDE_ACTIVE',
        }

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

    # Check if we have real hardware data for this zone
    hw_reading = get_hardware_reading(zone['zone_id'])
    if hw_reading:
        soil_moisture = hw_reading['soil_moisture']
        # Optionally tag the datasource
        data_source = 'ESP32_Hardware + OWM'
    else:
        # Estimate soil moisture from weather data
        soil_moisture = compute_soil_moisture(rainfall_1h, humidity, temperature, rainfall_3h)
        data_source = 'openweathermap'
        
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
        'data_source': data_source,
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

    # Demo Mode Intercept for Forecast
    if round(zone.get('lat', 0), 2) == 99.99 and round(zone.get('lon', 0), 2) == 99.99:
        now = datetime.utcnow()
        import datetime as dt
        demo_forecasts = []
        for i in range(8):
            demo_forecasts.append({
                'timestamp': (now + dt.timedelta(hours=i*3)).isoformat(),
                'rainfall_mm': 150.0 + (i * 10),
                'humidity_pct': 99.0,
                'temperature_c': 25.0,
                'soil_moisture': 98.0,
                'slope_angle': zone.get('slope_angle', 48.5),
                'elevation_m': zone.get('elevation', 1500),
                'rainfall_3h': 400.0,
                'rainfall_trend': 2.5,
                'wind_speed': 70.0,
            })
        return demo_forecasts

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
