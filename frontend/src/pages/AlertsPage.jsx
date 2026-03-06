import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { fetchAlertsHistory } from '../services/api'

function AlertsPage() {
    const [alerts, setAlerts] = useState([])
    const [riskFilter, setRiskFilter] = useState('ALL')
    const [timeFilter, setTimeFilter] = useState('ALL')
    const [loading, setLoading] = useState(true)

    // Fetch alerts from backend
    useEffect(() => {
        async function loadAlerts() {
            setLoading(true)
            const hoursMap = { '6H': 6, '24H': 24, '3D': 72, '7D': 168 }
            const hours = hoursMap[timeFilter] || null
            const data = await fetchAlertsHistory(riskFilter, hours)
            setAlerts(data)
            setLoading(false)
        }
        loadAlerts()
    }, [riskFilter, timeFilter])

    const formatTimestamp = (ts) => {
        const d = new Date(ts)
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
            ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getRiskTagClass = (level) => {
        if (level === 'HIGH') return 'risk-tag risk-tag-high'
        if (level === 'MEDIUM') return 'risk-tag risk-tag-medium'
        return 'risk-tag risk-tag-low'
    }

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>🚨 Alerts & Monitoring</h1>
                <p>Historical alert log from AI risk predictions — real-time data from backend</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="filter-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div>
                    <label>Risk Level: </label>
                    <select
                        className="filter-select"
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                    >
                        <option value="ALL">All Levels</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
                <div>
                    <label>Time Range: </label>
                    <select
                        className="filter-select"
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                    >
                        <option value="ALL">All Time</option>
                        <option value="6H">Last 6 Hours</option>
                        <option value="24H">Last 24 Hours</option>
                        <option value="3D">Last 3 Days</option>
                        <option value="7D">Last 7 Days</option>
                    </select>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                    {loading ? 'Loading...' : `Showing ${alerts.length} alerts`}
                </div>
            </motion.div>

            {/* Alerts Table */}
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="alerts-table-wrapper">
                    <table className="alerts-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Timestamp</th>
                                <th>Location</th>
                                <th>Risk Level</th>
                                <th>Suggested Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert, i) => (
                                <motion.tr
                                    key={alert.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <td style={{ color: '#475569', fontWeight: 600 }}>{i + 1}</td>
                                    <td>{formatTimestamp(alert.timestamp)}</td>
                                    <td>{alert.location}</td>
                                    <td>
                                        <span className={getRiskTagClass(alert.riskLevel)}>
                                            {alert.riskLevel}
                                        </span>
                                    </td>
                                    <td>{alert.action}</td>
                                </motion.tr>
                            ))}
                            {!loading && alerts.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                                        No alerts match the current filters — alerts generate when risk is detected
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

export default AlertsPage
