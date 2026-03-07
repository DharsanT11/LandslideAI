import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, ShieldAlert, AlertTriangle, CheckCircle, CheckCircle2, GitMerge } from 'lucide-react'
import { Link } from 'react-router-dom'

function AlertsPanel({ alerts }) {
    const safeAlerts = Array.isArray(alerts) ? alerts : []

    const getAlertClass = (level) => {
        if (level === 'HIGH') return 'alert-high'
        if (level === 'MEDIUM') return 'alert-medium'
        return 'alert-low'
    }

    const getAlertIcon = (level) => {
        if (level === 'HIGH') return <ShieldAlert size={16} />
        if (level === 'MEDIUM') return <AlertTriangle size={16} />
        return <CheckCircle size={16} />
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="glass-card col-span-6">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellRing size={18} className="text-accent" />
                    <h3 style={{ margin: 0 }}>Active Alerts</h3>
                    <span className="card-badge badge-warning" style={{ marginLeft: '8px' }}>
                        {safeAlerts.filter(a => a.level === 'HIGH').length} Critical
                    </span>
                </div>

                <Link to="/models" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: '#eab308',
                    background: 'rgba(234, 179, 8, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                }} className="hover:bg-yellow-500/20 hover:border-yellow-500/40">
                    <GitMerge size={14} /> Compare AI Models
                </Link>
            </div>
            <div className="alerts-list">
                <AnimatePresence mode="popLayout">
                    {safeAlerts.length > 0 ? (
                        safeAlerts.map((alert, index) => (
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
                                    <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {getAlertIcon(alert.level)} <span style={{ marginLeft: '4px' }}>{alert.level} LANDSLIDE RISK</span>
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
                        ))
                    ) : (
                        <motion.div
                            className="alerts-empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="alerts-empty-icon" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                                <CheckCircle2 size={48} color="#10b981" strokeWidth={1.5} />
                            </div>
                            <div className="alerts-empty-title">No Active Alerts</div>
                            <div className="alerts-empty-desc">
                                All monitored zones are currently at low risk. Alerts
                                will appear here when HIGH or MEDIUM risk is detected.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AlertsPanel
