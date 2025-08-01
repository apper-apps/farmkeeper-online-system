import React from "react"
import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "My Farms", href: "/farms", icon: "MapPin" },
    { name: "Crops", href: "/crops", icon: "Sprout" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
    { name: "Finance", href: "/finance", icon: "DollarSign" },
    { name: "Weather", href: "/weather", icon: "CloudSun" },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
          <ApperIcon name="Wheat" size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">FarmKeeper</h1>
          <p className="text-sm text-gray-600">Agriculture Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={() => onClose && onClose()}
          >
            <ApperIcon name={item.icon} size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ApperIcon name="Lightbulb" size={20} className="text-primary-600" />
            <h3 className="font-semibold text-primary-800">Quick Tip</h3>
          </div>
          <p className="text-sm text-primary-700">
            Check your tasks daily to stay on top of your farm operations!
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:bg-surface lg:border-r lg:border-gray-200 lg:shadow-lg">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex flex-col w-80 bg-surface shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <ApperIcon name="Wheat" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-display">FarmKeeper</h1>
                  <p className="text-sm text-gray-600">Agriculture Management</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ApperIcon name="X" size={20} className="text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={onClose}
                >
                  <ApperIcon name={item.icon} size={20} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar