import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import { Radio, Wifi, WifiOff, Droplets, Activity, RefreshCw } from 'lucide-react'
import { fetchHardwareHistory, fetchHardwareStatus } from '../services/api'

const ZONE_COLORS = {
    1: '#3b82f6',
    2: '#10b981',
    3: '#f59e0b',
    4: '#8b5cf6',
    5: '#ef4444',
}

const ZONE_NAMES = {
    1: 'NH-44 Highway',
    2: 'Mountain Pass',
    3: 'Valley Route',
    4: 'Defense Post',
    5: 'Bridge Zone',
}

const POLL_INTERVAL = 5000

function LiveMonitoringPage() {
    const [history, setHistory] = useState({})
    const [status, setStatus] = useState({ active_hardware_zones: 0, readings: {} })
    const [selectedZone, setSelectedZone] = useState('ALL')
    const [lastUpdate, setLastUpdate] = useState(null)

    const refresh = useCallback(async () => {
        const zoneId = selectedZone === 'ALL' ? null : parseInt(selectedZone)
        const [histData, statusData] = await Promise.all([
            fetchHardwareHistory(zoneId),
            fetchHardwareStatus(),
        ])
        setHistory(histData)
        setStatus(statusData)
        setLastUpdate(new Date())
    }, [selectedZone])

    useEffect(() => {
        refresh()
        const timer = setInterval(refresh, POLL_INTERVAL)
        return () => clearInterval(timer)
    }, [refresh])

    // Build chart data: merge all zone histories into a unified timeline
    const chartData = buildChartData(history)
    const activeZones = Object.keys(history).map(Number)
    const hasData = chartData.length > 0

    const formatTime = (ts) => {
        if (!ts) return ''
        const d = new Date(ts)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(15, 22, 41, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.8rem',
                }}>
                    <div style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</div>
                    {payload.map((entry) => (
                        <div key={entry.name} style={{
                            color: entry.color,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: 2,
                        }}>
                            <Droplets size={12} />
                            {entry.name}: {entry.value?.toFixed(1)}%
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Radio size={36} color="#3b82f6" /> Live Sensor Monitoring
                </h1>
                <p>Real-time hardware sensor data from ESP32 nodes — auto-refreshing every 5 seconds</p>
            </motion.div>

            {/* Controls Bar */}
            <motion.div
                className="filter-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                        <label>Zone Filter: </label>
                        <select
                            className="filter-select"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                        >
                            <option value="ALL">All Zones</option>
                            {[1, 2, 3, 4, 5].map(z => (
                                <option key={z} value={z}>Zone {z} — {ZONE_NAMES[z]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="live-monitoring-badge">
                        <span className="live-dot"></span> LIVE
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={14} />
                        {lastUpdate ? `Last: ${formatTime(lastUpdate.toISOString())}` : 'Waiting...'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {status.active_hardware_zones} active sensor{status.active_hardware_zones !== 1 ? 's' : ''}
                    </span>
                </div>
            </motion.div>

            {/* Status Cards */}
            <motion.div
                className="live-status-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {[1, 2, 3, 4, 5].map(zoneId => {
                    const reading = status.readings?.[zoneId]
                    const isOnline = !!reading
                    return (
                        <div key={zoneId} className={`live-status-card ${isOnline ? 'online' : 'offline'}`}>
                            <div className="live-status-header">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isOnline
                                        ? <Wifi size={14} color="#10b981" />
                                        : <WifiOff size={14} color="#475569" />
                                    }
                                    Zone {zoneId}
                                </span>
                                <span className={`live-status-dot ${isOnline ? 'active' : ''}`}></span>
                            </div>
                            <div className="live-status-name">{ZONE_NAMES[zoneId]}</div>
                            {isOnline ? (
                                <>
                                    <div className="live-status-value">
                                        <Droplets size={16} color={ZONE_COLORS[zoneId]} />
                                        {reading.soil_moisture?.toFixed(1)}%
                                    </div>
                                    <div className="live-status-time">
                                        {formatTime(reading.timestamp)}
                                    </div>
                                </>
                            ) : (
                                <div className="live-status-offline">No data received</div>
                            )}
                        </div>
                    )
                })}
            </motion.div>

            {/* Live Chart */}
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: '1.5rem' }}
            >
                <div className="card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="#3b82f6" /> Soil Moisture — Live Graph
                    </h3>
                    <span className="card-badge badge-live">
                        <span className="live-dot" style={{ marginRight: 4 }}></span>
                        Real-Time
                    </span>
                </div>

                {hasData ? (
                    <div className="live-chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#64748b"
                                    fontSize={11}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }}
                                />
                                {activeZones.map(zoneId => (
                                    <Line
                                        key={zoneId}
                                        type="monotone"
                                        dataKey={`Zone ${zoneId}`}
                                        stroke={ZONE_COLORS[zoneId] || '#3b82f6'}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 5, strokeWidth: 2 }}
                                        connectNulls={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <motion.div
                        className="live-empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="live-empty-icon">📡</div>
                        <div className="live-empty-title">Waiting for Hardware Data</div>
                        <div className="live-empty-desc">
                            Connect your ESP32 sensor and push data to<br />
                            <code>POST /api/esp32/moisture</code> to see live soil moisture graphs.<br />
                            The chart will auto-update every 5 seconds.
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

/**
 * Merge per-zone history arrays into a single timeline for recharts.
 * Each entry: { time: "HH:MM:SS", "Zone 1": 45.5, "Zone 3": 62.1, ... }
 */
function buildChartData(history) {
    const timeMap = {}

    for (const [zoneId, readings] of Object.entries(history)) {
        if (!Array.isArray(readings)) continue
        for (const r of readings) {
            const t = new Date(r.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
            if (!timeMap[t]) timeMap[t] = { time: t, _ts: new Date(r.timestamp).getTime() }
            timeMap[t][`Zone ${zoneId}`] = r.soil_moisture
        }
    }

    return Object.values(timeMap).sort((a, b) => a._ts - b._ts)
}

export default LiveMonitoringPage
