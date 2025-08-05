import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import FarmCard from "@/components/organisms/FarmCard"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import SearchBar from "@/components/molecules/SearchBar"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import farmService from "@/services/api/farmService"

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <ApperIcon name="X" size={18} />
            </Button>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
const Farms = () => {
const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [totalItems, setTotalItems] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    sizeUnit: "acres"
  })
useEffect(() => {
    loadFarms()
  }, [])

  useEffect(() => {
    loadFarms(currentPage)
  }, [currentPage, itemsPerPage])

  const loadFarms = async (page = 1) => {
    try {
      setLoading(true)
      setError("")
      const result = await farmService.getAll(page, itemsPerPage)
      setFarms(result.data)
      setTotalItems(result.total)
      setCurrentPage(page)
    } catch (err) {
      setError("Failed to load farms. Please try again.")
      toast.error("Failed to load farms")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location || !formData.size) {
      toast.error("Please fill in all required fields")
      return
    }

try {
      const farmData = {
        name: formData.name,
        location: formData.location,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit,
        createdAt: editingFarm?.createdAt || new Date().toISOString()
      }

      if (editingFarm) {
        const updatedFarm = await farmService.update(editingFarm.Id, farmData)
        if (updatedFarm) {
          setFarms(farms.map(farm => farm.Id === editingFarm.Id ? updatedFarm : farm))
          toast.success("Farm updated successfully!")
        }
      } else {
        const newFarm = await farmService.create(farmData)
        if (newFarm) {
          setFarms([...farms, newFarm])
          toast.success("Farm created successfully!")
        }
      }

      resetForm()
    } catch (err) {
      toast.error(editingFarm ? "Failed to update farm" : "Failed to add farm")
    }
  }

const handleEdit = (farm) => {
    setEditingFarm(farm)
    setFormData({
      name: farm.Name,
      location: farm.location,
      size: farm.size.toString(),
      sizeUnit: farm.sizeUnit
    })
    setShowForm(true)
  }
const handleDelete = async (farm) => {
    if (!window.confirm(`Are you sure you want to delete "${farm.Name}"? This action cannot be undone.`)) {
      return
    }

    try {
await farmService.delete(farm.Id)
      setFarms(farms.filter(f => f.Id !== farm.Id))
      toast.success("Farm deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete farm")
    }
  }

const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      size: "",
      sizeUnit: "acres"
    })
    setEditingFarm(null)
    setShowForm(false)
  }

  const openModal = () => {
    setShowForm(true)
  }

  const closeModal = () => {
    resetForm()
  }

const filteredFarms = searchTerm 
    ? farms.filter(farm =>
        farm.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : farms

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (loading) return <Loading showCards={true} />
  if (error) return <Error message={error} onRetry={loadFarms} />

return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Farms</h1>
          <p className="text-gray-600 mt-1">
            {totalItems} farm{totalItems !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" size={18} />
          Add Farm
        </Button>
      </div>

      {/* Search */}
      {totalItems > 0 && (
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search farms by name or location..."
          className="max-w-md"
        />
      )}

      {/* Add Farm Modal */}
      <Modal 
        isOpen={showForm} 
        onClose={closeModal}
        title={editingFarm ? "Edit Farm" : "Add New Farm"}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Farm Name *"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter farm name"
          />

          <FormField
            label="Location *"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Enter farm location"
          />

          <FormField
            label="Size *"
            type="number"
            step="0.1"
            min="0"
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
            placeholder="Enter size"
          />

          <FormField
            label="Size Unit"
            type="select"
            value={formData.sizeUnit}
            onChange={(e) => setFormData({...formData, sizeUnit: e.target.value})}
          >
            <option value="acres">Acres</option>
            <option value="hectares">Hectares</option>
            <option value="square_feet">Square Feet</option>
            <option value="square_meters">Square Meters</option>
          </FormField>

          <div className="md:col-span-2 flex gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" className="flex-1 sm:flex-none">
              <ApperIcon name={editingFarm ? "Save" : "Plus"} size={18} />
              {editingFarm ? "Update Farm" : "Add Farm"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Farms Grid */}
      {filteredFarms.length === 0 ? (
        totalItems === 0 ? (
          <Empty
            title="No farms yet"
            description="Add your first farm to start managing your agricultural operations."
            actionLabel="Add Farm"
            onAction={() => setShowForm(true)}
            icon="MapPin"
          />
        ) : (
          <div className="text-center py-12">
            <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No farms found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <FarmCard
                key={farm.Id}
                farm={farm}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {!searchTerm && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing {startItem}-{endItem} of {totalItems} farms
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ApperIcon name="ChevronLeft" size={16} />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ApperIcon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Farms