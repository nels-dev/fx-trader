import api from "../config/api"

export const getPortfolio = ()=>api.get("/api/portfolio")
export const createPortfolio = (form) => api.post("/api/portfolio", {...form})
export const getAllowedCurrencies = ()=>api.get("/api/portfolio/allowed-currencies")
