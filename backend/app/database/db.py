"""SQLite database helper for the Landslide Early Warning System."""
import sqlite3
import os
from datetime import datetime, timedelta


class Database:
    """Simple SQLite wrapper for sensor data, predictions, and alerts."""

    def __init__(self, db_path):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Create tables if they don't exist."""
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            schema = f.read()
        conn = self._get_conn()
        conn.executescript(schema)
        conn.commit()
        conn.close()

    # ── Sensor Readings ──────────────────────────────────────

    def insert_reading(self, data):
        """Insert a sensor reading row."""
        conn = self._get_conn()
        conn.execute(
            '''INSERT INTO sensor_readings
               (zone_id, zone_name, timestamp, rainfall_mm, humidity_pct,
                temperature_c, soil_moisture, slope_angle, elevation_m,
                wind_speed, weather_desc, rainfall_3h, data_source)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                data['zone_id'], data['zone_name'],
                data.get('timestamp', datetime.utcnow().isoformat()),
                data.get('rainfall_mm', 0), data.get('humidity_pct', 0),
                data.get('temperature_c', 0), data.get('soil_moisture', 0),
                data.get('slope_angle', 0), data.get('elevation_m', 0),
                data.get('wind_speed', 0), data.get('weather_desc', ''),
                data.get('rainfall_3h', 0), data.get('data_source', 'openweathermap'),
            )
        )
        conn.commit()
        conn.close()

    def get_latest_readings(self):
        """Get the most recent reading per zone."""
        conn = self._get_conn()
        rows = conn.execute(
            '''SELECT * FROM sensor_readings
               WHERE id IN (
                   SELECT MAX(id) FROM sensor_readings GROUP BY zone_id
               )
               ORDER BY zone_id'''
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_readings_history(self, zone_id=None, hours=24):
        """Get readings from the last N hours."""
        since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        conn = self._get_conn()
        if zone_id:
            rows = conn.execute(
                'SELECT * FROM sensor_readings WHERE zone_id=? AND timestamp>=? ORDER BY timestamp DESC',
                (zone_id, since)
            ).fetchall()
        else:
            rows = conn.execute(
                'SELECT * FROM sensor_readings WHERE timestamp>=? ORDER BY timestamp DESC',
                (since,)
            ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── Predictions ──────────────────────────────────────────

    def insert_prediction(self, data):
        conn = self._get_conn()
        conn.execute(
            '''INSERT INTO predictions
               (zone_id, zone_name, timestamp, risk_level, probability,
                rainfall_mm, humidity_pct, soil_moisture, slope_angle)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                data['zone_id'], data['zone_name'],
                data.get('timestamp', datetime.utcnow().isoformat()),
                data['risk_level'], data['probability'],
                data.get('rainfall_mm', 0), data.get('humidity_pct', 0),
                data.get('soil_moisture', 0), data.get('slope_angle', 0),
            )
        )
        conn.commit()
        conn.close()

    def get_latest_predictions(self):
        conn = self._get_conn()
        rows = conn.execute(
            '''SELECT * FROM predictions
               WHERE id IN (
                   SELECT MAX(id) FROM predictions GROUP BY zone_id
               )
               ORDER BY zone_id'''
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── Alerts ───────────────────────────────────────────────

    def insert_alert(self, data):
        conn = self._get_conn()
        conn.execute(
            '''INSERT INTO alerts
               (zone_id, zone_name, timestamp, risk_level, probability, recommendation)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (
                data['zone_id'], data['zone_name'],
                data.get('timestamp', datetime.utcnow().isoformat()),
                data['risk_level'], data['probability'],
                data.get('recommendation', ''),
            )
        )
        conn.commit()
        conn.close()

    def get_active_alerts(self):
        conn = self._get_conn()
        rows = conn.execute(
            'SELECT * FROM alerts WHERE is_active=1 ORDER BY timestamp DESC LIMIT 20'
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_alerts_history(self, risk_level=None, hours=None):
        conn = self._get_conn()
        query = 'SELECT * FROM alerts WHERE 1=1'
        params = []
        if risk_level and risk_level != 'ALL':
            query += ' AND risk_level=?'
            params.append(risk_level)
        if hours:
            since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
            query += ' AND timestamp>=?'
            params.append(since)
        query += ' ORDER BY timestamp DESC LIMIT 100'
        rows = conn.execute(query, params).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def deactivate_old_alerts(self, hours=24):
        """Mark alerts older than N hours as resolved."""
        cutoff = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        conn = self._get_conn()
        conn.execute(
            'UPDATE alerts SET is_active=0, resolved_at=? WHERE timestamp<? AND is_active=1',
            (datetime.utcnow().isoformat(), cutoff)
        )
        conn.commit()
        conn.close()
