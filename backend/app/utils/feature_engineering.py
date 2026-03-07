"""Feature engineering utilities for landslide prediction."""
import math


def compute_soil_moisture(rainfall_mm, humidity_pct, temperature_c, rainfall_3h=None):
    """
    Estimate soil moisture from weather data.

    Since we don't have physical IoT soil moisture sensors, we use a
    hydrological estimation model based on rainfall, humidity, and temperature.

    The model considers:
    - Recent rainfall increases soil moisture
    - High humidity reduces evaporation → higher retention
    - Higher temperature increases evaporation → lower moisture
    - 3-hour cumulative rainfall indicates sustained saturation
    """
    # Base moisture from rainfall (higher rainfall → more saturation)
    base = rainfall_mm * 5.0  # ~5 units per mm of rain

    # Humidity contribution (high humidity → less evaporation → more retained)
    humidity_factor = (humidity_pct / 100.0) ** 1.5
    humidity_contrib = humidity_factor * 400

    # Temperature adjustment (warmer → more evaporation → less moisture)
    temp_factor = max(0, 1.0 - (temperature_c - 10) * 0.02)
    temp_factor = max(0.3, min(1.2, temp_factor))

    # 3-hour rainfall contribution
    rain3h_contrib = 0
    if rainfall_3h and rainfall_3h > 0:
        rain3h_contrib = rainfall_3h * 2.0

    moisture = (base + humidity_contrib + rain3h_contrib) * temp_factor

    # Clamp to realistic range
    return max(100, min(2000, round(moisture)))


def compute_rainfall_trend(current_rainfall, rainfall_3h):
    """
    Compute rainfall trend indicator.

    Returns a value between -1 (decreasing) and 1 (increasing).
    """
    if rainfall_3h is None or rainfall_3h == 0:
        return 0.0

    # If current 1h rain is > 1/3 of 3h total → rain is intensifying
    expected_per_hour = rainfall_3h / 3.0
    if expected_per_hour == 0:
        return 0.0

    ratio = current_rainfall / expected_per_hour
    trend = max(-1.0, min(1.0, (ratio - 1.0)))
    return round(trend, 2)


def build_feature_vector(weather_data, zone_data):
    """
    Build the feature vector expected by the ML model.

    Features (in order): rainfall, soil_moisture, humidity, temperature, slope
    """
    rainfall = weather_data.get('rainfall_mm', 0)
    humidity = weather_data.get('humidity_pct', 0)
    temperature = weather_data.get('temperature_c', 0)
    rainfall_3h = weather_data.get('rainfall_3h', 0)

    soil_moisture = compute_soil_moisture(rainfall, humidity, temperature, rainfall_3h)
    slope = zone_data.get('slope_angle', 25)

    return {
        'rainfall': rainfall,
        'soil_moisture': soil_moisture,
        'humidity': humidity,
        'temperature': temperature,
        'slope': slope,
    }
