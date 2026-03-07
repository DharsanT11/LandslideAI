import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import RiskMapPage from './pages/RiskMapPage'
import AlertsPage from './pages/AlertsPage'
import LiveMonitoringPage from './pages/LiveMonitoringPage'
import About from './pages/About'
import { triggerAlertSave } from './services/api'

function App() {
    // Coordinates live here so they survive React Router tab switches
    // but reset on a real browser reload (F5)
    const [lat, setLat] = useState(null)
    const [lon, setLon] = useState(null)

    const handleLocationChange = (newLat, newLon) => {
        setLat(newLat)
        setLon(newLon)
        // One-shot: save alert to history only on explicit user search
        if (newLat != null && newLon != null) {
            triggerAlertSave(newLat, newLon)
        }
    }

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={
                    <Dashboard
                        lat={lat}
                        lon={lon}
                        onLocationChange={handleLocationChange}
                    />
                } />
                <Route path="/map" element={<RiskMapPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </>
    )
}

export default App

