import tasksData from "@/services/mockData/tasks.json"

const STORAGE_KEY = "farmkeeper_tasks"

const loadTasks = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : [...tasksData]
}

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

const taskService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return loadTasks()
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const tasks = loadTasks()
    const task = tasks.find(t => t.Id === parseInt(id))
    if (!task) {
      throw new Error("Task not found")
    }
    return task
  },

  async getByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const tasks = loadTasks()
    return tasks.filter(t => t.farmId === parseInt(farmId))
  },

  async getByCropId(cropId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const tasks = loadTasks()
    return tasks.filter(t => t.cropId === parseInt(cropId))
  },

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const tasks = loadTasks()
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      farmId: parseInt(taskData.farmId),
      cropId: taskData.cropId ? parseInt(taskData.cropId) : null,
      completed: false
    }
    const updatedTasks = [...tasks, newTask]
    saveTasks(updatedTasks)
    return newTask
  },

  async update(id, taskData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const tasks = loadTasks()
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    const updatedTask = { 
      ...tasks[index], 
      ...taskData, 
      Id: parseInt(id),
      farmId: parseInt(taskData.farmId),
      cropId: taskData.cropId ? parseInt(taskData.cropId) : null
    }
    tasks[index] = updatedTask
    saveTasks(tasks)
    return updatedTask
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const tasks = loadTasks()
    const filteredTasks = tasks.filter(t => t.Id !== parseInt(id))
    if (filteredTasks.length === tasks.length) {
      throw new Error("Task not found")
    }
    saveTasks(filteredTasks)
    return true
  }
}

export default taskService