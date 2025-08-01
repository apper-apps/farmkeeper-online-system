import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"

const FarmCard = ({ farm, onView, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <ApperIcon name="MapPin" size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
            <p className="text-gray-600 flex items-center gap-1">
              <ApperIcon name="Navigation" size={14} />
              {farm.location}
            </p>
          </div>
        </div>
        <Badge variant="default">
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">
            {farm.size}
          </div>
          <div className="text-sm text-gray-600">{farm.sizeUnit}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-primary-600">
            {farm.activeCrops || 0}
          </div>
          <div className="text-sm text-gray-600">Active Crops</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Created {new Date(farm.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView && onView(farm)}
          >
            <ApperIcon name="Eye" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm" 
            onClick={() => onEdit && onEdit(farm)}
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(farm)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default FarmCard