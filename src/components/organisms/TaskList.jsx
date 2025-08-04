import React from "react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"

const TaskList = ({ tasks, onComplete, onEdit, onDelete }) => {
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "high":
        return "high"
      case "medium":
        return "medium"
      case "low":
        return "low"
      default:
        return "default"
    }
  }

const getStatusVariant = (status) => {
    switch (status) {
      case "to do":
        return "todo"
      case "in progress":
        return "in-progress"
      case "completed":
        return "completed"
      case "overdue":
        return "overdue"
      default:
        return "default"
    }
  }

  const getTaskIcon = (type) => {
    switch (type) {
      case "watering":
        return "Droplets"
      case "fertilizing":
        return "Zap"
      case "harvesting":
        return "Package"
      case "planting":
        return "Seedling"
      case "weeding":
        return "Scissors"
      default:
        return "CheckSquare"
    }
  }

  const getDueDateDisplay = (dueDate) => {
    const date = new Date(dueDate)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isPast(date)) return "Overdue"
    return format(date, "MMM dd")
  }

  const getDueDateColor = (dueDate) => {
    const date = new Date(dueDate)
    if (isPast(date)) return "text-red-600"
    if (isToday(date)) return "text-secondary-600"
    if (isTomorrow(date)) return "text-primary-600"
    return "text-gray-600"
  }
const groupedTasks = tasks.reduce((groups, task) => {
    const status = task.status || "to do"
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(task)
    return groups
  }, {})

  const getStatusIcon = (status) => {
    switch (status) {
      case "to do":
        return "CheckSquare"
      case "in progress":
        return "Clock"
      case "completed":
        return "CheckCircle"
      case "overdue":
        return "AlertTriangle"
      default:
        return "CheckSquare"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "to do":
        return "To Do"
      case "in progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "overdue":
        return "Overdue"
      default:
        return "To Do"
    }
  }

  // Sort status groups in logical order
  const statusOrder = ["to do", "in progress", "completed", "overdue"]

return (
    <div className="space-y-6">
      {statusOrder
        .filter(status => groupedTasks[status] && groupedTasks[status].length > 0)
        .map(status => (
          <div key={status} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name={getStatusIcon(status)} size={20} className="text-primary-600" />
              {getStatusLabel(status)}
              <span className={`status-badge status-${status.replace(' ', '-')}`}>
                {groupedTasks[status].length} task{groupedTasks[status].length !== 1 ? "s" : ""}
              </span>
            </h3>
<div className="space-y-3">
              {groupedTasks[status].map((task, index) => (
<motion.div
                  key={task.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative border rounded-xl transition-all duration-200 ${
                    task.completed 
                      ? "bg-green-50/50 border-green-200 shadow-sm" 
                      : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-lg"
                  }`}
                >
                  {/* Action buttons in top-right corner */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(task)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      title="Edit Task"
                    >
                      <ApperIcon name="Edit" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(task)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Task"
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </Button>
                  </div>

                  <div className="p-5 group">
                    {/* Header Section: Completion Button, Icon, Title & Priority */}
                    <div className="flex items-start gap-4 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComplete && onComplete(task)}
                        className={`mt-1 p-2 rounded-full transition-all ${
                          task.completed
                            ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                            : "border-2 border-gray-300 bg-white hover:border-primary-500 hover:bg-primary-50"
                        }`}
                      >
                        {task.completed && <ApperIcon name="Check" size={16} />}
                      </Button>

                      <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                        <ApperIcon name={getTaskIcon(task.type)} size={20} className="text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`text-lg font-semibold leading-tight ${
                            task.completed ? "text-gray-500 line-through" : "text-gray-900"
                          }`}>
                            {task.title}
                          </h4>
                          <Badge variant={getPriorityVariant(task.priority)} className="font-medium">
                            {task.priority?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mb-4"></div>

                    {/* Metadata Section: Farm, Crop, Due Date, Status */}
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <ApperIcon name="MapPin" size={16} className="text-gray-400" />
                        <span className="font-medium">{task.farmName}</span>
                      </div>
                      
                      {task.cropName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <ApperIcon name="Sprout" size={16} className="text-green-500" />
                          <span className="font-medium">{task.cropName}</span>
                        </div>
                      )}
                      
                      <div className={`flex items-center gap-2 font-semibold ${getDueDateColor(task.dueDate)}`}>
                        <ApperIcon name="Clock" size={16} />
                        <span>{getDueDateDisplay(task.dueDate)}</span>
                        {isPast(new Date(task.dueDate)) && !task.completed && (
                          <Badge variant="overdue" className="ml-1">
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                      
                      {task.status && (
                        <Badge variant={getStatusVariant(task.status)} className="font-medium">
                          {task.status.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    {/* Notes Section */}
                    {task.notes && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed">{task.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

export default TaskList