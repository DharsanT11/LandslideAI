import { motion, AnimatePresence } from 'framer-motion'

function AlertsPanel({ alerts }) {
    const getAlertClass = (level) => {
        if (level === 'HIGH') return 'alert-high'
        if (level === 'MEDIUM') return 'alert-medium'
        return 'alert-low'
    }

    const getAlertIcon = (level) => {
        if (level === 'HIGH') return '🔴'
        if (level === 'MEDIUM') return '⚠️'
        return '✅'
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="glass-card col-span-6">
            <div className="card-header">
                <h3>🚨 Active Alerts</h3>
                <span className="card-badge badge-warning">
                    {alerts.filter(a => a.level === 'HIGH').length} Critical
                </span>
            </div>
            <div className="alerts-list">
                <AnimatePresence mode="popLayout">
                    {alerts.map((alert, index) => (
                        <motion.div
                            key={alert.id}
                            className={`alert-item ${getAlertClass(alert.level)}`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            layout
                        >
                            <div className="alert-header">
                                <div className="alert-title">
                                    {getAlertIcon(alert.level)} {alert.level} LANDSLIDE RISK
                                </div>
                                <div className="alert-time">{formatTime(alert.timestamp)}</div>
                            </div>
                            <div className="alert-body">
                                <span>📍 Location: {alert.location}</span>
                                <span>⏱️ Time Window: {alert.timeWindow}</span>
                            </div>
                            <div className="alert-recommendation">
                                💡 {alert.recommendation}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AlertsPanel
