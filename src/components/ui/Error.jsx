import React from "react"
import ApperIcon from "@/components/ApperIcon"

const Error = ({ 
  message = "Something went wrong while loading the data.",
  onRetry,
  showRetry = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-full p-6 mb-6">
        <ApperIcon 
          name="AlertTriangle" 
          size={48} 
          className="text-red-500"
        />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {message}
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center gap-2"
        >
          <ApperIcon name="RefreshCw" size={18} />
          Try Again
        </button>
      )}
    </div>
  )
}

export default Error