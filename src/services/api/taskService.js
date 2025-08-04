import React from "react";
import Error from "@/components/ui/Error";
const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const taskService = {
  async getAll() {
    try {
const params = {
        fields: [
          { field: { name: "Name" } },
          { field: { name: "Tags" } },
          { field: { name: "Owner" } },
          { field: { name: "title" } },
          { field: { name: "type" } },
          { field: { name: "dueDate" } },
          { field: { name: "completed" } },
          { field: { name: "priority" } },
          { field: { name: "status" } },
          { field: { name: "notes" } },
          { 
            field: { name: "farmId" },
            referenceField: { field: { name: "Name" } }
          },
          { 
            field: { name: "cropId" },
            referenceField: { field: { name: "Name" } }
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('task', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching tasks:", error.message)
        throw error
      }
    }
  },

  async getById(id) {
    try {
const params = {
        fields: [
          { field: { name: "Name" } },
          { field: { name: "Tags" } },
          { field: { name: "Owner" } },
          { field: { name: "title" } },
          { field: { name: "type" } },
          { field: { name: "dueDate" } },
          { field: { name: "completed" } },
          { field: { name: "priority" } },
          { field: { name: "status" } },
          { field: { name: "notes" } },
          { 
            field: { name: "farmId" },
            referenceField: { field: { name: "Name" } }
          },
          { 
            field: { name: "cropId" },
            referenceField: { field: { name: "Name" } }
          }
        ]
      }
      
      const response = await apperClient.getRecordById('task', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching task with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async getByFarmId(farmId) {
    try {
const params = {
        fields: [
          { field: { name: "Name" } },
          { field: { name: "Tags" } },
          { field: { name: "Owner" } },
          { field: { name: "title" } },
          { field: { name: "type" } },
          { field: { name: "dueDate" } },
          { field: { name: "completed" } },
          { field: { name: "priority" } },
          { field: { name: "status" } },
          { field: { name: "notes" } },
          {
            field: { name: "farmId" },
            referenceField: { field: { name: "Name" } }
          },
          { 
            field: { name: "cropId" },
            referenceField: { field: { name: "Name" } }
          }
        ],
        where: [
          {
            FieldName: "farmId",
            Operator: "EqualTo",
            Values: [parseInt(farmId)]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('task', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks by farm ID:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching tasks by farm ID:", error.message)
        throw error
      }
    }
  },

  async getByCropId(cropId) {
    try {
const params = {
        fields: [
          { field: { name: "Name" } },
          { field: { name: "Tags" } },
          { field: { name: "Owner" } },
          { field: { name: "title" } },
          { field: { name: "type" } },
          { field: { name: "dueDate" } },
          { field: { name: "completed" } },
          { field: { name: "priority" } },
          { field: { name: "status" } },
          { field: { name: "notes" } },
          { 
            field: { name: "farmId" },
            referenceField: { field: { name: "Name" } }
          },
          { 
            field: { name: "cropId" },
            referenceField: { field: { name: "Name" } }
          }
        ],
        where: [
          {
            FieldName: "cropId",
            Operator: "EqualTo",
            Values: [parseInt(cropId)]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('task', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks by crop ID:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching tasks by crop ID:", error.message)
        throw error
      }
    }
  },

async create(taskData) {
    try {
// Only include Updateable fields - validate record exists before update
      const params = {
        records: [{
          Name: taskData.Name || taskData.title,
          Tags: taskData.Tags || "",
          Owner: taskData.Owner?.Id || (taskData.Owner ? parseInt(taskData.Owner) : null),
          title: taskData.title,
          type: taskData.type || "other",
          dueDate: taskData.dueDate,
          completed: false,
          priority: taskData.priority || "medium",
          status: taskData.status || "to do",
          notes: taskData.notes || "",
          farmId: taskData.farmId ? parseInt(taskData.farmId) : null,
          cropId: taskData.cropId ? parseInt(taskData.cropId) : null
        }]
      }
      
      const response = await apperClient.createRecord('task', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create task ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to create task")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating task:", error.message)
        throw error
      }
    }
  },

async update(id, taskData) {
    try {
// Only include Updateable fields - ensure proper field validation
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.Name || taskData.title,
          Tags: taskData.Tags || "",
          Owner: taskData.Owner?.Id || (taskData.Owner ? parseInt(taskData.Owner) : null),
          title: taskData.title,
type: taskData.type,
          dueDate: taskData.dueDate,
completed: taskData.completed,
          priority: taskData.priority,
          status: taskData.status,
          notes: taskData.notes || "",
          farmId: taskData.farmId ? parseInt(taskData.farmId) : null,
          cropId: taskData.cropId ? parseInt(taskData.cropId) : null
        }]
      }
      
      const response = await apperClient.updateRecord('task', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update task ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to update task")
        }
        
        return response.results[0].data
      }
      
      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating task:", error.message)
        throw error
      }
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('task', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete task ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          throw new Error(failedRecords[0].message || "Failed to delete task")
        }
      }
      
      return true
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting task:", error.message)
        throw error
      }
    }
  }
}

export default taskService