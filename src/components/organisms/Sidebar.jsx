import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AuthContext } from '../../App'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.user)
  const { logout } = useContext(AuthContext)

const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'BarChart3' },
    { path: '/farms', label: 'Farms', icon: 'MapPin' },
    { path: '/crops', label: 'Crops', icon: 'Sprout' },
    { path: '/ready-to-harvest', label: 'Ready to Harvest', icon: 'Harvest' },
    { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
    { path: '/finance', label: 'Finance', icon: 'DollarSign' },
    { path: '/weather', label: 'Weather', icon: 'Sun' },
    { path: '/inventory', label: 'Inventory', icon: 'Package' },
  ]

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Sprout" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FarmKeeper</h1>
            <p className="text-sm text-gray-600">Agriculture Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <ApperIcon name={item.icon} size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.firstName?.charAt(0) || user.emailAddress?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.emailAddress}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.accounts?.[0]?.companyName || 'FarmKeeper User'}
                </p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full justify-center"
        >
          <ApperIcon name="LogOut" size={16} />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default Sidebar