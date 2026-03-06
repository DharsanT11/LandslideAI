import { motion } from 'framer-motion'

const pipelineSteps = [
    { icon: '📡', label: 'IoT Sensors' },
    { icon: '⚙️', label: 'Data Processing' },
    { icon: '🧠', label: 'Machine Learning' },
    { icon: '📊', label: 'Risk Prediction' },
    { icon: '🖥️', label: 'Dashboard' },
]

const dataSources = [
    { icon: '💧', name: 'Soil moisture sensors (capacitive/resistive)' },
    { icon: '🌧️', name: 'Rainfall gauges — tipping bucket sensors' },
    { icon: '🌦️', name: 'Weather APIs — OpenWeatherMap, IMD' },
    { icon: '🌡️', name: 'Temperature & humidity — DHT22 sensors' },
    { icon: '⛰️', name: 'Terrain datasets — SRTM elevation data' },
    { icon: '📐', name: 'Inclinometers — slope angle measurement' },
]

const modelDetails = [
    { icon: '🌲', name: 'Random Forest classifier for base prediction' },
    { icon: '📈', name: 'Gradient Boosting for improved accuracy' },
    { icon: '🔀', name: 'Ensemble method combining multiple models' },
    { icon: '📊', name: 'Feature engineering: rainfall trends, soil saturation index' },
    { icon: '✅', name: 'Validation: 92% accuracy on test datasets' },
    { icon: '🔄', name: 'Real-time inference with sub-second latency' },
]

const systemPurpose = [
    { icon: '🛡️', title: 'Disaster Prevention', desc: 'Proactive identification of landslide-prone zones before catastrophic events occur, enabling preventive measures and resource allocation.' },
    { icon: '🏗️', title: 'Infrastructure Protection', desc: 'Safeguarding critical infrastructure including highways, defense installations, radar stations, and supply routes from geohazard damage.' },
    { icon: '⚠️', title: 'Early Warning Support', desc: 'Providing actionable intelligence to decision makers with time-window predictions, enabling timely evacuations and route diversions.' },
]

function About() {
    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>📖 About the System</h1>
                <p>System architecture, data sources, AI model details, and mission purpose</p>
            </motion.div>

            {/* Pipeline */}
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '1.5rem' }}
            >
                <div className="card-header">
                    <h3>🔄 System Architecture Pipeline</h3>
                </div>
                <div className="about-pipeline">
                    {pipelineSteps.map((step, i) => (
                        <motion.div
                            key={step.label}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                        >
                            <div className="pipeline-step">
                                <div className="pipeline-icon">{step.icon}</div>
                                <div className="pipeline-label">{step.label}</div>
                            </div>
                            {i < pipelineSteps.length - 1 && (
                                <span className="pipeline-arrow">→</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Detail Sections */}
            <div className="about-sections">
                <motion.div
                    className="about-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3>📡 Data Sources</h3>
                    <ul>
                        {dataSources.map((item) => (
                            <li key={item.name}>
                                <span>{item.icon}</span> {item.name}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div
                    className="about-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>🤖 AI Model</h3>
                    <ul>
                        {modelDetails.map((item) => (
                            <li key={item.name}>
                                <span>{item.icon}</span> {item.name}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {systemPurpose.map((item, i) => (
                    <motion.div
                        key={item.title}
                        className="about-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                    >
                        <h3>{item.icon} {item.title}</h3>
                        <p>{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Credits */}
            <motion.div
                style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    padding: '1.5rem',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    borderTop: '1px solid rgba(148,163,184,0.1)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <p><strong style={{ color: '#94a3b8' }}>AI-Based Landslide Early Warning System for Strategic Infrastructure</strong></p>
                <p style={{ marginTop: '0.5rem' }}>
                    Powered by IoT • Machine Learning • Geospatial Analytics • Real-Time Visualization
                </p>
            </motion.div>
        </div>
    )
}

export default About
