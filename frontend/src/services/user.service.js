import api from "../config/api"

const login = (form)=>api.post("/login", {...form})

export {login}