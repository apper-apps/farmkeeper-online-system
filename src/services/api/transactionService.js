import transactionsData from "@/services/mockData/transactions.json"

const STORAGE_KEY = "farmkeeper_transactions"

const loadTransactions = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : [...transactionsData]
}

const saveTransactions = (transactions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

const transactionService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return loadTransactions()
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const transactions = loadTransactions()
    const transaction = transactions.find(t => t.Id === parseInt(id))
    if (!transaction) {
      throw new Error("Transaction not found")
    }
    return transaction
  },

  async getByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const transactions = loadTransactions()
    return transactions.filter(t => t.farmId === parseInt(farmId))
  },

  async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const transactions = loadTransactions()
    const maxId = transactions.length > 0 ? Math.max(...transactions.map(t => t.Id)) : 0
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
      farmId: parseInt(transactionData.farmId)
    }
    const updatedTransactions = [...transactions, newTransaction]
    saveTransactions(updatedTransactions)
    return newTransaction
  },

  async update(id, transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const transactions = loadTransactions()
    const index = transactions.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Transaction not found")
    }
    const updatedTransaction = { 
      ...transactions[index], 
      ...transactionData, 
      Id: parseInt(id),
      farmId: parseInt(transactionData.farmId)
    }
    transactions[index] = updatedTransaction
    saveTransactions(transactions)
    return updatedTransaction
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const transactions = loadTransactions()
    const filteredTransactions = transactions.filter(t => t.Id !== parseInt(id))
    if (filteredTransactions.length === transactions.length) {
      throw new Error("Transaction not found")
    }
    saveTransactions(filteredTransactions)
    return true
  }
}

export default transactionService