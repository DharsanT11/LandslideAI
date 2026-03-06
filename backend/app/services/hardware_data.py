"""
Service to hold real-time hardware sensor readings in memory.
Currently supports storing latest soil moisture readings from ESP32 for specific zones.
"""
from datetime import datetime

# In-memory dictionary mapping zone_id to latest hardware reading
_hardware_readings = {}

def update_hardware_reading(zone_id: int, soil_moisture: float) -> dict:
    """Store the latest hardware reading for a given zone."""
    reading = {
        'zone_id': zone_id,
        'soil_moisture': soil_moisture,
        'timestamp': datetime.utcnow().isoformat(),
        'source': 'ESP32_Hardware'
    }
    _hardware_readings[zone_id] = reading
    print(f"  📡 Hardware Update: Zone {zone_id} | Moisture: {soil_moisture}%")
    return reading

def get_hardware_reading(zone_id: int) -> dict:
    """Retrieve the latest hardware reading for a zone, if it exists."""
    return _hardware_readings.get(zone_id)

def get_all_hardware_readings() -> dict:
    """Return all current hardware readings."""
    return _hardware_readings
