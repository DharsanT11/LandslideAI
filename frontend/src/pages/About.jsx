import { motion } from 'framer-motion'
import {
    Radio, Settings, Brain, BarChart3, LayoutDashboard,
    Droplet, CloudRain, CloudSun, Thermometer, Mountain, Ruler,
    Trees, TrendingUp, GitMerge, ListChecks, Zap,
    Shield, Building2, AlertTriangle, BookOpen, RefreshCw
} from 'lucide-react'

const pipelineSteps = [
    { icon: <Radio size={24} />, label: 'IoT Sensors' },
    { icon: <Settings size={24} />, label: 'Data Processing' },
    { icon: <Brain size={24} />, label: 'Machine Learning' },
    { icon: <BarChart3 size={24} />, label: 'Risk Prediction' },
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard' },
]

const dataSources = [
    { icon: <Droplet size={18} color="#3b82f6" />, name: 'Soil moisture sensors (capacitive/resistive)' },
    { icon: <CloudRain size={18} color="#8b5cf6" />, name: 'Rainfall gauges — tipping bucket sensors' },
    { icon: <CloudSun size={18} color="#0ea5e9" />, name: 'Weather APIs — OpenWeatherMap, IMD' },
    { icon: <Thermometer size={18} color="#f43f5e" />, name: 'Temperature & humidity — DHT22 sensors' },
    { icon: <Mountain size={18} color="#d97706" />, name: 'Terrain datasets — SRTM elevation data' },
    { icon: <Ruler size={18} color="#10b981" />, name: 'Inclinometers — slope angle measurement' },
]

const modelDetails = [
    { icon: <Trees size={18} color="#10b981" />, name: 'Random Forest classifier for base prediction' },
    { icon: <TrendingUp size={18} color="#3b82f6" />, name: 'Gradient Boosting for improved accuracy' },
    { icon: <GitMerge size={18} color="#8b5cf6" />, name: 'Ensemble method combining multiple models' },
    { icon: <BarChart3 size={18} color="#f59e0b" />, name: 'Feature engineering: rainfall trends, soil saturation index' },
    { icon: <ListChecks size={18} color="#22c55e" />, name: 'Validation: 92% accuracy on test datasets' },
    { icon: <Zap size={18} color="#eab308" />, name: 'Real-time inference with sub-second latency' },
]

const systemPurpose = [
    { icon: <Shield size={24} color="#3b82f6" />, title: 'Disaster Prevention', desc: 'Proactive identification of landslide-prone zones before catastrophic events occur, enabling preventive measures and resource allocation.' },
    { icon: <Building2 size={24} color="#3b82f6" />, title: 'Infrastructure Protection', desc: 'Safeguarding critical infrastructure including highways, defense installations, radar stations, and supply routes from geohazard damage.' },
    { icon: <AlertTriangle size={24} color="#3b82f6" />, title: 'Early Warning Support', desc: 'Providing actionable intelligence to decision makers with time-window predictions, enabling timely evacuations and route diversions.' },
]

function About() {
    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BookOpen size={36} color="#3b82f6" /> About the System
                </h1>
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={18} className="text-accent" /> System Architecture Pipeline
                    </h3>
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Radio size={18} className="text-accent" /> Data Sources
                    </h3>
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Brain size={18} className="text-accent" /> AI Model
                    </h3>
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
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            {item.icon} {item.title}
                        </h3>
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
                    color: '#6B7280',
                    borderTop: '1px solid #EDF0F2',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    <a href="/models" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: '#F5F6F7',
                        border: '1px solid #EDF0F2',
                        borderRadius: '8px',
                        color: '#1A2B3B',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}>
                        <Brain size={18} /> View Live AI Model Comparison
                    </a>
                </div>
                <p><strong style={{ color: '#1A2B3B' }}>AI-Based Landslide Early Warning System for Strategic Infrastructure</strong></p>
                <p style={{ marginTop: '0.5rem' }}>
                    Powered by IoT • Machine Learning • Geospatial Analytics • Real-Time Visualization
                </p>
            </motion.div>
        </div >
    )
}

export default About
