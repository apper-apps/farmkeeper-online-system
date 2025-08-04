import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import inventoryService from '@/services/api/inventoryService';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    type: '',
    description: '',
    quantity: '',
    farmId: '',
    Tags: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [farms, setFarms] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInventory();
    loadFarms();
  }, []);

  // Filter inventory when search or type filter changes
  useEffect(() => {
    loadInventory();
  }, [searchTerm, typeFilter]);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: searchTerm.trim(),
        type: typeFilter
      };
      
      const data = await inventoryService.getAll(filters);
      setInventory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFarms = async () => {
    try {
      const farmData = await inventoryService.getFarms();
      setFarms(farmData);
    } catch (err) {
      console.error('Error loading farms:', err);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      Name: '',
      type: '',
      description: '',
      quantity: '',
      farmId: '',
      Tags: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      Name: item.Name || '',
      type: item.type || '',
      description: item.description || '',
      quantity: item.quantity?.toString() || '',
      farmId: item.farmId?.Id?.toString() || item.farmId?.toString() || '',
      Tags: item.Tags || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.Name}"?`)) {
      return;
    }

    const success = await inventoryService.delete(item.Id);
    if (success) {
      await loadInventory();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let success;
      if (editingItem) {
        success = await inventoryService.update(editingItem.Id, formData);
      } else {
        success = await inventoryService.create(formData);
      }

      if (success) {
        setShowModal(false);
        await loadInventory();
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'seed': return 'Sprout';
      case 'fertilizer': return 'Droplets';
      case 'equipment': return 'Wrench';
      default: return 'Package';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'seed': return 'bg-primary-100 text-primary-800';
      case 'fertilizer': return 'bg-secondary-100 text-secondary-800';
      case 'equipment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadInventory} />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage your seeds, fertilizers, and equipment inventory</p>
        </div>
        <Button onClick={handleAdd} icon="Plus" className="mt-4 sm:mt-0">
          Add Inventory Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Types</option>
              <option value="seed">Seeds</option>
              <option value="fertilizer">Fertilizers</option>
              <option value="equipment">Equipment</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <Empty
          title="No inventory items found"
          description="Add your first inventory item to get started with inventory management."
          actionLabel="Add Inventory Item"
          onAction={handleAdd}
          icon="Package"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item, index) => (
                  <motion.tr
                    key={item.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${getTypeBadgeColor(item.type)}`}>
                          <ApperIcon name={getTypeIcon(item.type)} size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.Name || 'Unnamed Item'}
                          </div>
                          {item.Tags && (
                            <div className="text-sm text-gray-500">
                              {item.Tags}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}>
                        {item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantity || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.farmId?.Name || 'No farm assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          icon="Edit"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          icon="Trash2"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  icon="X"
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <FormField
                    label="Item Name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    placeholder="Enter item name"
                    required
                  />

                  <FormField
                    label="Type"
                    type="select"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="seed">Seed</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="equipment">Equipment</option>
                  </FormField>

                  <FormField
                    label="Quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    min="0"
                    required
                  />

                  <FormField
                    label="Farm"
                    type="select"
                    name="farmId"
                    value={formData.farmId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select farm (optional)</option>
                    {farms.map(farm => (
                      <option key={farm.Id} value={farm.Id}>
                        {farm.Name}
                      </option>
                    ))}
                  </FormField>

                  <FormField
                    label="Description"
                    type="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description (optional)"
                    rows={3}
                  />

                  <FormField
                    label="Tags"
                    name="Tags"
                    value={formData.Tags}
                    onChange={handleInputChange}
                    placeholder="Enter tags (optional)"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={formLoading}
                    disabled={formLoading}
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;