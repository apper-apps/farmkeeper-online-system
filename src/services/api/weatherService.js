const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const weatherService = {
  async getCurrentWeather(location = "Default Location") {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "temperature" } },
          { field: { Name: "condition" } },
          { field: { Name: "humidity" } },
          { field: { Name: "windSpeed" } },
          { field: { Name: "visibility" } },
          { field: { Name: "pressure" } },
          { field: { Name: "location" } },
          { field: { Name: "lastUpdated" } }
        ]
      }
      
      const response = await apperClient.fetchRecords('current_weather', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      const weatherData = response.data && response.data.length > 0 ? response.data[0] : null
      
      if (weatherData) {
        return {
          ...weatherData,
          location: location
        }
      }
      
      // Return default data if no weather data found
      return {
        temperature: 72,
        condition: "sunny",
        humidity: 65,
        windSpeed: 8,
        visibility: 10,
        pressure: 1013,
        location: location,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching current weather:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching current weather:", error.message)
        throw error
      }
    }
  },

  async getForecast(location = "Default Location") {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "date" } },
          { field: { Name: "condition" } },
          { field: { Name: "highTemp" } },
          { field: { Name: "lowTemp" } },
          { field: { Name: "precipitationChance" } }
        ]
      }
      
      const response = await apperClient.fetchRecords('weather_forecast', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      const forecastData = response.data || []
      
      return forecastData.map(day => ({
        ...day,
        location: location
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching weather forecast:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching weather forecast:", error.message)
        throw error
      }
    }
  },

  async getWeatherAlerts(location = "Default Location") {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "severity" } },
          { field: { Name: "issuedAt" } },
          { field: { Name: "expiresAt" } }
        ]
      }
      
      const response = await apperClient.fetchRecords('weather_alert', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      const alertsData = response.data || []
      
      return alertsData.map(alert => ({
        ...alert,
        location: location
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching weather alerts:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching weather alerts:", error.message)
        throw error
      }
    }
  }
}

export default weatherService
export default weatherService