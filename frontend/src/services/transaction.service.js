import api from "../config/api"

const deposit = (form)=>api.post("/api/transactions/deposit", {...form})
const withdraw = (form)=>api.post("/api/transactions/withdrawal", {...form})
const getTransactions = ()=> api.get("/api/transactions")

export {deposit, withdraw, getTransactions}