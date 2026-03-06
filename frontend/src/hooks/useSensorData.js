import { useState, useEffect, useCallback } from 'react'
import { fetchSensorData, fetchPrediction, fetchAlerts, fetchForecast, fetchHealth } from '../services/api'

/**
 * Custom hook that polls the backend for real-time data.
 *
 * Fetches sensor readings, ML predictions, alerts, and forecast
 * from the Flask backend (which gets live weather data from OpenWeatherMap).
 */
export function useSensorData(refreshInterval = 30000) {
    const [sensorData, setSensorData] = useState({
        soilMoisture: 0,
        rainfall: 0,
        humidity: 0,
        temperature: 0,
        slopeAngle: 0,
        timestamp: null,
        zones: [],
        dataSource: 'loading...',
    })

    const [prediction, setPrediction] = useState({
        riskLevel: 'LOW',
        probability: 0,
    })

    const [alerts, setAlerts] = useState([])
    const [forecast, setForecast] = useState([])
    const [loading, setLoading] = useState(true)
    const [backendStatus, setBackendStatus] = useState('connecting')


    const refresh = useCallback(async () => {
        try {
            // Check backend health first
            const health = await fetchHealth()

            if (health.status !== 'ok') {
                setBackendStatus('offline')
                return
            }

            setBackendStatus(health.api_configured ? 'live' : 'no_api_key')

            // Fetch all data in parallel
            const [sensors, pred, alertsData, forecastData] = await Promise.all([
                fetchSensorData(),
                fetchPrediction(),
                fetchAlerts(),
                fetchForecast(),
            ])

            if (sensors) {
                setSensorData(sensors)
            }

            if (pred) {
                setPrediction({
                    riskLevel: pred.riskLevel,
                    probability: pred.probability,
                })
            }

            if (alertsData) {
                setAlerts(alertsData)
            }

            if (forecastData) {
                setForecast(forecastData)
            }

            setLoading(false)
        } catch (err) {
            console.error('Data fetch error:', err)
            setBackendStatus('error')
        }
    }, [])

    useEffect(() => {
        // Initial fetch
        refresh()

        // Periodic polling
        const timer = setInterval(refresh, refreshInterval)
        return () => clearInterval(timer)
    }, [refresh, refreshInterval])

    return {
        sensorData,
        prediction,
        alerts,
        forecast,
        loading,
        backendStatus,
        refresh,
    }
}

export default useSensorData
