import { chaseSapphireCSV, amazonCardCSV, amexCSV } from "./raw-csv-data"

export interface Transaction {
  date: string
  description: string
  category: string
  amount: number
  month: string
  card: "chase-sapphire" | "amazon" | "amex" | "checking"
  isReturn?: boolean
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getMonthFromDate(dateStr: string): string {
  const parts = dateStr.split("/")
  const monthIndex = Number.parseInt(parts[0], 10) - 1
  return MONTHS[monthIndex] || "Jan"
}

function getYearFromDate(dateStr: string): number {
  const parts = dateStr.split("/")
  if (parts.length >= 3) {
    const year = Number.parseInt(parts[2], 10)
    return isNaN(year) ? new Date().getFullYear() : year
  }
  return new Date().getFullYear()
}

// Detect the year from transaction data
function detectDataYear(transactions: Transaction[]): number {
  if (transactions.length === 0) return new Date().getFullYear()

  // Get the most common year from transactions
  const yearCounts: Record<number, number> = {}
  transactions.forEach((t) => {
    const year = getYearFromDate(t.date)
    yearCounts[year] = (yearCounts[year] || 0) + 1
  })

  const mostCommonYear = Object.entries(yearCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  return mostCommonYear ? Number.parseInt(mostCommonYear, 10) : new Date().getFullYear()
}

function parseChaseCSV(csv: string, card: "chase-sapphire" | "amazon"): Transaction[] {
  const lines = csv.trim().split("\n")
  const transactions: Transaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 6) continue

    const date = parts[0]
    const description = parts[2]
    const category = parts[3]
    const type = parts[4]
    const amountStr = parts[5]

    if (type === "Payment" || description.includes("AUTOMATIC PAYMENT")) continue

    const amount = Number.parseFloat(amountStr)
    if (isNaN(amount)) continue

    const isReturn = amount > 0

    transactions.push({
      date,
      description: description.replace(/"/g, "").trim(),
      category: category || "Other",
      amount,
      month: getMonthFromDate(date),
      card,
      isReturn,
    })
  }

  return transactions
}

function parseAmexCSV(csv: string): Transaction[] {
  const lines = csv.trim().split("\n")
  const transactions: Transaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 4) continue

    const date = parts[0]
    const description = parts[1]
    const amountStr = parts[2]
    const category = parts[3] || "Other"

    if (description.includes("PAYMENT") || description.includes("AUTOPAY")) continue

    const amount = Number.parseFloat(amountStr)
    if (isNaN(amount)) continue

    // Amex: positive = purchase, negative = credit/return
    const isReturn = amount < 0

    transactions.push({
      date,
      description: description.replace(/"/g, "").trim(),
      category,
      // Flip sign: positive purchases become negative (spending)
      amount: -amount,
      month: getMonthFromDate(date),
      card: "amex",
      isReturn,
    })
  }

  return transactions
}

export function getAllTransactions(): Transaction[] {
  const chaseSapphire = parseChaseCSV(chaseSapphireCSV, "chase-sapphire")
  const amazon = parseChaseCSV(amazonCardCSV, "amazon")
  const amex = parseAmexCSV(amexCSV)

  return [...chaseSapphire, ...amazon, ...amex]
}

export function getDataYear(): number {
  const allTransactions = getAllTransactions()
  return detectDataYear(allTransactions)
}

export function getRentTransactions(year?: number): Transaction[] {
  const dataYear = year ?? getDataYear()
  return MONTHS.map((month, index) => ({
    date: `${String(index + 1).padStart(2, "0")}/01/${dataYear}`,
    description: "Monthly Rent Payment",
    category: "Rent",
    amount: -3335,
    month,
    card: "checking" as const,
    isReturn: false,
  }))
}
