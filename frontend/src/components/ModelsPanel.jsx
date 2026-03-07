import { motion } from 'framer-motion'
import { Brain, Trees, GitMerge, AlertCircle, RefreshCw, Zap } from 'lucide-react'

function ModelsPanel({ prediction }) {
    if (!prediction || !prediction.zones || prediction.zones.length === 0) {
        return (
            <div className="glass-card col-span-6" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '1rem' }}>
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

    const primaryPrediction = prediction?.zones?.[0] || {}
    const breakdown = primaryPrediction?.model_breakdown || { rf: 0, lstm: 0, mlp: 0 }
    const finalProb = primaryPrediction?.probability || 0
    const hasBreakdown = Object.keys(breakdown).length > 0 && breakdown.rf !== undefined && primaryPrediction.risk_level

    const models = [
        {
            id: 'rf',
            name: 'Random Forest',
            type: 'Tree Ensemble',
            icon: <Trees size={18} color="#10b981" />,
            color: '#10b981',
            prob: breakdown.rf || 0,
            desc: 'A robust baseline model that builds multiple decision trees.'
        },
        {
            id: 'lstm',
            name: 'LSTM Network',
            type: 'Sequential Memory',
            icon: <Zap size={18} color="#3b82f6" />,
            color: '#3b82f6',
            prob: breakdown.lstm || 0,
            desc: 'Long Short-Term Memory — learns weather→terrain→trend sequences.'
        },
        {
            id: 'mlp',
            name: 'Multi-Layer Perceptron',
            type: 'Neural Network',
            icon: <Brain size={18} color="#8b5cf6" />,
            color: '#8b5cf6',
            prob: breakdown.mlp || 0,
            desc: 'A deep learning structure (32 hidden neurons).'
        }
    ]

    return (
        <div className="glass-card col-span-6" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitMerge size={18} className="text-warning" /> AI Models Comparison
                </h3>
            </div>

            {!hasBreakdown && (
                <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                    <AlertCircle size={24} />
                    <span><strong>Model breakdown unavailable.</strong> The backend may still be training the ensemble.</span>
                </div>
            )}

            {hasBreakdown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ color: '#eab308', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Final Voting Consensus</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Location: {primaryPrediction?.zone_name || 'Loading...'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{finalProb.toFixed(1)}%</div>
                            <div className={`risk-tag risk-tag-${(primaryPrediction.risk_level || 'LOW').toLowerCase()}`} style={{ display: 'inline-block', fontSize: '0.75rem', padding: '2px 8px' }}>
                                {primaryPrediction.risk_level || 'WAITING'} RISK
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {models.map((model, i) => (
                            <motion.div
                                key={model.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center', gap: '12px' }}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {model.icon}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{model.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{model.prob.toFixed(1)}%</div>
                                    </div>
                                    <div className="risk-probability-bar" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        <div
                                            className="risk-probability-fill"
                                            style={{
                                                width: `${model.prob}%`,
                                                backgroundColor: model.color,
                                                boxShadow: `0 0 8px ${model.color}`
                                            }}
                                        />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{model.desc}</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'right', color: model.color }}>
                                    {model.prob.toFixed(0)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ModelsPanel
