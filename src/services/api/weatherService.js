import weatherData from "@/services/mockData/weather.json"
import forecastData from "@/services/mockData/forecast.json"
import alertsData from "@/services/mockData/alerts.json"

const weatherService = {
  async getCurrentWeather(location = "Default Location") {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      ...weatherData,
      location: location
    }
  },

  async getForecast(location = "Default Location") {
    await new Promise(resolve => setTimeout(resolve, 500))
    return forecastData.map(day => ({
      ...day,
      location: location
    }))
  },

  async getWeatherAlerts(location = "Default Location") {
    await new Promise(resolve => setTimeout(resolve, 300))
    return alertsData.map(alert => ({
      ...alert,
      location: location
    }))
  }
}

export default weatherService