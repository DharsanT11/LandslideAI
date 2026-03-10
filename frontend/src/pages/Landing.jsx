import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'

/* ── Inline SVG Icon Components ─────────────────────────── */

const IconMonitor = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20v-6M6 20h12M2 4h20v12H2z" />
        <circle cx="12" cy="10" r="2" />
    </svg>
)

const IconBrain = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 1 4.5 2.8A4 4 0 0 1 20 9a4 4 0 0 1-1.5 3.1A5 5 0 0 1 12 22a5 5 0 0 1-6.5-9.9A4 4 0 0 1 4 9a4 4 0 0 1 3.5-4.2A5 5 0 0 1 12 2z" />
        <path d="M12 2v20" />
    </svg>
)

const IconMap = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3V6z" />
        <path d="M8 3v15M16 6v15" />
    </svg>
)

const IconRoute = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H12" />
    </svg>
)

const IconAlert = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

const IconChip = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" />
    </svg>
)

const IconCloud = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
)

const IconGlobe = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

const IconBarChart = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
)

const IconCpu = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18L18 6M6 6l12 12" />
        <circle cx="12" cy="12" r="9" />
    </svg>
)

/* ── Data ────────────────────────────────────────────────── */

const features = [
    {
        Icon: IconMonitor,
        title: 'Real-Time Monitoring',
        desc: 'Continuous environmental data collection from IoT sensors deployed across critical terrain zones.',
        accent: '#3b82f6',
    },
    {
        Icon: IconBrain,
        title: 'AI Prediction',
        desc: 'Machine learning models analyze multi-dimensional data to predict landslide probability with high accuracy.',
        accent: '#8b5cf6',
    },
    {
        Icon: IconMap,
        title: 'Risk Heatmaps',
        desc: 'Interactive geospatial mapping showing real-time risk zones with color-coded severity levels.',
        accent: '#06b6d4',
    },
    {
        Icon: IconRoute,
        title: 'Safe Routes',
        desc: 'Intelligent route recommendations that automatically avoid high-risk zones for logistics and personnel.',
        accent: '#22c55e',
    },
    {
        Icon: IconAlert,
        title: 'Early Warnings',
        desc: 'Proactive alert system with time-window predictions and actionable recommendations for decision makers.',
        accent: '#f59e0b',
    },
]

const technologies = [
    { Icon: IconChip, name: 'IoT Sensors', desc: 'ESP32 +' + ' Soil Moisture Sensor' },
    { Icon: IconCpu, name: 'Machine Learning', desc: 'RF + GBT Ensemble' },
    { Icon: IconCloud, name: 'Weather APIs', desc: 'OpenWeatherMap' },
    { Icon: IconGlobe, name: 'Geospatial', desc: 'Leaflet + CARTO' },
    { Icon: IconBarChart, name: 'Dashboards', desc: 'React + Recharts' },
]

const stats = [
    { value: '24/7', label: 'Monitoring' },
    { value: '99.8%', label: 'Model Accuracy' },
    { value: '5', label: 'Active Zones' },
    { value: '<30s', label: 'Refresh Cycle' },
]

/* ── Animated Background Grid ───────────────────────────── */
function GridBackground() {
    return (
        <div className="lp-grid-bg" aria-hidden="true">
            {/* Vertical lines */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={`v${i}`}
                    className="lp-grid-line lp-grid-v"
                    style={{ left: `${(i + 1) * (100 / 13)}%` }}
                />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={`h${i}`}
                    className="lp-grid-line lp-grid-h"
                    style={{ top: `${(i + 1) * (100 / 9)}%` }}
                />
            ))}
            {/* Glow orbs */}
            <div className="lp-orb lp-orb-1" />
            <div className="lp-orb lp-orb-2" />
            <div className="lp-orb lp-orb-3" />
        </div>
    )
}

/* ── Floating Metric Card (hero side element) ───────────── */
function FloatingMetrics() {
    const [pulse, setPulse] = useState(false)
    useEffect(() => {
        const t = setInterval(() => setPulse(p => !p), 2000)
        return () => clearInterval(t)
    }, [])

    return (
        <motion.div
            className="lp-float-panel"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
        >
            <div className="lp-float-header">
                <span className={`lp-float-dot ${pulse ? 'pulse' : ''}`} />
                LIVE SYSTEM STATUS
            </div>
            <div className="lp-float-row">
                <span className="lp-float-label">Rainfall</span>
                <span className="lp-float-val">12.4 mm</span>
            </div>
            <div className="lp-float-row">
                <span className="lp-float-label">Humidity</span>
                <span className="lp-float-val">78%</span>
            </div>
            <div className="lp-float-row">
                <span className="lp-float-label">Soil Moisture</span>
                <span className="lp-float-val">862</span>
            </div>
            <div className="lp-float-row">
                <span className="lp-float-label">Risk Level</span>
                <span className="lp-float-val lp-risk-low">LOW</span>
            </div>
            <div className="lp-float-note">AI Probability: 18%</div>
        </motion.div>
    )
}

