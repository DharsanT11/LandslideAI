import { motion } from 'framer-motion'
import useSensorData from '../hooks/useSensorData'
import EnvironmentalPanel from '../components/EnvironmentalPanel'
import RiskPrediction from '../components/RiskPrediction'
import AlertsPanel from '../components/AlertsPanel'
import ForecastChart from '../components/ForecastChart'

function Dashboard() {
    const { sensorData, prediction, alerts, forecast, loading, backendStatus } = useSensorData(30000)

    // Determine if backend API is connected
    const statusLabel =
        backendStatus === 'live' ? '🟢 Live — ESP32 + OpenWeatherMap' :
            backendStatus === 'no_api_key' ? '🟡 Backend running — API key not configured' :
                backendStatus === 'connecting' ? '⏳ Connecting to backend...' :
                    '🔴 Backend offline'

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>🎛️ Command Center Dashboard</h1>
                <p>Real-time landslide risk monitoring and AI-powered prediction system</p>
            </motion.div>

            {loading ? (
                <motion.div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#64748b',
                        fontSize: '1.1rem',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <div>Connecting to backend and fetching live data...</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#475569' }}>
                        Ensure the Flask backend is running on port 5000
                    </div>
                </motion.div>
            ) : (
                <div className="dashboard-grid">
                    {/* Row 1: Environmental + Risk */}
                    <EnvironmentalPanel data={sensorData} />
                    <RiskPrediction
                        riskLevel={prediction.riskLevel}
                        probability={prediction.probability}
                    />

                    {/* Row 2: Alerts + Forecast */}
                    <AlertsPanel alerts={alerts} />
                    <ForecastChart forecast={forecast} />
                </div>
            )}

            {/* System status bar */}
            <motion.div
                style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(15, 22, 41, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: '#64748b',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <span>
                    {statusLabel} &nbsp;|&nbsp;
                    📡 Last update: {sensorData.timestamp
                        ? new Date(sensorData.timestamp).toLocaleTimeString()
                        : 'Waiting...'
                    }&nbsp;|&nbsp;
                    🔄 Auto-refresh: 30s
                </span>
                <span>
                    AI Model v2.4 • Ensemble: Random Forest + Gradient Boosting
                </span>
            </motion.div>
        </div>
    )
}

export default Dashboard
