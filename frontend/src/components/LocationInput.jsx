import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, RotateCcw } from 'lucide-react'

function LocationInput({ onLocationChange, currentLat, currentLon }) {
    const [lat, setLat] = useState(currentLat != null ? currentLat : '')
    const [lon, setLon] = useState(currentLon != null ? currentLon : '')
    const [error, setError] = useState('')

    // Sync internal text fields when parent props change (e.g. after re-mounting)
    useEffect(() => {
        setLat(currentLat != null ? currentLat : '')
        setLon(currentLon != null ? currentLon : '')
    }, [currentLat, currentLon])

    const handleSearch = () => {
        setError('')
        const latNum = parseFloat(lat)
        const lonNum = parseFloat(lon)

        if (isNaN(latNum) || isNaN(lonNum)) {
            setError('Please enter valid numeric values for latitude and longitude.')
            return
        }

        // Exception for Demo Mode
        const isDemo = Math.abs(latNum - 99.99) < 0.01 && Math.abs(lonNum - 99.99) < 0.01

        if (!isDemo) {
            if (latNum < -90 || latNum > 90) {
                setError('Latitude must be between -90 and 90.')
                return
            }
            if (lonNum < -180 || lonNum > 180) {
                setError('Longitude must be between -180 and 180.')
                return
            }
        }

        onLocationChange(latNum, lonNum)
    }

    const handleReset = () => {
        setLat('')
        setLon('')
        setError('')
        onLocationChange(null, null)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch()
    }

    const isActive = currentLat != null && currentLon != null

    return (
        <motion.div
            className="glass-card location-input-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} className="text-accent" /> Location Coordinates
                </h3>
                {isActive && (
                    <span className="card-badge badge-live">● Custom Location</span>
                )}
            </div>
            <div className="location-input-body">
                <div className="location-fields">
                    <div className="location-field">
                        <label htmlFor="lat-input">Latitude</label>
                        <input
                            id="lat-input"
                            type="number"
                            step="any"
                            placeholder="e.g. 34.08"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="location-text-input"
                        />
                    </div>
                    <div className="location-field">
                        <label htmlFor="lon-input">Longitude</label>
                        <input
                            id="lon-input"
                            type="number"
                            step="any"
                            placeholder="e.g. 74.79"
                            value={lon}
                            onChange={(e) => setLon(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="location-text-input"
                        />
                    </div>
                    <div className="location-actions">
                        <button className="location-btn location-btn-primary" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Search size={16} /> Search
                        </button>
                        {isActive && (
                            <button className="location-btn location-btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <RotateCcw size={16} /> Reset
                            </button>
                        )}
                    </div>
                </div>
                {error && (
                    <div className="location-error">{error}</div>
                )}
                {isActive && (
                    <div className="location-active-info">
                        Showing data for <strong>{currentLat.toFixed(4)}°N, {currentLon.toFixed(4)}°E</strong>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default LocationInput
