import React from "react"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item.",
  actionLabel = "Add New",
  onAction,
  icon = "Inbox"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-full p-8 mb-6">
        <ApperIcon 
          name={icon} 
          size={64} 
          className="text-primary-600"
        />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md text-lg">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary flex items-center gap-2 text-lg px-6 py-3"
        >
          <ApperIcon name="Plus" size={20} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default Empty