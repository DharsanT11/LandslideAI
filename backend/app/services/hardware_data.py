"""
Service to hold real-time hardware sensor readings in memory.
Currently supports storing latest soil moisture readings from ESP32 for specific zones.
Maintains a rolling history buffer for live charting.
"""
from collections import deque
from datetime import datetime

# In-memory dictionary mapping zone_id to latest hardware reading
_hardware_readings = {}

# Rolling history buffer: zone_id -> deque of readings (max 100 per zone)
_hardware_history = {}
_HISTORY_MAX = 100


def update_hardware_reading(zone_id: int, soil_moisture: float) -> dict:
    """Store the latest hardware reading for a given zone and append to history."""
    timestamp = datetime.utcnow().isoformat()
    reading = {
        'zone_id': zone_id,
        'soil_moisture': soil_moisture,
        'timestamp': timestamp,
        'source': 'ESP32_Hardware'
    }
    _hardware_readings[zone_id] = reading

    # Append to rolling history
    if zone_id not in _hardware_history:
        _hardware_history[zone_id] = deque(maxlen=_HISTORY_MAX)
    _hardware_history[zone_id].append({
        'soil_moisture': soil_moisture,
        'timestamp': timestamp,
    })

    print(f"  📡 Hardware Update: Zone {zone_id} | Moisture: {soil_moisture}%")
    return reading


def get_hardware_reading(zone_id: int) -> dict:
    """Retrieve the latest hardware reading for a zone, if it exists."""
    return _hardware_readings.get(zone_id)


def get_all_hardware_readings() -> dict:
    """Return all current hardware readings."""
    return _hardware_readings


def get_hardware_history(zone_id: int = None) -> dict:
    """Return the rolling history buffer.
    If zone_id is given, return only that zone's history.
    Otherwise return all zones' history.
    """
    if zone_id is not None:
        history = _hardware_history.get(zone_id, deque())
        return {zone_id: list(history)}
    return {zid: list(dq) for zid, dq in _hardware_history.items()}
