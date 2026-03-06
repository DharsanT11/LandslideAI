import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createEmojiIcon(emoji) {
    return L.divIcon({
        html: `<div style="font-size: 1.5rem; text-align: center; line-height: 1;">${emoji}</div>`,
        className: 'emoji-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    })
}

function RiskMap({ zones = [], markers = [] }) {
    const defaultCenter = [34.08, 74.79]
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
                        icon={createEmojiIcon(marker.icon)}
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
                <h4 style={{ marginTop: '12px' }}>Infrastructure</h4>
                <div className="legend-item">📡 Radar Station</div>
                <div className="legend-item">🏗️ Logistics Base</div>
                <div className="legend-item">🛣️ Supply Route</div>
                <div className="legend-item">🏥 Emergency Shelter</div>
            </div>
        </div>
    )
}

export default RiskMap
