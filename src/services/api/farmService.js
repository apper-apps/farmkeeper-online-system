import farmsData from "@/services/mockData/farms.json"

const STORAGE_KEY = "farmkeeper_farms"

const loadFarms = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : [...farmsData]
}

const saveFarms = (farms) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(farms))
}

const farmService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return loadFarms()
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const farms = loadFarms()
    const farm = farms.find(f => f.Id === parseInt(id))
    if (!farm) {
      throw new Error("Farm not found")
    }
    return farm
  },

  async create(farmData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const farms = loadFarms()
    const maxId = farms.length > 0 ? Math.max(...farms.map(f => f.Id)) : 0
    const newFarm = {
      ...farmData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      activeCrops: 0
    }
    const updatedFarms = [...farms, newFarm]
    saveFarms(updatedFarms)
    return newFarm
  },

  async update(id, farmData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const farms = loadFarms()
    const index = farms.findIndex(f => f.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Farm not found")
    }
    const updatedFarm = { ...farms[index], ...farmData, Id: parseInt(id) }
    farms[index] = updatedFarm
    saveFarms(farms)
    return updatedFarm
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const farms = loadFarms()
    const filteredFarms = farms.filter(f => f.Id !== parseInt(id))
    if (filteredFarms.length === farms.length) {
      throw new Error("Farm not found")
    }
    saveFarms(filteredFarms)
    return true
  }
}

export default farmService