// This file now re-exports parsed data from the CSV parser
import { getAllTransactions, getRentTransactions, type Transaction } from "./csv-parser"

// Parse CSVs and get all transactions
const allTransactions = getAllTransactions()
const rentTransactions = getRentTransactions()

// Filter by card
export const chaseReserveData = allTransactions.filter((t) => t.card === "chase-sapphire")
export const amazonCardData = allTransactions.filter((t) => t.card === "amazon")
export const amexData = allTransactions.filter((t) => t.card === "amex")
export const checkingData = rentTransactions

export type { Transaction }
