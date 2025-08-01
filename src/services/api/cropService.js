import cropsData from "@/services/mockData/crops.json"

const STORAGE_KEY = "farmkeeper_crops"

const loadCrops = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : [...cropsData]
}

const saveCrops = (crops) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crops))
}

const cropService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return loadCrops()
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const crops = loadCrops()
    const crop = crops.find(c => c.Id === parseInt(id))
    if (!crop) {
      throw new Error("Crop not found")
    }
    return crop
  },

  async getByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const crops = loadCrops()
    return crops.filter(c => c.farmId === parseInt(farmId))
  },

  async create(cropData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const crops = loadCrops()
    const maxId = crops.length > 0 ? Math.max(...crops.map(c => c.Id)) : 0
    const newCrop = {
      ...cropData,
      Id: maxId + 1,
      farmId: parseInt(cropData.farmId)
    }
    const updatedCrops = [...crops, newCrop]
    saveCrops(updatedCrops)
    return newCrop
  },

  async update(id, cropData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const crops = loadCrops()
    const index = crops.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Crop not found")
    }
    const updatedCrop = { 
      ...crops[index], 
      ...cropData, 
      Id: parseInt(id),
      farmId: parseInt(cropData.farmId)
    }
    crops[index] = updatedCrop
    saveCrops(crops)
    return updatedCrop
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const crops = loadCrops()
    const filteredCrops = crops.filter(c => c.Id !== parseInt(id))
    if (filteredCrops.length === crops.length) {
      throw new Error("Crop not found")
    }
    saveCrops(filteredCrops)
    return true
  }
}

export default cropService