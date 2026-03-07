import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Loader2, XCircle, MapPin, LayoutDashboard, Radio, RefreshCw } from 'lucide-react'
import useSensorData from '../hooks/useSensorData'
import LocationInput from '../components/LocationInput'
import EnvironmentalPanel from '../components/EnvironmentalPanel'
import RiskPrediction from '../components/RiskPrediction'
import ModelsPanel from '../components/ModelsPanel'
import ForecastChart from '../components/ForecastChart'

function Dashboard({ lat, lon, onLocationChange }) {
    const { sensorData, prediction, alerts, forecast, loading, backendStatus } = useSensorData(30000, lat, lon)

    // Determine if backend API is connected
    const statusLabel =
        backendStatus === 'live' ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} color="#10b981" /> Live — ESP32 + OpenWeatherMap</span> :
            backendStatus === 'no_api_key' ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} color="#f59e0b" /> Backend running — API key not configured</span> :
                backendStatus === 'connecting' ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Loader2 size={14} className="spin" /> Connecting to backend...</span> :
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><XCircle size={14} color="#ef4444" /> Backend offline</span>

    const locationLabel = lat != null && lon != null
        ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Custom: {lat.toFixed(4)}, {lon.toFixed(4)}</span>
        : <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Default: Monitored Zones</span>

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LayoutDashboard size={36} color="#3b82f6" /> Command Center Dashboard
                </h1>
                <p>Real-time landslide risk monitoring and AI-powered prediction system</p>
            </motion.div>

            {/* Location Input */}
            <LocationInput
                onLocationChange={onLocationChange}
                currentLat={lat}
                currentLon={lon}
            />

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
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        style={{ display: 'inline-block', marginBottom: '1rem' }}
                    >
                        <Loader2 size={48} color="#3b82f6" />
                    </motion.div>
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

                    {/* Row 2: Models + Forecast */}
                    <ModelsPanel prediction={prediction} />
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
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {statusLabel} <span style={{ opacity: 0.3 }}>|</span>
                    {locationLabel} <span style={{ opacity: 0.3 }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Radio size={14} /> Last update: {sensorData.timestamp
                            ? new Date(sensorData.timestamp).toLocaleTimeString()
                            : 'Waiting...'
                        }
                    </span> <span style={{ opacity: 0.3 }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={14} /> Auto-refresh: 30s
                    </span>
                </span>
                <span>
                    AI Model v3.0 • Ensemble: Random Forest + LSTM + Neural Network
                </span>
            </motion.div>
        </div>
    )
}

export default Dashboard
