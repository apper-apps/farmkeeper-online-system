import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek, subMonths, addMonths } from "date-fns"
import jsPDF from "jspdf"
import "jspdf-autotable"
import Papa from "papaparse"
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
  const [showReports, setShowReports] = useState(false)
  const [reportPeriod, setReportPeriod] = useState("monthly")
  const [reportFormat, setReportFormat] = useState("csv")
  const [reportDateRange, setReportDateRange] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd")
  })
  const [generatingReport, setGeneratingReport] = useState(false)
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

  // Report Generation Functions
  const getReportData = () => {
    const startDate = new Date(reportDateRange.startDate)
    const endDate = new Date(reportDateRange.endDate)
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  const generateReportSummary = (reportTransactions) => {
    const income = reportTransactions.filter(t => t.type === "income")
    const expenses = reportTransactions.filter(t => t.type === "expense")
    
    const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const netProfit = totalIncome - totalExpenses
    
    // Category breakdown
    const categoryBreakdown = {}
    reportTransactions.forEach(transaction => {
      const key = `${transaction.type}-${transaction.category}`
      if (!categoryBreakdown[key]) {
        categoryBreakdown[key] = {
          type: transaction.type,
          category: transaction.category,
          amount: 0,
          count: 0
        }
      }
      categoryBreakdown[key].amount += parseFloat(transaction.amount)
      categoryBreakdown[key].count += 1
    })
    
    // Monthly breakdown if reporting period spans multiple months
    const monthlyBreakdown = {}
    if (reportPeriod === "monthly") {
      reportTransactions.forEach(transaction => {
        const monthKey = format(new Date(transaction.date), "yyyy-MM")
        if (!monthlyBreakdown[monthKey]) {
          monthlyBreakdown[monthKey] = { income: 0, expenses: 0, transactions: 0 }
        }
        if (transaction.type === "income") {
          monthlyBreakdown[monthKey].income += parseFloat(transaction.amount)
        } else {
          monthlyBreakdown[monthKey].expenses += parseFloat(transaction.amount)
        }
        monthlyBreakdown[monthKey].transactions += 1
      })
    }
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      transactionCount: reportTransactions.length,
      categoryBreakdown: Object.values(categoryBreakdown),
      monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({
        month,
        ...data,
        netProfit: data.income - data.expenses
      }))
    }
  }

  const generateCSVReport = async () => {
    setGeneratingReport(true)
    try {
      const reportTransactions = getReportData()
      const summary = generateReportSummary(reportTransactions)
      
      // Prepare CSV data
      const csvData = []
      
      // Add summary header
      csvData.push(['FARM FINANCIAL REPORT'])
      csvData.push(['Report Period:', `${reportDateRange.startDate} to ${reportDateRange.endDate}`])
      csvData.push(['Generated:', format(new Date(), "yyyy-MM-dd HH:mm:ss")])
      csvData.push([])
      
      // Add summary statistics
      csvData.push(['SUMMARY'])
      csvData.push(['Total Income:', `$${summary.totalIncome.toFixed(2)}`])
      csvData.push(['Total Expenses:', `$${summary.totalExpenses.toFixed(2)}`])
      csvData.push(['Net Profit/Loss:', `$${summary.netProfit.toFixed(2)}`])
      csvData.push(['Total Transactions:', summary.transactionCount])
      csvData.push([])
      
      // Add category breakdown
      if (summary.categoryBreakdown.length > 0) {
        csvData.push(['CATEGORY BREAKDOWN'])
        csvData.push(['Type', 'Category', 'Amount', 'Transaction Count'])
        summary.categoryBreakdown.forEach(cat => {
          csvData.push([
            cat.type.charAt(0).toUpperCase() + cat.type.slice(1),
            cat.category,
            `$${cat.amount.toFixed(2)}`,
            cat.count
          ])
        })
        csvData.push([])
      }
      
      // Add monthly breakdown if available
      if (summary.monthlyBreakdown.length > 0 && reportPeriod === "monthly") {
        csvData.push(['MONTHLY BREAKDOWN'])
        csvData.push(['Month', 'Income', 'Expenses', 'Net Profit', 'Transactions'])
        summary.monthlyBreakdown.forEach(month => {
          csvData.push([
            format(new Date(month.month + '-01'), "MMM yyyy"),
            `$${month.income.toFixed(2)}`,
            `$${month.expenses.toFixed(2)}`,
            `$${month.netProfit.toFixed(2)}`,
            month.transactions
          ])
        })
        csvData.push([])
      }
      
      // Add detailed transactions
      csvData.push(['DETAILED TRANSACTIONS'])
      csvData.push(['Date', 'Farm', 'Type', 'Category', 'Amount', 'Description'])
      
      reportTransactions.forEach(transaction => {
        const farm = farms.find(f => f.Id === transaction.farmId)
        csvData.push([
          format(new Date(transaction.date), "yyyy-MM-dd"),
          farm ? farm.name : 'Unknown Farm',
          transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
          transaction.category,
          `$${parseFloat(transaction.amount).toFixed(2)}`,
          transaction.description || ''
        ])
      })
      
      // Generate and download CSV
      const csv = Papa.unparse(csvData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `farm_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('CSV report generated and downloaded successfully!')
    } catch (error) {
      console.error('Error generating CSV report:', error)
      toast.error('Failed to generate CSV report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const generatePDFReport = async () => {
    setGeneratingReport(true)
    try {
      const reportTransactions = getReportData()
      const summary = generateReportSummary(reportTransactions)
      
      const doc = new jsPDF()
      let yPosition = 20
      
      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text('Farm Financial Report', 20, yPosition)
      yPosition += 15
      
      // Report details
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Report Period: ${reportDateRange.startDate} to ${reportDateRange.endDate}`, 20, yPosition)
      yPosition += 8
      doc.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`, 20, yPosition)
      yPosition += 15
      
      // Summary section
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text('Summary', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Total Income: $${summary.totalIncome.toFixed(2)}`, 20, yPosition)
      yPosition += 8
      doc.text(`Total Expenses: $${summary.totalExpenses.toFixed(2)}`, 20, yPosition)
      yPosition += 8
      doc.text(`Net Profit/Loss: $${summary.netProfit.toFixed(2)}`, 20, yPosition)
      yPosition += 8
      doc.text(`Total Transactions: ${summary.transactionCount}`, 20, yPosition)
      yPosition += 15
      
      // Category breakdown table
      if (summary.categoryBreakdown.length > 0) {
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text('Category Breakdown', 20, yPosition)
        yPosition += 10
        
        const categoryTableData = summary.categoryBreakdown.map(cat => [
          cat.type.charAt(0).toUpperCase() + cat.type.slice(1),
          cat.category,
          `$${cat.amount.toFixed(2)}`,
          cat.count.toString()
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['Type', 'Category', 'Amount', 'Count']],
          body: categoryTableData,
          theme: 'striped',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [124, 179, 66] }
        })
        
        yPosition = doc.lastAutoTable.finalY + 15
      }
      
      // Monthly breakdown if available
      if (summary.monthlyBreakdown.length > 0 && reportPeriod === "monthly") {
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text('Monthly Breakdown', 20, yPosition)
        yPosition += 10
        
        const monthlyTableData = summary.monthlyBreakdown.map(month => [
          format(new Date(month.month + '-01'), "MMM yyyy"),
          `$${month.income.toFixed(2)}`,
          `$${month.expenses.toFixed(2)}`,
          `$${month.netProfit.toFixed(2)}`,
          month.transactions.toString()
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['Month', 'Income', 'Expenses', 'Net Profit', 'Transactions']],
          body: monthlyTableData,
          theme: 'striped',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [124, 179, 66] }
        })
        
        yPosition = doc.lastAutoTable.finalY + 15
      }
      
      // Detailed transactions table
      if (reportTransactions.length > 0) {
        if (yPosition > 150) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text('Detailed Transactions', 20, yPosition)
        yPosition += 10
        
        const transactionTableData = reportTransactions.map(transaction => {
          const farm = farms.find(f => f.Id === transaction.farmId)
          return [
            format(new Date(transaction.date), "yyyy-MM-dd"),
            farm ? farm.name : 'Unknown',
            transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            transaction.category,
            `$${parseFloat(transaction.amount).toFixed(2)}`,
            (transaction.description || '').substring(0, 30) + ((transaction.description || '').length > 30 ? '...' : '')
          ]
        })
        
        doc.autoTable({
          startY: yPosition,
          head: [['Date', 'Farm', 'Type', 'Category', 'Amount', 'Description']],
          body: transactionTableData,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [124, 179, 66] },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 40 }
          }
        })
      }
      
      // Save PDF
      doc.save(`farm_report_${format(new Date(), "yyyy-MM-dd")}.pdf`)
      toast.success('PDF report generated and downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF report:', error)
      toast.error('Failed to generate PDF report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleGenerateReport = async () => {
    if (reportFormat === "csv") {
      await generateCSVReport()
    } else {
      await generatePDFReport()
    }
  }

  const setQuickDateRange = (range) => {
    const now = new Date()
    let startDate, endDate
    
    switch (range) {
      case "thisMonth":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case "lastMonth":
        const lastMonth = subMonths(now, 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      case "thisYear":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case "lastYear":
        const lastYear = new Date(now.getFullYear() - 1, 0, 1)
        startDate = startOfYear(lastYear)
        endDate = endOfYear(lastYear)
        break
      default:
        return
    }
    
    setReportDateRange({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd")
    })
  }

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
{/* Reports Section */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg">
                <ApperIcon name="FileText" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
                <p className="text-sm text-gray-600">Download detailed financial reports</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReports(!showReports)}
              className="flex items-center gap-2"
            >
              <ApperIcon name={showReports ? "ChevronUp" : "ChevronDown"} size={16} />
              {showReports ? "Hide" : "Show"} Options
            </Button>
          </div>

          <AnimatePresence>
            {showReports && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Quick Date Range Buttons */}
                <div>
                  <label className="label-field">Quick Date Ranges</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "thisMonth", label: "This Month" },
                      { key: "lastMonth", label: "Last Month" },
                      { key: "thisYear", label: "This Year" },
                      { key: "lastYear", label: "Last Year" }
                    ].map(range => (
                      <Button
                        key={range.key}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDateRange(range.key)}
                        className="text-xs"
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Report Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div className="md:col-span-2">
                    <label className="label-field">Custom Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={reportDateRange.startDate}
                        onChange={(e) => setReportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="input-field text-sm"
                      />
                      <input
                        type="date"
                        value={reportDateRange.endDate}
                        onChange={(e) => setReportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  {/* Report Period */}
                  <div>
                    <label className="label-field">Report Period</label>
                    <select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      className="input-field"
                    >
                      <option value="monthly">Monthly Breakdown</option>
                      <option value="summary">Summary Only</option>
                    </select>
                  </div>

                  {/* Report Format */}
                  <div>
                    <label className="label-field">Format</label>
                    <select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="input-field"
                    >
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Report will include {getReportData().length} transactions from{" "}
                    {format(new Date(reportDateRange.startDate), "MMM dd, yyyy")} to{" "}
                    {format(new Date(reportDateRange.endDate), "MMM dd, yyyy")}
                  </div>
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={generatingReport || getReportData().length === 0}
                    className="flex items-center gap-2"
                  >
                    {generatingReport ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Download" size={16} />
                        Generate {reportFormat.toUpperCase()} Report
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                resetForm();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
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
              </div>
            </motion.div>
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