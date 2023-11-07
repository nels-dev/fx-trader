import { AbcOutlined } from "@mui/icons-material";
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
})

export default api;