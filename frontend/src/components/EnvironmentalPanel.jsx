import { motion } from 'framer-motion'
import { Droplet, CloudRain, Wind, Thermometer, Mountain, Satellite } from 'lucide-react'

function EnvironmentalPanel({ data }) {
    const sensors = [
        {
            icon: <Droplet size={28} color="#3b82f6" strokeWidth={1.5} />,
            label: 'Soil Moisture',
            value: data.soilMoisture,
            unit: 'units',
            status: data.soilMoisture > 1200 ? 'danger' : data.soilMoisture > 800 ? 'warning' : 'normal',
        },
        {
            icon: <CloudRain size={28} color="#8b5cf6" strokeWidth={1.5} />,
            label: 'Rainfall',
            value: data.rainfall,
            unit: 'mm',
            status: data.rainfall > 120 ? 'danger' : data.rainfall > 60 ? 'warning' : 'normal',
        },
        {
            icon: <Wind size={28} color="#cbd5e1" strokeWidth={1.5} />,
            label: 'Humidity',
            value: data.humidity,
            unit: '%',
            status: data.humidity > 85 ? 'danger' : data.humidity > 70 ? 'warning' : 'normal',
        },
        {
            icon: <Thermometer size={28} color="#f43f5e" strokeWidth={1.5} />,
            label: 'Temperature',
            value: data.temperature,
            unit: '°C',
            status: data.temperature < 10 ? 'warning' : 'normal',
        },
        {
            icon: <Mountain size={28} color="#d97706" strokeWidth={1.5} />,
            label: 'Slope Angle',
            value: data.slopeAngle,
            unit: '°',
            status: data.slopeAngle > 40 ? 'danger' : data.slopeAngle > 30 ? 'warning' : 'normal',
        },
    ]

    return (
        <div className="glass-card col-span-8">
            <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Satellite size={18} className="text-accent" /> Environmental Monitoring
                </h3>
                <span className="card-badge badge-live">● Live</span>
            </div>
            <div className="env-panel-grid">
                {sensors.map((sensor, index) => (
                    <motion.div
                        key={sensor.label}
                        className={`sensor-card status-${sensor.status}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="sensor-icon">{sensor.icon}</div>
                        <div className="sensor-label">{sensor.label}</div>
                        <motion.div
                            className="sensor-value"
                            key={sensor.value}
                            initial={{ scale: 1.15, color: '#60a5fa' }}
                            animate={{ scale: 1, color: '#f1f5f9' }}
                            transition={{ duration: 0.4 }}
                        >
                            {sensor.value}
                            <span className="sensor-unit"> {sensor.unit}</span>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default EnvironmentalPanel
