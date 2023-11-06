import api from "../config/api"

export const login = (form) => api.post("/login", {...form})
export const register = (form) => api.post("/user", {...form})
