import api from "../config/api"

const getPortfolio = ()=>api.get("/api/portfolio")

export {getPortfolio}