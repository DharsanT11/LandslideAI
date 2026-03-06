import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-logo">
                <div className="navbar-logo-icon">🛡️</div>
                <span>LandslideAI</span>
            </NavLink>

            <button
                className="navbar-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
                <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
                <li><NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink></li>
                <li><NavLink to="/map" onClick={() => setMenuOpen(false)}>Risk Map</NavLink></li>
                <li><NavLink to="/alerts" onClick={() => setMenuOpen(false)}>Alerts</NavLink></li>
                <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
            </ul>

            <div className="navbar-status">
                <span className="status-dot"></span>
                <span>System Active</span>
            </div>
        </nav>
    )
}

export default Navbar
