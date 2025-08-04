import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import CropTable from "@/components/organisms/CropTable"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import SearchBar from "@/components/molecules/SearchBar"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import cropService from "@/services/api/cropService"
import farmService from "@/services/api/farmService"

const Crops = () => {
  const [crops, setCrops] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    farmId: "",
    name: "",
    variety: "",
    plantingDate: "",
    expectedHarvestDate: "",
    status: "planted",
    area: "",
    notes: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ])
      
// Enrich crops with farm names
      const enrichedCrops = cropsData.map(crop => ({
        ...crop,
        farmName: farmsData.find(farm => {
          // Handle lookup field (object) or direct ID (integer)
          const cropFarmId = typeof crop.farmId === 'object' ? crop.farmId?.Id : crop.farmId
          return farm.Id === cropFarmId
        })?.Name || "Unknown Farm"
      }))
      
      setCrops(enrichedCrops)
      setFarms(farmsData)
    } catch (err) {
      setError("Failed to load crops. Please try again.")
      toast.error("Failed to load crops")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.farmId || !formData.name || !formData.plantingDate || !formData.expectedHarvestDate || !formData.area) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const cropData = {
        ...formData,
        area: parseFloat(formData.area)
      }

      let result
      if (editingCrop) {
        result = await cropService.update(editingCrop.Id, cropData)
setCrops(crops.map(crop => crop.Id === editingCrop.Id ? {
          ...result,
          farmName: farms.find(farm => {
            const resultFarmId = typeof result.farmId === 'object' ? result.farmId?.Id : result.farmId
            return farm.Id === resultFarmId
          })?.Name || "Unknown Farm"
        } : crop))
        toast.success("Crop updated successfully!")
      } else {
        result = await cropService.create(cropData)
setCrops([...crops, {
          ...result,
          farmName: farms.find(farm => {
            const resultFarmId = typeof result.farmId === 'object' ? result.farmId?.Id : result.farmId
            return farm.Id === resultFarmId
          })?.Name || "Unknown Farm"
        }])
        toast.success("Crop added successfully!")
      }

      resetForm()
    } catch (err) {
      toast.error(editingCrop ? "Failed to update crop" : "Failed to add crop")
    }
  }

  const handleEdit = (crop) => {
    setEditingCrop(crop)
setFormData({
      farmId: typeof crop.farmId === 'object' ? crop.farmId?.Id : crop.farmId,
      name: crop.Name,
      variety: crop.variety || "",
      plantingDate: crop.plantingDate.split('T')[0],
      expectedHarvestDate: crop.expectedHarvestDate.split('T')[0],
      status: crop.status,
      area: crop.area.toString(),
      notes: crop.notes || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (crop) => {
    if (!window.confirm(`Are you sure you want to delete "${crop.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await cropService.delete(crop.Id)
      setCrops(crops.filter(c => c.Id !== crop.Id))
      toast.success("Crop deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete crop")
    }
  }

  const resetForm = () => {
    setFormData({
      farmId: "",
      name: "",
      variety: "",
      plantingDate: "",
      expectedHarvestDate: "",
      status: "planted",
      area: "",
      notes: ""
    })
    setEditingCrop(null)
    setShowForm(false)
  }
const filteredCrops = crops.filter(crop => {
const matchesSearch = crop.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.farmName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || crop.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredCrops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCrops = filteredCrops.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])
  const statusCounts = {
    all: crops.length,
    planted: crops.filter(c => c.status === "planted").length,
    growing: crops.filter(c => c.status === "growing").length,
    ready: crops.filter(c => c.status === "ready").length,
    harvested: crops.filter(c => c.status === "harvested").length
  }

  if (loading) return <Loading rows={8} />
  if (error) return <Error message={error} onRetry={loadData} />

  if (farms.length === 0) {
    return (
      <Empty
        title="No farms available"
        description="You need to add a farm before you can manage crops."
        actionLabel="Add Farm"
        onAction={() => window.location.href = "/farms"}
        icon="MapPin"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crops</h1>
          <p className="text-gray-600 mt-1">
            {crops.length} crop{crops.length !== 1 ? "s" : ""} across {farms.length} farm{farms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" size={18} />
          Add Crop
        </Button>
      </div>

      {/* Status Filter */}
      {crops.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="text-sm"
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </Button>
          ))}
        </div>
      )}

      {/* Search */}
      {crops.length > 0 && (
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search crops by name, variety, or farm..."
          className="max-w-md"
        />
      )}

{/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                resetForm()
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {editingCrop ? "Edit Crop" : "Add New Crop"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    <ApperIcon name="X" size={20} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    label="Farm *"
                    type="select"
                    value={formData.farmId}
                    onChange={(e) => setFormData({...formData, farmId: e.target.value})}
                  >
                    <option value="">Select a farm</option>
{farms.map(farm => (
                      <option key={farm.Id} value={farm.Id}>{farm.Name}</option>
                    ))}
                  </FormField>

                  <FormField
                    label="Crop Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Corn, Wheat, Tomatoes"
                  />

                  <FormField
                    label="Variety"
                    value={formData.variety}
                    onChange={(e) => setFormData({...formData, variety: e.target.value})}
                    placeholder="e.g., Sweet Corn, Winter Wheat"
                  />

                  <FormField
                    label="Planting Date *"
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
                  />

                  <FormField
                    label="Expected Harvest Date *"
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({...formData, expectedHarvestDate: e.target.value})}
                  />

                  <FormField
                    label="Status"
                    type="select"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="planted">Planted</option>
                    <option value="growing">Growing</option>
                    <option value="ready">Ready</option>
                    <option value="harvested">Harvested</option>
                  </FormField>

                  <FormField
                    label="Area (acres) *"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="Enter area in acres"
                  />

                  <div className="md:col-span-2 lg:col-span-2">
                    <FormField
                      label="Notes"
                      type="textarea"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes about this crop..."
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4 border-t">
                    <Button type="submit" className="flex-1 sm:flex-none">
                      <ApperIcon name={editingCrop ? "Save" : "Plus"} size={18} />
                      {editingCrop ? "Update Crop" : "Add Crop"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crops Table */}
      {filteredCrops.length === 0 ? (
        crops.length === 0 ? (
          <Empty
            title="No crops yet"
            description="Add your first crop to start tracking your agricultural production."
            actionLabel="Add Crop"
            onAction={() => setShowForm(true)}
            icon="Sprout"
          />
        ) : (
          <div className="text-center py-12">
            <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or status filter.</p>
          </div>
        )
      ) : (
<CropTable
          crops={paginatedCrops}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCrops.length}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default Crops