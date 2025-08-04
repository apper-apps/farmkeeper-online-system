import React from "react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { motion } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
const TaskList = ({ tasks, viewMode = "list", onComplete, onEdit, onDelete, onDragEnd }) => {
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

if (viewMode === "kanban") {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusOrder.map(status => (
            <div key={status} className="bg-gray-50 rounded-xl p-4 min-h-[400px]">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name={getStatusIcon(status)} size={18} className="text-primary-600" />
                <span>{getStatusLabel(status)}</span>
                <span className={`status-badge status-${status.replace(' ', '-')} ml-auto`}>
                  {groupedTasks[status]?.length || 0}
                </span>
              </h3>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[300px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary-50 border-2 border-dashed border-primary-300' : ''
                    }`}
                  >
                    {(groupedTasks[status] || [])
                      .sort((a, b) => (a.kanbanOrder || 0) - (b.kanbanOrder || 0))
                      .map((task, index) => (
                        <Draggable key={task.Id} draggableId={task.Id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`group relative border rounded-xl p-4 transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? "bg-white border-primary-300 shadow-2xl rotate-2 scale-105 z-50" 
                                  : task.completed 
                                    ? "bg-green-50/50 border-green-200 shadow-sm cursor-grab" 
                                    : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-md cursor-grab"
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                                  : provided.draggableProps.style?.transform
                              }}
                            >
                              {/* Drag indicator */}
                              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-60 transition-opacity">
                                <ApperIcon name="GripVertical" size={14} className="text-gray-400" />
                              </div>

                              {/* Action buttons */}
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit && onEdit(task)
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                  title="Edit Task"
                                >
                                  <ApperIcon name="Edit" size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete && onDelete(task)
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Task"
                                >
                                  <ApperIcon name="Trash2" size={12} />
                                </Button>
                              </div>

                              {/* Task header */}
                              <div className="flex items-start gap-3 mb-3 mt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onComplete && onComplete(task)
                                  }}
                                  className={`p-1 rounded-full transition-all ${
                                    task.completed
                                      ? "bg-green-500 text-white hover:bg-green-600"
                                      : "border border-gray-300 bg-white hover:border-primary-500 hover:bg-primary-50"
                                  }`}
                                >
                                  {task.completed && <ApperIcon name="Check" size={12} />}
                                </Button>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm font-semibold leading-tight mb-1 ${
                                    task.completed ? "text-gray-500 line-through" : "text-gray-900"
                                  }`}>
                                    {task.title}
                                  </h4>
                                  <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                                    {task.priority?.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              {/* Task type icon */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg">
                                  <ApperIcon name={getTaskIcon(task.type)} size={16} className="text-primary-600" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">{task.type}</span>
                              </div>

                              {/* Task metadata */}
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <ApperIcon name="MapPin" size={12} className="text-gray-400" />
                                  <span className="font-medium truncate">{task.farmName}</span>
                                </div>
                                
                                {task.cropName && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <ApperIcon name="Sprout" size={12} className="text-green-500" />
                                    <span className="font-medium truncate">{task.cropName}</span>
                                  </div>
                                )}
                                
                                <div className={`flex items-center gap-2 font-semibold ${getDueDateColor(task.dueDate)}`}>
                                  <ApperIcon name="Clock" size={12} />
                                  <span>{getDueDateDisplay(task.dueDate)}</span>
                                </div>
                              </div>

                              {/* Notes */}
                              {task.notes && (
                                <div className="mt-3 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-700 line-clamp-2">{task.notes}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    
                    {(!groupedTasks[status] || groupedTasks[status].length === 0) && (
                      <div className="text-center py-8 text-gray-400">
                        <ApperIcon name="CheckSquare" size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No {getStatusLabel(status).toLowerCase()} tasks</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    )
  }

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
                  className={`group relative border rounded-xl transition-all duration-200 ${
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