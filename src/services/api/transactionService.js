const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const transactionService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "description" } },
          { field: { Name: "farmId" } }
        ]
      }
      
      const response = await apperClient.fetchRecords('transaction', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching transactions:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching transactions:", error.message)
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
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "description" } },
          { field: { Name: "farmId" } }
        ]
      }
      
      const response = await apperClient.getRecordById('transaction', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching transaction with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching transaction with ID ${id}:`, error.message)
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
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "description" } },
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
      
      const response = await apperClient.fetchRecords('transaction', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching transactions by farm ID:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching transactions by farm ID:", error.message)
        throw error
      }
    }
  },

  async create(transactionData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: transactionData.Name || transactionData.description,
          Tags: transactionData.Tags || "",
          Owner: transactionData.Owner,
          type: transactionData.type,
          category: transactionData.category,
          amount: parseFloat(transactionData.amount),
          date: transactionData.date,
          description: transactionData.description,
          farmId: parseInt(transactionData.farmId)
        }]
      }
      
      const response = await apperClient.createRecord('transaction', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to create transaction")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating transaction:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating transaction:", error.message)
        throw error
      }
    }
  },

  async update(id, transactionData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: transactionData.Name || transactionData.description,
          Tags: transactionData.Tags || "",
          Owner: transactionData.Owner,
          type: transactionData.type,
          category: transactionData.category,
          amount: parseFloat(transactionData.amount),
          date: transactionData.date,
          description: transactionData.description,
          farmId: parseInt(transactionData.farmId)
        }]
      }
      
      const response = await apperClient.updateRecord('transaction', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to update transaction")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating transaction:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating transaction:", error.message)
        throw error
      }
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('transaction', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to delete transaction")
        }
      }
      
      return true
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting transaction:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting transaction:", error.message)
        throw error
      }
    }
  },

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "amount" } },
          { field: { Name: "date" } },
          { field: { Name: "description" } },
          { field: { Name: "farmId" } }
        ],
        where: [
          {
            FieldName: "date",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          },
          {
            FieldName: "date",
            Operator: "LessThanOrEqualTo",
            Values: [endDate]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('transaction', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching transactions by date range:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching transactions by date range:", error.message)
        throw error
      }
    }
  }
}

export default transactionService
export default transactionService