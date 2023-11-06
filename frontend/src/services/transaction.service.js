import api from "../config/api"

export const deposit = (form) => api.post("/api/transactions/deposit",{...form})
export const withdraw = (form) => api.post("/api/transactions/withdrawal",{...form})
export const trade = (form) => api.post("/api/transactions/trade",{...form})
export const getTransactions = () => api.get("/api/transactions")
export const getTrades = () => api.get("/api/transactions/trades")
export const getQuote = (from, to) => api.get(`/api/quotes/${from}_${to}`)