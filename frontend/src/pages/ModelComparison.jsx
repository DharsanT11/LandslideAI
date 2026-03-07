import { motion } from 'framer-motion'
import { Brain, Trees, Layers, GitMerge, AlertCircle, RefreshCw } from 'lucide-react'
import useSensorData from '../hooks/useSensorData'

function ModelComparison() {
    const { prediction, loading, backendStatus } = useSensorData()

    if (backendStatus === 'offline' || backendStatus === 'error') {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>Connection Error</h3>
                    <p style={{ color: '#94a3b8' }}>Backend is {backendStatus}.</p>
                </div>
            </div>
        )
    }

    if (loading || !prediction || !prediction.zones || prediction.zones.length === 0) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <RefreshCw size={32} className="text-accent" />
                </motion.div>
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Calculating AI Model Consensus...</div>
            </div>
        )
    }

    // Use the first prediction record (either custom location or Zone 1) for the breakdown
    const primaryPrediction = prediction?.zones?.[0] || {}
    const breakdown = primaryPrediction?.model_breakdown || { rf: 0, gbt: 0, mlp: 0 }

    // Calculate final probability (which should match primaryPrediction.probability but we recalculate for animation purposes if needed)
    const finalProb = primaryPrediction?.probability || 0

    // Ensure we handle missing breakdown gracefully (e.g. if backend hasn't updated yet)
    const hasBreakdown = Object.keys(breakdown).length > 0 && breakdown.rf !== undefined && primaryPrediction.risk_level

    const models = [
        {
            id: 'rf',
            name: 'Random Forest',
            type: 'Tree Ensemble',
            icon: <Trees size={24} color="#10b981" />,
            color: '#10b981',
            prob: breakdown.rf || 0,
            desc: 'A robust baseline model that builds multiple decision trees to prevent overfitting.'
        },
        {
            id: 'gbt',
            name: 'Gradient Boosting',
            type: 'Sequential Boosting',
            icon: <Layers size={24} color="#3b82f6" />,
            color: '#3b82f6',
            prob: breakdown.gbt || 0,
            desc: 'An extremely fast, highly optimized gradient boosting algorithm built for structured tabular data.'
        },
        {
            id: 'mlp',
            name: 'Multi-Layer Perceptron',
            type: 'Neural Network',
            icon: <Brain size={24} color="#8b5cf6" />,
            color: '#8b5cf6',
            prob: breakdown.mlp || 0,
            desc: 'A deep learning structure (32 hidden neurons) that captures highly complex, non-linear relationships.'
        }
    ]

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GitMerge size={36} color="#eab308" /> AI Model Ensemble Comparison
                </h1>
                <p>Real-time probability breakdown from the three individual algorithms before final voting.</p>
                <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Current Target: <strong>{primaryPrediction?.zone_name || 'Loading...'}</strong>
                </div>
            </motion.div>

            {!hasBreakdown && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b' }}>
                        <AlertCircle size={24} />
                        <span><strong>Model breakdown unavailable.</strong> The backend may still be restarting or training the new ensemble. Try refreshing in a moment.</span>
                    </div>
                </motion.div>
            )}

            {hasBreakdown && (
                <>
                    {/* Final Ensemble Decision Card */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            marginBottom: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.8) 100%)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            boxShadow: '0 0 30px rgba(234, 179, 8, 0.1)'
                        }}
                    >
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#eab308', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Final Voting Classifier Consensus
                        </h3>
                        <div style={{
                            fontSize: '4.5rem',
                            fontWeight: 800,
                            lineHeight: 1,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {finalProb.toFixed(1)}%
                        </div>
                        <div className={`risk-tag risk-tag-${(primaryPrediction.risk_level || 'LOW').toLowerCase()}`} style={{ fontSize: '1rem', padding: '6px 20px', marginTop: '0.5rem' }}>
                            {primaryPrediction.risk_level || 'WAITING'} RISK
                        </div>
                        <p style={{ marginTop: '1.5rem', maxWidth: '600px', color: '#94a3b8', fontSize: '0.9rem' }}>
                            The final prediction is generated using a "Soft Voting" mechanism. The ensemble averages the probability outputs from all three baseline models to form a robust, highly-accurate final conclusion.
                        </p>
                    </motion.div>

                    {/* Individual Models Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {models.map((model, i) => (
                            <motion.div
                                key={model.id}
                                className="glass-card"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                style={{ position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '4px',
                                    height: '100%',
                                    backgroundColor: model.color
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{model.name}</h3>
                                        <div style={{ fontSize: '0.8rem', color: model.color, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                            {model.type}
                                        </div>
                                    </div>
                                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        {model.icon}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{model.prob.toFixed(1)}</div>
                                    <div style={{ color: '#94a3b8', fontWeight: 600 }}>%</div>
                                </div>

                                <div className="risk-probability-bar" style={{ height: '6px', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <div
                                        className="risk-probability-fill"
                                        style={{
                                            width: `${model.prob}%`,
                                            backgroundColor: model.color,
                                            boxShadow: `0 0 10px ${model.color}`
                                        }}
                                    />
                                </div>

                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                    {model.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default ModelComparison
