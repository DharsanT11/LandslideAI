/**
 * API service — fetches real data from the Flask backend.
 *
 * All functions hit the backend REST API which provides:
 * - Real weather data from OpenWeatherMap
 * - ML-powered landslide risk predictions
 * - Database-backed alerts
 *
 * All fetch functions accept optional lat/lon to query a custom location.
 */

const API_BASE = '/api'

/**
 * Build a query string from lat/lon. Returns '' if neither is set.
 */
function locationQuery(lat, lon) {
    if (lat != null && lon != null) {
        return `?lat=${lat}&lon=${lon}`
    }
    return ''
}

// ── Sensor Data ─────────────────────────────────────────

export async function fetchSensorData(lat, lon) {
    try {
        const res = await fetch(`${API_BASE}/sensors${locationQuery(lat, lon)}`)
        const data = await res.json()
        if (data.status === 'ok' && data.summary) {
            return {
                soilMoisture: data.summary.soilMoisture,
                rainfall: data.summary.rainfall,
                humidity: data.summary.humidity,
                temperature: data.summary.temperature,
                slopeAngle: data.summary.slopeAngle,
                timestamp: data.timestamp,
                zones: data.zones || [],
                dataSource: data.data_source,
            }
        }
        return null
    } catch (err) {
        console.error('Sensor API error:', err)
        return null
    }
}

// ── Risk Prediction ─────────────────────────────────────

export async function fetchPrediction(lat, lon) {
    try {
        const res = await fetch(`${API_BASE}/prediction${locationQuery(lat, lon)}`)
        const data = await res.json()
        if (data.status === 'ok' && data.overall) {
            return {
                riskLevel: data.overall.riskLevel,
                probability: data.overall.probability,
                highestRiskZone: data.overall.highestRiskZone,
                zones: data.zones || [],
                model: data.model,
            }
        }
        return null
    } catch (err) {
        console.error('Prediction API error:', err)
        return null
    }
}

// ── Forecast ────────────────────────────────────────────

export async function fetchForecast(lat, lon) {
    try {
        const res = await fetch(`${API_BASE}/forecast${locationQuery(lat, lon)}`)
        const data = await res.json()
        if (data.status === 'ok' && data.timeline) {
            return data.timeline.map((step) => ({
                time: step.time,
                hours: step.hours,
                risk: step.risk,
                level: step.level,
                rainfall: step.rainfall_mm,
                humidity: step.humidity_pct,
                temperature: step.temperature_c,
            }))
        }
        return null
    } catch (err) {
        console.error('Forecast API error:', err)
        return null
    }
}

// ── Alerts ──────────────────────────────────────────────

export async function fetchAlerts(lat, lon) {
    try {
        const res = await fetch(`${API_BASE}/alerts${locationQuery(lat, lon)}`)
        const data = await res.json()
        if (data.status === 'ok') {
            return data.alerts.map((alert, i) => ({
                id: alert.id || Date.now() + i,
                level: alert.risk_level,
                location: alert.zone_name,
                timeWindow: 'Next 6 Hours',
                recommendation: alert.recommendation,
                timestamp: alert.timestamp,
            }))
        }
        return []
    } catch (err) {
        console.error('Alerts API error:', err)
        return []
    }
}

/**
 * One-shot call to generate AND save an alert for a location.
 * Only called when user explicitly clicks Search.
 */
export async function triggerAlertSave(lat, lon) {
    try {
        await fetch(`${API_BASE}/alerts?lat=${lat}&lon=${lon}&save=1`)
    } catch (err) {
        // Silent — best effort
    }
}

export async function fetchAlertsHistory(riskLevel = 'ALL', hours = null) {
    try {
        let url = `${API_BASE}/alerts/history?risk_level=${riskLevel}&_t=${Date.now()}`
        if (hours) url += `&hours=${hours}`
        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()
        if (data.status === 'ok') {
            return data.alerts.map((alert, i) => ({
                id: alert.id || `${alert.timestamp}-${i}`, // Guaranteed stable string key
                timestamp: alert.timestamp,
                location: alert.zone_name,
                riskLevel: alert.risk_level,
                action: alert.recommendation,
            }))
        }
        return []
    } catch (err) {
        console.error('Alert history API error:', err)
        return []
    }
}

export async function clearAlertsHistory() {
    try {
        const res = await fetch(`${API_BASE}/alerts/history`, { method: 'DELETE' })
        const data = await res.json()
        return data.status === 'ok'
    } catch (err) {
        console.error('Clear alerts error:', err)
        return false
    }
}

// ── System Health ───────────────────────────────────────

export async function fetchHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`)
        return await res.json()
    } catch (err) {
        return { status: 'error', message: 'Backend unreachable' }
    }
}

// ── Hardware Live Monitoring ────────────────────────────

export async function fetchHardwareHistory(zoneId = null) {
    try {
        let url = `${API_BASE}/esp32/history`
        if (zoneId != null) url += `?zone_id=${zoneId}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.status === 'ok') {
            return data.history
        }
        return {}
    } catch (err) {
        console.error('Hardware history API error:', err)
        return {}
    }
}

export async function fetchHardwareStatus() {
    try {
        const res = await fetch(`${API_BASE}/esp32/status`)
        const data = await res.json()
        if (data.status === 'ok') {
            return data
        }
        return { active_hardware_zones: 0, readings: {} }
    } catch (err) {
        console.error('Hardware status API error:', err)
        return { active_hardware_zones: 0, readings: {} }
    }
}

// ── Static Map Data (unchanged — these are configuration, not API data) ──

export const RISK_ZONES = [
    {
        id: 1,
        name: 'NH-44 Highway Corridor',
        center: [34.08, 74.79],
        radius: 3000,
        risk: 'high',
        color: '#ef4444',
    },
    {
        id: 2,
        name: 'Mountain Pass Zone',
        center: [34.15, 74.85],
        radius: 2500,
        risk: 'medium',
        color: '#f59e0b',
    },
    {
        id: 3,
        name: 'Valley Supply Route',
        center: [34.02, 74.72],
        radius: 2000,
        risk: 'low',
        color: '#22c55e',
    },
    {
        id: 4,
        name: 'Strategic Defense Post',
        center: [34.12, 74.92],
        radius: 2800,
        risk: 'high',
        color: '#ef4444',
    },
    {
        id: 5,
        name: 'Bridge Crossing Zone',
        center: [34.05, 74.68],
        radius: 1500,
        risk: 'medium',
        color: '#f59e0b',
    },
]

export const INFRASTRUCTURE_MARKERS = [
    { id: 1, name: 'Radar Station Alpha', type: 'radar', position: [34.10, 74.82], icon: 'radio' },
    { id: 2, name: 'Military Logistics Base', type: 'base', position: [34.06, 74.75], icon: 'warehouse' },
    { id: 3, name: 'Supply Route Checkpoint', type: 'checkpoint', position: [34.13, 74.88], icon: 'route' },
    { id: 4, name: 'Forward Operating Base', type: 'base', position: [34.18, 74.95], icon: 'shield-half' },
    { id: 5, name: 'Emergency Shelter', type: 'shelter', position: [34.00, 74.70], icon: 'tent' },
    { id: 6, name: 'Weather Station', type: 'weather', position: [34.08, 74.90], icon: 'cloud-sun' },
]
