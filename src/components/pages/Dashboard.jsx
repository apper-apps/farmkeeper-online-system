import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import StatCard from "@/components/molecules/StatCard"
import WeatherCard from "@/components/molecules/WeatherCard"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import farmService from "@/services/api/farmService"
import cropService from "@/services/api/cropService"
import taskService from "@/services/api/taskService"
import transactionService from "@/services/api/transactionService"
import weatherService from "@/services/api/weatherService"

const Dashboard = () => {
  const navigate = useNavigate()
  const [farms, setFarms] = useState([])
  const [crops, setCrops] = useState([])
  const [tasks, setTasks] = useState([])
  const [transactions, setTransactions] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [farmsData, cropsData, tasksData, transactionsData, weatherData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getAll(),
        weatherService.getCurrentWeather()
      ])

      setFarms(farmsData)
      setCrops(cropsData)
      setTasks(tasksData)
      setTransactions(transactionsData)
      setWeather(weatherData)
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed }
      await taskService.update(task.Id, updatedTask)
      setTasks(tasks.map(t => t.Id === task.Id ? updatedTask : t))
      toast.success(updatedTask.completed ? "Task completed!" : "Task reopened")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  if (loading) return <Loading showCards={true} />
  if (error) return <Error message={error} onRetry={loadDashboardData} />
const activeCrops = (crops || []).filter(crop => crop.status !== "harvested")
  const pendingTasks = (tasks || []).filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const now = new Date()
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear()
  })
  
  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
    
  const monthlyExpenses = thisMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
    
  const monthlyBalance = monthlyIncome - monthlyExpenses

  const upcomingTasks = pendingTasks
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  if (farms.length === 0) {
    return (
      <Empty
        title="Welcome to FarmKeeper!"
        description="Start by adding your first farm to begin managing your agricultural operations."
        actionLabel="Add Your First Farm"
        onAction={() => navigate("/farms")}
        icon="Wheat"
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farms"
          value={farms.length}
          icon="MapPin"
          gradient="from-primary-500 to-primary-600"
        />
        <StatCard
          title="Active Crops"
          value={activeCrops.length}
          icon="Sprout"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          icon="CheckSquare"
          gradient="from-secondary-500 to-secondary-600"
        />
        <StatCard
          title="Monthly Balance"
          value={`$${monthlyBalance.toLocaleString()}`}
          icon="DollarSign"
          gradient={monthlyBalance >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"}
          trend={monthlyBalance >= 0 ? "up" : "down"}
          trendValue={`$${Math.abs(monthlyBalance).toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ApperIcon name="Activity" size={24} className="text-primary-600" />
                Recent Activity
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tasks")}
              >
                View All Tasks
              </Button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">All caught up! No pending tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.Id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskComplete(task)}
                      className="p-2 rounded-full border-2 border-gray-300 hover:border-primary-500"
                    >
                      {task.completed && <ApperIcon name="Check" size={16} />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <Badge variant={task.priority === "high" ? "high" : task.priority === "medium" ? "medium" : "low"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {task.farmName} • Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ApperIcon name="DollarSign" size={24} className="text-primary-600" />
                Recent Transactions
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/finance")}
              >
                View All
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Receipt" size={48} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.Id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === "income" 
                          ? "bg-green-100 text-green-600" 
                          : "bg-red-100 text-red-600"
                      }`}>
                        <ApperIcon 
                          name={transaction.type === "income" ? "TrendingUp" : "TrendingDown"} 
                          size={18} 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Weather Widget */}
          {weather && <WeatherCard weather={weather} />}

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ApperIcon name="Zap" size={24} className="text-primary-600" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => navigate("/crops")}
              >
                <ApperIcon name="Plus" size={18} />
                Add New Crop
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/tasks")}
              >
                <ApperIcon name="CheckSquare" size={18} />
                Create Task
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/finance")}
              >
                <ApperIcon name="DollarSign" size={18} />
                Record Transaction
              </Button>
            </div>
          </div>

          {/* Farm Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ApperIcon name="BarChart3" size={24} className="text-primary-600" />
              Farm Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Area</span>
                <span className="font-semibold text-gray-900">
                  {farms.reduce((sum, farm) => sum + farm.size, 0)} acres
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Tasks</span>
                <span className="font-semibold text-green-600">
                  {completedTasks.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Income</span>
                <span className="font-semibold text-green-600">
                  ${monthlyIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Expenses</span>
                <span className="font-semibold text-red-600">
                  ${monthlyExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard