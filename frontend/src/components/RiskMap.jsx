import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import { renderToString } from 'react-dom/server'
import { Radio, Warehouse, Route, ShieldHalf, Tent, CloudSun } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const iconComponents = {
    'radio': <Radio size={16} color="#3b82f6" />,
    'warehouse': <Warehouse size={16} color="#f59e0b" />,
    'route': <Route size={16} color="#10b981" />,
    'shield-half': <ShieldHalf size={16} color="#ef4444" />,
    'tent': <Tent size={16} color="#8b5cf6" />,
    'cloud-sun': <CloudSun size={16} color="#0ea5e9" />,
}

function createLucideIcon(iconName) {
    const iconComponent = iconComponents[iconName] || <Radio size={16} color="#3b82f6" />
    const iconHtml = renderToString(iconComponent)
    return L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(15, 22, 41, 0.95); border: 1px solid rgba(148, 163, 184, 0.3); border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">${iconHtml}</div>`,
        className: 'custom-lucide-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    })
}

function RiskMap({ zones = [], markers = [] }) {
    const defaultCenter = [11.2743, 77.6049]
    const defaultZoom = 12

    return (
        <div className="map-container" style={{ position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />

                {/* Risk zone circles */}
                {zones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={zone.center}
                        radius={zone.radius}
                        pathOptions={{
                            color: zone.color,
                            fillColor: zone.color,
                            fillOpacity: 0.2,
                            weight: 2,
                            opacity: 0.7,
                        }}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                                <strong>{zone.name}</strong><br />
                                Risk Level: <span style={{ color: zone.color, fontWeight: 700, textTransform: 'uppercase' }}>
                                    {zone.risk}
                                </span>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* Infrastructure markers */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={createLucideIcon(marker.icon)}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                                <strong>{marker.name}</strong><br />
                                Type: {marker.type}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend overlay */}
            <div className="map-legend">
                <h4>Risk Levels</h4>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#22c55e' }}></div>
                    Safe Zone
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#f59e0b' }}></div>
                    Moderate Risk
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#ef4444' }}></div>
                    High Risk
                </div>
                <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>Infrastructure</h4>
                <div className="legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Radio size={14} color="#3b82f6" /> Radar Station</div>
                <div className="legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Warehouse size={14} color="#f59e0b" /> Logistics Base</div>
                <div className="legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Route size={14} color="#10b981" /> Supply Route</div>
                <div className="legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Tent size={14} color="#8b5cf6" /> Emergency Shelter</div>
            </div>
        </div>
    )
}

export default RiskMap
