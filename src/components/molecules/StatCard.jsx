import React from "react"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  className,
  gradient = "from-primary-500 to-primary-600"
}) => {
  return (
    <div className={cn("card p-6 card-hover", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <ApperIcon name={icon} size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === "up" ? "text-green-600" : 
            trend === "down" ? "text-red-600" : "text-gray-600"
          }`}>
            <ApperIcon 
              name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"} 
              size={16} 
            />
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  )
}

export default StatCard