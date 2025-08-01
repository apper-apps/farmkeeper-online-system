import React from "react"
import ApperIcon from "@/components/ApperIcon"

const WeatherCard = ({ weather }) => {
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

  return (
    <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Current Weather</h3>
          <p className="text-blue-100">{weather.location}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{weather.temperature}°</div>
          <div className="text-blue-100 capitalize">{weather.condition}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ApperIcon name={getWeatherIcon(weather.condition)} size={32} />
        </div>
        <div className="text-right text-sm text-blue-100">
          <div>Humidity: {weather.humidity}%</div>
          <div>Wind: {weather.windSpeed} mph</div>
        </div>
      </div>
    </div>
  )
}

export default WeatherCard