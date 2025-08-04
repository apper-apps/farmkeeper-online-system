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
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "location" } },
          { field: { Name: "size" } },
          { field: { Name: "sizeUnit" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "activeCrops" } }
],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      }

      const response = await apperClient.fetchRecords("farm", params)
      
if (!response.success) {
        console.error(response.message)
        return []
      }

      return response.data || []
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching farms:", error?.response?.data?.message)
      } else {
        console.error("Error fetching farms:", error.message)
      }
      throw error
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
],
}

      const response = await apperClient.getRecordById("farm", id, params)
      
      return response.data
} catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching farm with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(`Error fetching farm with ID ${id}:`, error.message)
      }
      throw error
    }
  },

  async create(farmData) {
    try {
      const params = {
        records: [
          {
            Name: farmData.Name,
            Tags: farmData.Tags,
            Owner: farmData.Owner,
            location: farmData.location,
            size: parseFloat(farmData.size),
            sizeUnit: farmData.sizeUnit,
            createdAt: farmData.createdAt,
            activeCrops: parseInt(farmData.activeCrops) || 0
          }
        ]
      }

      const response = await apperClient.createRecord("farm", params)
      
      if (!response.success) {
        console.error(response.message)
        return null
      }

      return response.results?.[0]?.data
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating farm:", error?.response?.data?.message)
      } else {
        console.error("Error creating farm:", error.message)
      }
      throw error
    }
  },

  async update(id, farmData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: farmData.Name,
            Tags: farmData.Tags,
            Owner: farmData.Owner,
            location: farmData.location,
            size: parseFloat(farmData.size),
            sizeUnit: farmData.sizeUnit,
            activeCrops: parseInt(farmData.activeCrops) || 0
          }
        ]
      }

      const response = await apperClient.updateRecord("farm", params)
      
      if (!response.success) {
        console.error(response.message)
        return null
      }

      return response.results?.[0]?.data
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating farm:", error?.response?.data?.message)
      } else {
        console.error("Error updating farm:", error.message)
      }
      throw error
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord("farm", params)
      return response.success
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting farm:", error?.response?.data?.message)
      } else {
        console.error("Error deleting farm:", error.message)
      }
      throw error
    }
  }
}

export default farmService