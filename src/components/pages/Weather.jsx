import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import WeatherCard from "@/components/molecules/WeatherCard"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import weatherService from "@/services/api/weatherService"

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("Default Location")

  const locations = [
    "Default Location",
    "Farm Location 1",
    "Farm Location 2",
    "Farm Location 3"
  ]

  useEffect(() => {
    loadWeatherData()
  }, [selectedLocation])

  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [weatherData, forecastData, alertsData] = await Promise.all([
        weatherService.getCurrentWeather(selectedLocation),
        weatherService.getForecast(selectedLocation),
        weatherService.getWeatherAlerts(selectedLocation)
      ])

      setCurrentWeather(weatherData)
      setForecast(forecastData)
      setAlerts(alertsData)
    } catch (err) {
      setError("Failed to load weather data. Please try again.")
      toast.error("Failed to load weather data")
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return "Sun"
      case "cloudy":
      case "overcast":
        return "Cloud"
      case "rainy":
      case "rain":
        return "CloudRain"
      case "stormy":
      case "thunderstorm":
        return "CloudLightning"
      case "snowy":
      case "snow":
        return "CloudSnow"
      default:
        return "Sun"
    }
  }

  const getAlertIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "AlertTriangle"
      case "medium":
        return "AlertCircle"
      case "low":
        return "Info"
      default:
        return "Info"
    }
  }

  const getAlertColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "border-red-500 bg-red-50 text-red-800"
      case "medium":
        return "border-yellow-500 bg-yellow-50 text-yellow-800"
      case "low":
        return "border-blue-500 bg-blue-50 text-blue-800"
      default:
        return "border-gray-500 bg-gray-50 text-gray-800"
    }
  }

  if (loading) return <Loading showCards={true} />
  if (error) return <Error message={error} onRetry={loadWeatherData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather</h1>
          <p className="text-gray-600 mt-1">
            Current conditions and forecast for your farm locations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <FormField
            type="select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="min-w-[200px]"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </FormField>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadWeatherData}
          >
            <ApperIcon name="RefreshCw" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ApperIcon name="AlertTriangle" size={20} className="text-red-500" />
            Weather Alerts
          </h2>
          {alerts.map((alert) => (
            <div
              key={alert.Id}
              className={`p-4 rounded-lg border-2 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <ApperIcon name={getAlertIcon(alert.severity)} size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{alert.title}</h3>
                  <p className="text-sm mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span>Severity: {alert.severity}</span>
                    <span>Valid until: {new Date(alert.expiresAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {/* Current Weather */}
          {currentWeather && <WeatherCard weather={currentWeather} />}

          {/* Weather Stats */}
          <div className="card p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="BarChart3" size={20} className="text-primary-600" />
              Today's Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <ApperIcon name="Droplets" size={16} />
                  Humidity
                </span>
                <span className="font-semibold text-gray-900">
                  {currentWeather?.humidity}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <ApperIcon name="Wind" size={16} />
                  Wind Speed
                </span>
                <span className="font-semibold text-gray-900">
                  {currentWeather?.windSpeed} mph
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <ApperIcon name="Eye" size={16} />
                  Visibility
                </span>
                <span className="font-semibold text-gray-900">
                  {currentWeather?.visibility} miles
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <ApperIcon name="Gauge" size={16} />
                  Pressure
                </span>
                <span className="font-semibold text-gray-900">
                  {currentWeather?.pressure} mb
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* 5-Day Forecast */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ApperIcon name="Calendar" size={20} className="text-primary-600" />
              5-Day Forecast
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {forecast.map((day) => (
                <div
                  key={day.Id}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-primary-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  
                  <div className="flex justify-center mb-3">
                    <ApperIcon 
                      name={getWeatherIcon(day.condition)} 
                      size={32}
                      className="text-primary-600"
                    />
                  </div>
                  
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {day.highTemp}°
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {day.lowTemp}°
                  </div>
                  
                  <div className="text-xs text-gray-600 capitalize">
                    {day.condition}
                  </div>
                  
                  <div className="text-xs text-primary-600 mt-2 flex items-center justify-center gap-1">
                    <ApperIcon name="Droplets" size={12} />
                    {day.precipitationChance}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farming Recommendations */}
          <div className="card p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ApperIcon name="Lightbulb" size={20} className="text-primary-600" />
              Farming Recommendations
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <ApperIcon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800 mb-1">Good for Irrigation</h3>
                  <p className="text-sm text-green-700">
                    Current weather conditions are favorable for watering crops. Low wind and moderate humidity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <ApperIcon name="AlertCircle" size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">Monitor Humidity</h3>
                  <p className="text-sm text-yellow-700">
                    High humidity levels may increase risk of fungal diseases. Consider improving air circulation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <ApperIcon name="Info" size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Planting Conditions</h3>
                  <p className="text-sm text-blue-700">
                    Soil temperature and moisture levels are optimal for planting cool-season crops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Weather