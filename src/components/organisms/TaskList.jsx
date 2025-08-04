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
    return "default"
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
    const date = format(new Date(task.dueDate), "yyyy-MM-dd")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(task)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([date, dateTasks]) => (
          <div key={date} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Calendar" size={20} className="text-primary-600" />
              {getDueDateDisplay(date)}
              <span className="text-sm font-normal text-gray-600">
                ({dateTasks.length} task{dateTasks.length !== 1 ? "s" : ""})
              </span>
            </h3>
            
            <div className="space-y-3">
              {dateTasks.map((task, index) => (
                <motion.div
                  key={task.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    task.completed 
                      ? "bg-green-50 border-green-200" 
                      : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-md"
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComplete && onComplete(task)}
                    className={`p-2 rounded-full ${
                      task.completed
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "border-2 border-gray-300 hover:border-primary-500"
                    }`}
                  >
                    {task.completed && <ApperIcon name="Check" size={16} />}
                  </Button>

                  <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg">
                    <ApperIcon name={getTaskIcon(task.type)} size={18} className="text-primary-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`font-medium ${
                        task.completed ? "text-gray-500 line-through" : "text-gray-900"
                      }`}>
                        {task.title}
                      </h4>
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
<div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <ApperIcon name="MapPin" size={14} />
                        {task.farmName}
                      </span>
                      {task.cropName && (
                        <span className="flex items-center gap-1">
                          <ApperIcon name="Sprout" size={14} />
                          {task.cropName}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 font-medium ${getDueDateColor(task.dueDate)}`}>
                        <ApperIcon name="Clock" size={14} />
                        {getDueDateDisplay(task.dueDate)}
                      </span>
                      {task.status && (
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
                      )}
                    </div>
                    {task.notes && (
                      <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(task)}
                      title="Edit Task"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(task)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Task"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
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