import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import cropService from "@/services/api/cropService";
import taskService from "@/services/api/taskService";
import farmService from "@/services/api/farmService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import TaskList from "@/components/organisms/TaskList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const Tasks = () => {
  const [tasks, setTasks] = useState([])
const [farms, setFarms] = useState([])
  const [crops, setCrops] = useState([])
  const [filteredCrops, setFilteredCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formData, setFormData] = useState({
    farmId: "",
    cropId: "",
    title: "",
    type: "watering",
    dueDate: "",
    priority: "medium",
    notes: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ])
      
      // Enrich tasks with farm and crop names
const enrichedTasks = tasksData.map(task => ({
        ...task,
        farmName: task.farmId?.Name || farmsData.find(farm => farm.Id === (task.farmId?.Id || task.farmId))?.Name || "Unknown Farm",
        cropName: task.cropId ? (task.cropId?.Name || cropsData.find(crop => crop.Id === (task.cropId?.Id || task.cropId))?.Name || "Unknown Crop") : null
      }))
      
      setTasks(enrichedTasks)
setFarms(farmsData)
      setCrops(cropsData)
      setFilteredCrops([])
    } catch (err) {
      setError("Failed to load tasks. Please try again.")
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.farmId || !formData.title || !formData.dueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const taskData = {
        ...formData,
        completed: false
      }

      let result
      if (editingTask) {
        result = await taskService.update(editingTask.Id, { ...taskData, completed: editingTask.completed })
setTasks(tasks.map(task => task.Id === editingTask.Id ? {
          ...result,
          farmName: result.farmId?.Name || farms.find(farm => farm.Id === (result.farmId?.Id || result.farmId))?.Name || "Unknown Farm",
          cropName: result.cropId ? (result.cropId?.Name || crops.find(crop => crop.Id === (result.cropId?.Id || result.cropId))?.Name || "Unknown Crop") : null
        } : task))
        toast.success("Task updated successfully!")
      } else {
        result = await taskService.create(taskData)
setTasks([...tasks, {
          ...result,
          farmName: result.farmId?.Name || farms.find(farm => farm.Id === (result.farmId?.Id || result.farmId))?.Name || "Unknown Farm",
          cropName: result.cropId ? (result.cropId?.Name || crops.find(crop => crop.Id === (result.cropId?.Id || result.cropId))?.Name || "Unknown Crop") : null
        }])
        toast.success("Task added successfully!")
      }

      resetForm()
    } catch (err) {
      toast.error(editingTask ? "Failed to update task" : "Failed to add task")
    }
  }

  const handleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed }
      const result = await taskService.update(task.Id, updatedTask)
      setTasks(tasks.map(t => t.Id === task.Id ? {
        ...result,
        farmName: task.farmName,
        cropName: task.cropName
      } : t))
      toast.success(result.completed ? "Task completed!" : "Task reopened")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      farmId: task.farmId,
      cropId: task.cropId || "",
      title: task.title,
      type: task.type,
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority,
      notes: task.notes || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await taskService.delete(task.Id)
      setTasks(tasks.filter(t => t.Id !== task.Id))
      toast.success("Task deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete task")
    }
  }

  const resetForm = () => {
    setFormData({
      farmId: "",
      cropId: "",
      title: "",
      type: "watering",
      dueDate: "",
      priority: "medium",
      notes: ""
    })
    setEditingTask(null)
    setShowForm(false)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.cropName && task.cropName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "pending" && !task.completed) ||
                         (statusFilter === "completed" && task.completed)
    return matchesSearch && matchesStatus
})

  // Effect to filter crops when farm is selected
  useEffect(() => {
    const fetchCropsForFarm = async () => {
      if (formData.farmId) {
        try {
          const farmCrops = await cropService.getByFarmId(formData.farmId)
          setFilteredCrops(farmCrops)
        } catch (error) {
          console.error("Error fetching crops for farm:", error.message)
          setFilteredCrops([])
        }
      } else {
        setFilteredCrops([])
      }
    }
    
    fetchCropsForFarm()
  }, [formData.farmId])

  // Calculate available crops based on selected farm
  const availableCrops = formData.farmId ? filteredCrops : []
  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  }

  if (loading) return <Loading rows={6} />
  if (error) return <Error message={error} onRetry={loadData} />

  if (farms.length === 0) {
    return (
      <Empty
        title="No farms available"
        description="You need to add a farm before you can create tasks."
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
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {statusCounts.pending} pending • {statusCounts.completed} completed
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" size={18} />
          Add Task
        </Button>
      </div>

      {/* Status Filter */}
      {tasks.length > 0 && (
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
      {tasks.length > 0 && (
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks by title, farm, or crop..."
          className="max-w-md"
        />
      )}

      {/* Add/Edit Form */}
<AnimatePresence>
        {showForm && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={resetForm}
            />
            
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingTask ? "Edit Task" : "Add New Task"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                    >
                      <ApperIcon name="X" size={18} />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      label="Farm *"
                      type="select"
                      value={formData.farmId}
                      onChange={(e) => setFormData({...formData, farmId: e.target.value, cropId: ""})}
                    >
                      <option value="">Select a farm</option>
{farms.map(farm => (
                        <option key={farm.Id} value={farm.Id}>{farm.Name}</option>
                      ))}
                    </FormField>

<FormField
                      label="Crop (Optional)"
                      type="select"
                      value={formData.cropId}
                      onChange={(e) => setFormData({...formData, cropId: e.target.value})}
                      disabled={!formData.farmId}
                    >
                      <option value="">
                        {!formData.farmId 
                          ? "Select a farm first" 
                          : availableCrops.length === 0 
                            ? "No crops available for this farm" 
                            : "Select a crop"
                        }
                      </option>
                      {availableCrops.map(crop => (
                        <option key={crop.Id} value={crop.Id}>{crop.Name}</option>
                      ))}
                    </FormField>

                    <FormField
                      label="Task Title *"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Water greenhouse tomatoes"
                    />

                    <FormField
                      label="Task Type"
                      type="select"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="watering">Watering</option>
                      <option value="fertilizing">Fertilizing</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="planting">Planting</option>
                      <option value="weeding">Weeding</option>
                      <option value="other">Other</option>
                    </FormField>

                    <FormField
                      label="Due Date *"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />

                    <FormField
                      label="Priority"
                      type="select"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </FormField>

                    <div className="md:col-span-2 lg:col-span-3">
                      <FormField
                        label="Notes"
                        type="textarea"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes about this task..."
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                      <Button type="submit" className="flex-1 sm:flex-none">
                        <ApperIcon name={editingTask ? "Save" : "Plus"} size={18} />
                        {editingTask ? "Update Task" : "Add Task"}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        tasks.length === 0 ? (
          <Empty
            title="No tasks yet"
            description="Create your first task to start managing your farm activities."
            actionLabel="Add Task"
            onAction={() => setShowForm(true)}
            icon="CheckSquare"
          />
        ) : (
          <div className="text-center py-12">
            <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or status filter.</p>
          </div>
        )
      ) : (
        <TaskList
          tasks={filteredTasks}
          onComplete={handleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Tasks