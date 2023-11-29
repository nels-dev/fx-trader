import api from "../config/api"
export const addNotificationRule = (form) => api.post("/api/notifications" , {...form})
export const getNotifications = ()=>api.get("/api/notifications")
export const deleteNotificationRule = (id) => api.delete(`/api/notifications/${id}`)