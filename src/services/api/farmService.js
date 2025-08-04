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
        ],
        aggregators: [
          {
            id: 'activeCropsCount',
            fields: [
              {
                field: { Name: "farmId" },
                Function: 'Count'
              }
            ],
            where: [
              {
                FieldName: "status",
                Operator: "ExactMatch",
                Values: ["planted", "growing", "ready"]
              }
            ],
            groupBy: ["farmId"]
          }
        ]
      }

      const response = await apperClient.fetchRecords("farm", params)
      
if (!response.success) {
        console.error(response.message)
        return []
      }

// Process aggregator results to add active crops count to each farm
      if (response.aggregators && response.aggregators.length > 0) {
        const activeCropsData = response.aggregators.find(agg => agg.id === 'activeCropsCount')
        if (activeCropsData && activeCropsData.data && response.data) {
          response.data.forEach(farm => {
            // Find the count for this specific farm
            const farmCropCount = activeCropsData.data.find(item => item.farmId === farm.Id)
            farm.activeCrops = farmCropCount ? farmCropCount.count : 0
          })
        } else if (response.data) {
          // Ensure activeCrops is set to 0 if no aggregator data
          response.data.forEach(farm => {
            farm.activeCrops = 0
          })
        }
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
        aggregators: [
          {
            id: 'activeCropsCount',
            fields: [
              {
                field: { Name: "Id" },
                Function: 'Count'
              }
            ],
            where: [
              {
                FieldName: "status",
                Operator: "ExactMatch",
                Values: ["planted", "growing", "ready"]
              },
              {
                FieldName: "farmId",
                Operator: "EqualTo",
                Values: [parseInt(id)]
              }
            ]
          }
        ]
      }

      const response = await apperClient.getRecordById("farm", id, params)
      
      // Process aggregator results for single farm
      if (response.success && response.aggregators && response.aggregators.length > 0) {
        const activeCropsData = response.aggregators.find(agg => agg.id === 'activeCropsCount')
        if (activeCropsData && response.data) {
          response.data.activeCrops = activeCropsData.value || 0
        }
      }
      
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