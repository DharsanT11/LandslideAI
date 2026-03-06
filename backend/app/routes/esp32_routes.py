"""Routes for receiving data from physical ESP32 hardware sensors."""
from flask import Blueprint, request, jsonify
from app.services.hardware_data import update_hardware_reading, get_all_hardware_readings

esp32_bp = Blueprint('esp32', __name__)

@esp32_bp.route('/api/esp32/moisture', methods=['POST'])
def receive_moisture_data():
    """
    Endpoint for ESP32 to push real-time soil moisture data.
    Expected JSON payload:
    {
        "zone_id": 1,
        "moisture": 45.5
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"status": "error", "message": "No JSON payload provided"}), 400
            
        zone_id = data.get('zone_id')
        moisture = data.get('moisture')
        
        if zone_id is None or moisture is None:
            return jsonify({"status": "error", "message": "Missing 'zone_id' or 'moisture' in payload"}), 400
            
        # Ensure values are numeric
        zone_id = int(zone_id)
        moisture = float(moisture)
        
        # Clamp moisture between 0 and 100
        moisture = max(0.0, min(100.0, moisture))
        
        # Store reading in memory
        reading = update_hardware_reading(zone_id, moisture)
        
        return jsonify({
            "status": "success",
            "message": f"Successfully updated Zone {zone_id}",
            "data": reading
        }), 200
        
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid data format. Expected numbers."}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@esp32_bp.route('/api/esp32/status', methods=['GET'])
def get_hardware_status():
    """Debugging endpoint to view all currently stored hardware readings."""
    readings = get_all_hardware_readings()
    return jsonify({
        "status": "ok",
        "active_hardware_zones": len(readings),
        "readings": readings
    }), 200
