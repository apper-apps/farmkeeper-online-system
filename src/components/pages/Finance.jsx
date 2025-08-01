import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import TransactionTable from "@/components/organisms/TransactionTable"
import StatCard from "@/components/molecules/StatCard"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import SearchBar from "@/components/molecules/SearchBar"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import transactionService from "@/services/api/transactionService"
import farmService from "@/services/api/farmService"

const Finance = () => {
  const [transactions, setTransactions] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [formData, setFormData] = useState({
    farmId: "",
    type: "expense",
    category: "",
    amount: "",
    date: "",
    description: ""
  })

  const incomeCategories = [
    "Crop Sales", "Livestock Sales", "Equipment Rental", "Government Subsidies", "Other Income"
  ]

  const expenseCategories = [
    "Seeds & Plants", "Fertilizer", "Pesticides", "Equipment", "Fuel", "Labor", "Utilities", "Insurance", "Maintenance", "Other Expenses"
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [transactionsData, farmsData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll()
      ])
      
      // Enrich transactions with farm names
      const enrichedTransactions = transactionsData.map(transaction => ({
        ...transaction,
        farmName: farmsData.find(farm => farm.Id === transaction.farmId)?.name || "Unknown Farm"
      }))
      
      setTransactions(enrichedTransactions)
      setFarms(farmsData)
    } catch (err) {
      setError("Failed to load transactions. Please try again.")
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.farmId || !formData.category || !formData.amount || !formData.date || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      let result
      if (editingTransaction) {
        result = await transactionService.update(editingTransaction.Id, transactionData)
        setTransactions(transactions.map(transaction => transaction.Id === editingTransaction.Id ? {
          ...result,
          farmName: farms.find(farm => farm.Id === result.farmId)?.name || "Unknown Farm"
        } : transaction))
        toast.success("Transaction updated successfully!")
      } else {
        result = await transactionService.create(transactionData)
        setTransactions([...transactions, {
          ...result,
          farmName: farms.find(farm => farm.Id === result.farmId)?.name || "Unknown Farm"
        }])
        toast.success("Transaction added successfully!")
      }

      resetForm()
    } catch (err) {
      toast.error(editingTransaction ? "Failed to update transaction" : "Failed to add transaction")
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      farmId: transaction.farmId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date.split('T')[0],
      description: transaction.description
    })
    setShowForm(true)
  }

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete this transaction? This action cannot be undone.`)) {
      return
    }

    try {
      await transactionService.delete(transaction.Id)
      setTransactions(transactions.filter(t => t.Id !== transaction.Id))
      toast.success("Transaction deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete transaction")
    }
  }

  const resetForm = () => {
    setFormData({
      farmId: "",
      type: "expense",
      category: "",
      amount: "",
      date: "",
      description: ""
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const getFilteredTransactions = () => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.farmName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === "all" || transaction.type === typeFilter
      return matchesSearch && matchesType
    })

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date()
      let startDate, endDate

      switch (dateRange) {
        case "thisMonth": {
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          break
        }
        case "thisYear": {
          startDate = startOfYear(now)
          endDate = endOfYear(now)
          break
        }
        default:
          return filtered
      }

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
    }

    return filtered
  }

  const filteredTransactions = getFilteredTransactions()

  const calculateStats = () => {
    const income = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = income - expenses
    
    return { income, expenses, balance }
  }

  const { income, expenses, balance } = calculateStats()

  const typeCounts = {
    all: transactions.length,
    income: transactions.filter(t => t.type === "income").length,
    expense: transactions.filter(t => t.type === "expense").length
  }

  const availableCategories = formData.type === "income" ? incomeCategories : expenseCategories

  if (loading) return <Loading rows={8} />
  if (error) return <Error message={error} onRetry={loadData} />

  if (farms.length === 0) {
    return (
      <Empty
        title="No farms available"
        description="You need to add a farm before you can record transactions."
        actionLabel="Add Farm"
        onAction={() => window.location.href = "/farms"}
        icon="MapPin"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600 mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} across {farms.length} farm{farms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" size={18} />
          Add Transaction
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={`$${income.toLocaleString()}`}
          icon="TrendingUp"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={`$${expenses.toLocaleString()}`}
          icon="TrendingDown"
          gradient="from-red-500 to-red-600"
        />
        <StatCard
          title="Net Balance"
          value={`$${balance.toLocaleString()}`}
          icon="DollarSign"
          gradient={balance >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"}
          trend={balance >= 0 ? "up" : "down"}
          trendValue={`$${Math.abs(balance).toLocaleString()}`}
        />
      </div>

      {/* Filters */}
      {transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCounts).map(([type, count]) => (
              <Button
                key={type}
                variant={typeFilter === type ? "primary" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className="text-sm"
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={dateRange === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setDateRange("all")}
              className="text-sm"
            >
              All Time
            </Button>
            <Button
              variant={dateRange === "thisMonth" ? "primary" : "outline"}
              size="sm"
              onClick={() => setDateRange("thisMonth")}
              className="text-sm"
            >
              This Month
            </Button>
            <Button
              variant={dateRange === "thisYear" ? "primary" : "outline"}
              size="sm"
              onClick={() => setDateRange("thisYear")}
              className="text-sm"
            >
              This Year
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      {transactions.length > 0 && (
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search transactions by description, category, or farm..."
          className="max-w-md"
        />
      )}

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <ApperIcon name="X" size={18} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Farm *"
                type="select"
                value={formData.farmId}
                onChange={(e) => setFormData({...formData, farmId: e.target.value})}
              >
                <option value="">Select a farm</option>
                {farms.map(farm => (
                  <option key={farm.Id} value={farm.Id}>{farm.name}</option>
                ))}
              </FormField>

              <FormField
                label="Type *"
                type="select"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value, category: ""})}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </FormField>

              <FormField
                label="Category *"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select a category</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FormField>

              <FormField
                label="Amount *"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="Enter amount"
              />

              <FormField
                label="Date *"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />

              <div className="md:col-span-1 lg:col-span-1">
                <FormField
                  label="Description *"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the transaction"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                <Button type="submit" className="flex-1 sm:flex-none">
                  <ApperIcon name={editingTransaction ? "Save" : "Plus"} size={18} />
                  {editingTransaction ? "Update Transaction" : "Add Transaction"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        transactions.length === 0 ? (
          <Empty
            title="No transactions yet"
            description="Record your first transaction to start tracking your farm finances."
            actionLabel="Add Transaction"
            onAction={() => setShowForm(true)}
            icon="DollarSign"
          />
        ) : (
          <div className="text-center py-12">
            <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Finance