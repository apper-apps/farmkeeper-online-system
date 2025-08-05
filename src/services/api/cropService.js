const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const cropService = {
  async getAll(page = 1, limit = 20) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "variety" } },
          { field: { Name: "plantingDate" } },
          { field: { Name: "expectedHarvestDate" } },
          { field: { Name: "status" } },
          { field: { Name: "area" } },
          { field: { Name: "notes" } },
          { field: { Name: "farmId" } }
        ],
        pagingInfo: {
          limit: limit,
          offset: (page - 1) * limit
        }
      }
      
      const response = await apperClient.fetchRecords('crop', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return {
        data: response.data || [],
        total: response.total || 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching crops:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching crops:", error.message)
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
          { field: { Name: "variety" } },
          { field: { Name: "plantingDate" } },
          { field: { Name: "expectedHarvestDate" } },
          { field: { Name: "status" } },
          { field: { Name: "area" } },
          { field: { Name: "notes" } },
          { field: { Name: "farmId" } }
        ]
      }
      
      const response = await apperClient.getRecordById('crop', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching crop with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching crop with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async getByFarmId(farmId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "variety" } },
          { field: { Name: "plantingDate" } },
          { field: { Name: "expectedHarvestDate" } },
          { field: { Name: "status" } },
          { field: { Name: "area" } },
          { field: { Name: "notes" } },
          { field: { Name: "farmId" } }
        ],
        where: [
          {
            FieldName: "farmId",
            Operator: "EqualTo",
            Values: [parseInt(farmId)]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('crop', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching crops by farm ID:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching crops by farm ID:", error.message)
        throw error
      }
    }
  },

  async create(cropData) {
    try {
      // Only include Updateable fields
const params = {
        records: [{
          Name: cropData.Name || cropData.name,
          Tags: cropData.Tags || "",
          variety: cropData.variety,
          plantingDate: cropData.plantingDate,
          expectedHarvestDate: cropData.expectedHarvestDate,
          status: cropData.status || "planted",
          area: parseFloat(cropData.area),
          notes: cropData.notes || "",
          farmId: parseInt(cropData.farmId)
        }]
      }
      
      const response = await apperClient.createRecord('crop', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create crop ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to create crop")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating crop:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating crop:", error.message)
        throw error
      }
    }
  },

  async update(id, cropData) {
    try {
// Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: cropData.Name || cropData.name,
          Tags: cropData.Tags || "",
          variety: cropData.variety,
          plantingDate: cropData.plantingDate,
          expectedHarvestDate: cropData.expectedHarvestDate,
          status: cropData.status,
          area: parseFloat(cropData.area),
          notes: cropData.notes || "",
          farmId: parseInt(cropData.farmId)
        }]
      }
      const response = await apperClient.updateRecord('crop', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update crop ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to update crop")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating crop:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating crop:", error.message)
        throw error
      }
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('crop', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete crop ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to delete crop")
        }
      }
      
      return true
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting crop:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting crop:", error.message)
        throw error
      }
    }
},

  async getReadyToHarvest(page = 1, limit = 20) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "variety" } },
          { field: { Name: "plantingDate" } },
          { field: { Name: "expectedHarvestDate" } },
          { field: { Name: "status" } },
          { field: { Name: "area" } },
          { field: { Name: "notes" } },
          { field: { Name: "farmId" } }
        ],
        where: [
          {
            FieldName: "status",
            Operator: "EqualTo",
            Values: ["ready"]
          }
        ],
        pagingInfo: {
          limit: limit,
          offset: (page - 1) * limit
        }
      }
      
      const response = await apperClient.fetchRecords('crop', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return {
        data: response.data || [],
        total: response.total || 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching ready to harvest crops:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching ready to harvest crops:", error.message)
        throw error
      }
    }
  }
}

export default cropService