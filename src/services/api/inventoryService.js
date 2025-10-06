import { toast } from 'react-toastify';

class InventoryService {
  constructor() {
    this.tableName = 'inventory_item';
    // Initialize ApperClient
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

async getAll(filters = {}) {
    try {
      // Get current user from Redux store
      const state = window.store.getState();
      const currentUserEmail = state.user?.user?.emailAddress;
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "quantity" } },
          { field: { Name: "farmId" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: filters.limit || 50,
          offset: filters.offset || 0
        }
      };

      // Add owner filter
      const whereConditions = [];
      if (currentUserEmail) {
        whereConditions.push({
          FieldName: "Owner",
          Operator: "EqualTo",
          Values: [currentUserEmail]
        });
      }

      // Add search filter if provided
      if (filters.search) {
        params.whereGroups = [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "Name",
                    operator: "Contains",
                    values: [filters.search]
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: "description",
                    operator: "Contains", 
                    values: [filters.search]
                  }
                ]
              }
            ]
          }
        ];
      }

      // Add type filter if provided
      if (filters.type && filters.type !== 'all') {
        whereConditions.push({
          FieldName: "type",
          Operator: "EqualTo",
          Values: [filters.type]
        });
      }
      
      if (whereConditions.length > 0) {
        params.where = whereConditions;
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error("Error fetching inventory items:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching inventory items:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching inventory items:", error.message);
        toast.error("Failed to fetch inventory items");
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "quantity" } },
          { field: { Name: "farmId" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(`Error fetching inventory item with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching inventory item with ID ${id}:`, error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error(`Error fetching inventory item with ID ${id}:`, error.message);
        toast.error("Failed to fetch inventory item");
      }
      return null;
    }
  }

  async create(itemData) {
    try {
      // Only include Updateable fields for create operation
      const updateableData = {
        Name: itemData.Name || '',
        type: itemData.type || '',
        description: itemData.description || '',
        quantity: parseInt(itemData.quantity) || 0,
        farmId: itemData.farmId ? parseInt(itemData.farmId) : null,
        Tags: itemData.Tags || ''
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error("Error creating inventory item:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create inventory item ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success("Inventory item created successfully");
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating inventory item:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating inventory item:", error.message);
        toast.error("Failed to create inventory item");
      }
      return null;
    }
  }

  async update(id, itemData) {
    try {
      // Only include Updateable fields for update operation
      const updateableData = {
        Id: parseInt(id),
        Name: itemData.Name || '',
        type: itemData.type || '',
        description: itemData.description || '',
        quantity: parseInt(itemData.quantity) || 0,
        farmId: itemData.farmId ? parseInt(itemData.farmId) : null,
        Tags: itemData.Tags || ''
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error("Error updating inventory item:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update inventory item ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success("Inventory item updated successfully");
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating inventory item:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating inventory item:", error.message);
        toast.error("Failed to update inventory item");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error("Error deleting inventory item:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete inventory item ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success("Inventory item deleted successfully");
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting inventory item:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting inventory item:", error.message);
        toast.error("Failed to delete inventory item");
      }
      return false;
    }
  }

  // Get available farms for dropdown
  async getFarms() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } }
        ],
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('farm', params);

      if (!response.success) {
        console.error("Error fetching farms:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching farms:", error.message);
      return [];
    }
  }
}

export default new InventoryService();