import { motion } from 'framer-motion'

function RiskPrediction({ riskLevel, probability }) {
    const riskClass =
        riskLevel === 'HIGH' ? 'risk-high' :
            riskLevel === 'MEDIUM' ? 'risk-medium' : 'risk-low'

    const fillClass =
        riskLevel === 'HIGH' ? 'fill-high' :
            riskLevel === 'MEDIUM' ? 'fill-medium' : 'fill-low'

    const riskIcon =
        riskLevel === 'HIGH' ? '🔴' :
            riskLevel === 'MEDIUM' ? '🟡' : '🟢'

    const riskColor =
        riskLevel === 'HIGH' ? '#ef4444' :
            riskLevel === 'MEDIUM' ? '#f59e0b' : '#22c55e'

    return (
        <div className="glass-card col-span-4">
            <div className="card-header">
                <h3>🤖 AI Risk Prediction</h3>
                <span className={`card-badge ${riskLevel === 'HIGH' ? 'badge-danger' : riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-live'}`}>
                    {riskLevel}
                </span>
            </div>
            <div className="risk-display">
                <motion.div
                    className={`risk-level-badge ${riskClass}`}
                    key={riskLevel}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    {riskIcon} {riskLevel} RISK
                </motion.div>

                <div className="risk-probability">
                    <div className="risk-probability-label">Landslide Probability</div>
                    <div className="risk-probability-bar">
                        <motion.div
                            className={`risk-probability-fill ${fillClass}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${probability}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <motion.div
                        className="risk-probability-value"
                        style={{ color: riskColor }}
                        key={probability}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {probability}%
                    </motion.div>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                    AI Model: Random Forest + Gradient Boosting Ensemble
                </div>
            </div>
        </div>
    )
}

export default RiskPrediction
