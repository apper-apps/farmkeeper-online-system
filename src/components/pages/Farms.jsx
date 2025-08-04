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
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    sizeUnit: "acres"
  })

  useEffect(() => {
    loadFarms()
  }, [])

  const loadFarms = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await farmService.getAll()
      setFarms(data)
    } catch (err) {
      setError("Failed to load farms. Please try again.")
      toast.error("Failed to load farms")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location || !formData.size) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const farmData = {
        ...formData,
        size: parseFloat(formData.size),
        createdAt: editingFarm?.createdAt || new Date().toISOString()
      }

      if (editingFarm) {
        const updatedFarm = await farmService.update(editingFarm.Id, farmData)
        setFarms(farms.map(farm => farm.Id === editingFarm.Id ? updatedFarm : farm))
        toast.success("Farm updated successfully!")
      } else {
        const newFarm = await farmService.create(farmData)
        setFarms([...farms, newFarm])
        toast.success("Farm added successfully!")
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

const filteredFarms = farms.filter(farm =>
    farm.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loading showCards={true} />
  if (error) return <Error message={error} onRetry={loadFarms} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Farms</h1>
          <p className="text-gray-600 mt-1">
            {farms.length} farm{farms.length !== 1 ? "s" : ""} • {farms.reduce((sum, farm) => sum + farm.size, 0)} total acres
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" size={18} />
          Add Farm
        </Button>
      </div>

      {/* Search */}
      {farms.length > 0 && (
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
        farms.length === 0 ? (
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
      )}
    </div>
  )
}

export default Farms