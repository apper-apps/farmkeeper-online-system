import React from "react"
import { useLocation } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Header = ({ onMenuClick }) => {
  const location = useLocation()
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard"
      case "/farms":
        return "My Farms"
      case "/crops":
        return "Crops"
      case "/tasks":
        return "Tasks"
      case "/finance":
        return "Finance"
      case "/weather":
        return "Weather"
      default:
        return "FarmKeeper"
    }
  }

  const getPageDescription = () => {
    switch (location.pathname) {
      case "/":
        return "Overview of your farm operations"
      case "/farms":
        return "Manage your farm properties"
      case "/crops":
        return "Track your crop lifecycle"
      case "/tasks":
        return "Stay on top of farm activities"
      case "/finance":
        return "Monitor your farm finances"
      case "/weather":
        return "Weather updates for your farms"
      default:
        return "Agriculture management made simple"
    }
  }

  return (
    <header className="bg-surface border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600 mt-1">
              {getPageDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-2 rounded-lg">
            <ApperIcon name="Calendar" size={16} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-800">
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <ApperIcon name="Settings" size={16} />
            Settings
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header