import React from "react"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"

const CropTable = ({ crops, onEdit, onDelete, onViewTasks }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case "planted":
        return "planted"
      case "growing":
        return "growing"
      case "ready":
        return "ready"
      case "harvested":
        return "harvested"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "planted":
        return "Seedling"
      case "growing":
        return "Sprout"
      case "ready":
        return "Wheat"
      case "harvested":
        return "Package"
      default:
        return "Sprout"
    }
  }

  return (
    <div className="card p-6">
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Crop</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Farm</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Planted</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Expected Harvest</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Area</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop) => (
              <tr key={crop.Id} className="border-b border-gray-100">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg">
                      <ApperIcon name={getStatusIcon(crop.status)} size={18} className="text-primary-600" />
                    </div>
                    <div>
<div className="font-medium text-gray-900">{crop.Name}</div>
                      {crop.variety && (
                        <div className="text-sm text-gray-600">{crop.variety}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-900">{crop.farmName}</span>
                </td>
                <td className="py-4 px-4">
                  <Badge variant={getStatusVariant(crop.status)}>
                    {crop.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-gray-900">
                  {format(new Date(crop.plantingDate), "MMM dd, yyyy")}
                </td>
                <td className="py-4 px-4 text-gray-900">
                  {format(new Date(crop.expectedHarvestDate), "MMM dd, yyyy")}
                </td>
                <td className="py-4 px-4 text-gray-900">
                  {crop.area} acres
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewTasks && onViewTasks(crop)}
                      title="View Tasks"
                    >
                      <ApperIcon name="CheckSquare" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(crop)}
                      title="Edit Crop"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(crop)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Crop"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CropTable