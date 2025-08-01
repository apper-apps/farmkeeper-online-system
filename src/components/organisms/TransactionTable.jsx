import React from "react"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  const getTransactionIcon = (type) => {
    return type === "income" ? "TrendingUp" : "TrendingDown"
  }

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Math.abs(amount))
    
    return type === "income" ? `+${formatted}` : `-${formatted}`
  }

  const getAmountColor = (type) => {
    return type === "income" ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="card p-6">
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Description</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Category</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Farm</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Date</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-900">Amount</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.Id} className="border-b border-gray-100">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === "income" 
                        ? "bg-gradient-to-br from-green-100 to-green-50" 
                        : "bg-gradient-to-br from-red-100 to-red-50"
                    }`}>
                      <ApperIcon 
                        name={getTransactionIcon(transaction.type)} 
                        size={18} 
                        className={transaction.type === "income" ? "text-green-600" : "text-red-600"}
                      />
                    </div>
                    <Badge variant={transaction.type}>
                      {transaction.type}
                    </Badge>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{transaction.description}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-600">{transaction.category}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-900">{transaction.farmName}</span>
                </td>
                <td className="py-4 px-4 text-gray-900">
                  {format(new Date(transaction.date), "MMM dd, yyyy")}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-bold text-lg ${getAmountColor(transaction.type)}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(transaction)}
                      title="Edit Transaction"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(transaction)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Transaction"
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

export default TransactionTable