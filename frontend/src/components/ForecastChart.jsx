import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

function ForecastChart({ forecast }) {
    const getDotClass = (level) => {
        if (level === 'High') return 'dot-high'
        if (level === 'Medium') return 'dot-medium'
        return 'dot-low'
    }

    const getRiskColor = (level) => {
        if (level === 'High') return '#ef4444'
        if (level === 'Medium') return '#f59e0b'
        return '#22c55e'
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div style={{
                    background: 'rgba(15, 22, 41, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.8rem',
                }}>
                    <div style={{ color: '#94a3b8', marginBottom: 4 }}>{data.time} ({data.hours}h)</div>
                    <div style={{ color: getRiskColor(data.level), fontWeight: 700, fontSize: '1rem' }}>
                        Risk: {data.risk}% — {data.level}
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="glass-card col-span-6">
            <div className="card-header">
                <h3>📈 Risk Forecast</h3>
                <span className="card-badge badge-live">24H Prediction</span>
            </div>

            {/* Chart */}
            <div className="forecast-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis
                            dataKey="time"
                            stroke="#64748b"
                            fontSize={12}
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
                        <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#riskGradient)"
                            dot={(props) => {
                                const { cx, cy, payload } = props
                                const color = getRiskColor(payload.level)
                                return (
                                    <circle
                                        key={props.index}
                                        cx={cx}
                                        cy={cy}
                                        r={5}
                                        fill={color}
                                        stroke={color}
                                        strokeWidth={2}
                                        strokeOpacity={0.4}
                                    />
                                )
                            }}
                            activeDot={{ r: 7, strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Timeline */}
            <div className="forecast-timeline">
                {forecast.map((step, i) => (
                    <motion.div
                        key={step.time}
                        className="forecast-step"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`forecast-dot ${getDotClass(step.level)}`}>
                            {step.risk}
                        </div>
                        <div className="forecast-label">{step.time}</div>
                        <div className="forecast-risk" style={{ color: getRiskColor(step.level) }}>
                            {step.level}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default ForecastChart
