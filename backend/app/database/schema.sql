-- Landslide Early Warning System Database Schema

CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER NOT NULL,
    zone_name TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    rainfall_mm REAL,
    humidity_pct REAL,
    temperature_c REAL,
    soil_moisture REAL,
    slope_angle REAL,
    elevation_m REAL,
    wind_speed REAL,
    weather_desc TEXT,
    rainfall_3h REAL,
    data_source TEXT DEFAULT 'openweathermap'
);

CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER NOT NULL,
    zone_name TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    risk_level TEXT NOT NULL,
    probability REAL NOT NULL,
    rainfall_mm REAL,
    humidity_pct REAL,
    soil_moisture REAL,
    slope_angle REAL
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER NOT NULL,
    zone_name TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    risk_level TEXT NOT NULL,
    probability REAL NOT NULL,
    recommendation TEXT,
    is_active INTEGER DEFAULT 1,
    resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_readings_zone ON sensor_readings(zone_id);
CREATE INDEX IF NOT EXISTS idx_readings_ts ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_zone ON alerts(zone_id);
CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
