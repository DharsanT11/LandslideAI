import { motion } from 'framer-motion'
import { Map as MapIcon } from 'lucide-react'
import RiskMap from '../components/RiskMap'
import { RISK_ZONES, INFRASTRUCTURE_MARKERS } from '../services/api'

function RiskMapPage() {
    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapIcon size={36} color="#3b82f6" /> Landslide Risk Map
                </h1>
                <p>Geospatial risk visualization with infrastructure overlay — zoom and click for details</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <RiskMap zones={RISK_ZONES} markers={INFRASTRUCTURE_MARKERS} />
            </motion.div>
        </div >
    )
}

export default RiskMapPage
