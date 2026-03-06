import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import RiskMapPage from './pages/RiskMapPage'
import AlertsPage from './pages/AlertsPage'
import About from './pages/About'

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<RiskMapPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </>
    )
}

export default App