/* ── Main Landing Component ──────────────────────────────── */
function Landing() {
    return (
        <div className="lp">
            {/* ── Hero ───────────────────────────────────────── */}
            <section className="lp-hero">
                <GridBackground />

                <div className="lp-hero-inner">
                    <motion.div
                        className="lp-hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="lp-title">
                            AI-Based Landslide
                            <span className="lp-title-accent"> Early Warning </span>
                            System
                        </h1>

                        <p className="lp-desc">
                            An advanced predictive monitoring platform that leverages IoT sensors
                            and machine learning to protect critical infrastructure — mountain highways,
                            defense routes, and strategic logistics corridors — from landslide disasters.
                        </p>

                        <div className="lp-actions">
                            <Link to="/dashboard" className="lp-btn-primary">
                                Open Dashboard
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link to="/about" className="lp-btn-ghost">
                                Learn More
                            </Link>
                        </div>
                    </motion.div>

                    <FloatingMetrics />
                </div>

                {/* Stats strip */}
                <motion.div
                    className="lp-stats-strip"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    {stats.map((s, i) => (
                        <div key={i} className="lp-stat">
                            <span className="lp-stat-val">{s.value}</span>
                            <span className="lp-stat-label">{s.label}</span>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ── Features ─────────────────────────────────── */}
            <section className="lp-section">
                <motion.div
                    className="lp-section-head"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <span className="lp-section-tag">Capabilities</span>
                    <h2>Everything You Need for Disaster Monitoring</h2>
                    <p>End-to-end platform from sensor data ingestion to actionable intelligence</p>
                </motion.div>

                <div className="lp-features">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            className="lp-feat-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <div className="lp-feat-icon" style={{ '--accent': f.accent }}>
                                <f.Icon />
                            </div>
                            <div className="lp-feat-body">
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Technology ───────────────────────────────── */}
            <section className="lp-section lp-section-dark">
                <motion.div
                    className="lp-section-head"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <span className="lp-section-tag">Technology</span>
                    <h2>Built With Modern Infrastructure</h2>
                    <p>Reliable, battle-tested technologies powering every layer of the system</p>
                </motion.div>

                <div className="lp-tech-row">
                    {technologies.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="lp-tech-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="lp-tech-icon-wrap">
                                <t.Icon />
                            </div>
                            <span className="lp-tech-name">{t.name}</span>
                            <span className="lp-tech-sub">{t.desc}</span>
                            {i < technologies.length - 1 && <div className="lp-tech-connector" />}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────── */}
            <section className="lp-cta-section">
                <motion.div
                    className="lp-cta-box"
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2>Ready to Monitor Your Infrastructure?</h2>
                    <p>
                        Access real-time risk predictions, interactive maps, and AI-powered
                        alerts — all from a single dashboard.
                    </p>
                    <Link to="/dashboard" className="lp-btn-primary lp-btn-lg">
                        Launch Command Center
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            </section>

            {/* ── Footer ───────────────────────────────────── */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <div className="lp-footer-logo">
                            <div className="navbar-logo-icon" style={{ width: 28, height: 28, fontSize: '0.9rem', borderRadius: 6 }}>
                                <ShieldAlert size={18} color="#1A2B3B" />
                            </div>
                            <strong>LandslideAI</strong>
                        </div>
                        <p>
                            AI-Based Landslide Early Warning System for Strategic Infrastructure.
                            Integrating IoT, ML, and geospatial intelligence.
                        </p>
                    </div>
                    <div className="lp-footer-links">
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/map">Risk Map</Link>
                        <Link to="/alerts">Alerts</Link>
                        <Link to="/about">About</Link>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <span>© 2026 LandslideAI</span>
                    <span>Built with React • Leaflet • Recharts • scikit-learn</span>
                </div>
            </footer>
        </div>
    )
}

export default Landing
