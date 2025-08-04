const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const farmService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "location" } },
          { field: { Name: "size" } },
          { field: { Name: "sizeUnit" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "activeCrops" } }
        ],
aggregators: [
          {
            id: 'activeCropsCount',
            fields: [
              { field: { Name: "Id" }, Function: 'Count' }
            ],
            where: [
              {
                FieldName: "status",
                Operator: "NotEqualTo", 
                Values: ["harvested"]
              }
            ],
            groupBy: ["farmId"]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('farm', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      // Process the response to include active crops count
      let farms = response.data || []
      
      // If we have aggregator results, merge them with farm data
      if (response.aggregators && response.aggregators.activeCropsCount) {
        const activeCropsCounts = response.aggregators.activeCropsCount
        
        farms = farms.map(farm => {
          const cropsCount = activeCropsCounts.find(count => count.farmId === farm.Id)
          return {
            ...farm,
            activeCrops: cropsCount ? cropsCount.count : 0
          }
        })
      } else {
        // Fallback: set activeCrops to the existing value or 0
        farms = farms.map(farm => ({
          ...farm,
          activeCrops: farm.activeCrops || 0
        }))
      }
      
      return farms
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching farms:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching farms:", error.message)
        throw error
      }
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "location" } },
          { field: { Name: "size" } },
          { field: { Name: "sizeUnit" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "activeCrops" } }
        ]
      }
      
      const response = await apperClient.getRecordById('farm', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching farm with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching farm with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async create(farmData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: farmData.Name || farmData.name,
          Tags: farmData.Tags || "",
          Owner: farmData.Owner,
          location: farmData.location,
          size: parseFloat(farmData.size),
          sizeUnit: farmData.sizeUnit || "acres",
          createdAt: new Date().toISOString()
        }]
      }
      
      const response = await apperClient.createRecord('farm', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create farm ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to create farm")
        }
        
        const newFarm = response.results[0].data
        // Set activeCrops to 0 for new farms
        return { ...newFarm, activeCrops: 0 }
      }
      
      return { ...response.data, activeCrops: 0 }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating farm:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating farm:", error.message)
        throw error
      }
    }
  },

  async update(id, farmData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: farmData.Name || farmData.name,
          Tags: farmData.Tags || "",
          Owner: farmData.Owner,
          location: farmData.location,
          size: parseFloat(farmData.size),
          sizeUnit: farmData.sizeUnit || "acres"
        }]
      }
      
      const response = await apperClient.updateRecord('farm', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update farm ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to update farm")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating farm:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating farm:", error.message)
        throw error
      }
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('farm', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete farm ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to delete farm")
        }
      }
      
      return true
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting farm:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting farm:", error.message)
        throw error
      }
    }
  }
}

export default farmService