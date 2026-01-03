import * as fs from "node:fs"
import * as path from "node:path"

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

// Helper function to read CSV files from the data directory
function readCSVFile(filename: string): string {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const filePath = path.join(dataDir, filename)
    return fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    console.error(`[CSV Parser] Failed to read ${filename}:`, error)
    return ""
  }
}

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
  const errors: string[] = []

  // Validate CSV has content
  if (lines.length < 2) {
    console.warn(`[CSV Parser] ${card}: CSV has no data rows`)
    return transactions
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 6) {
      errors.push(`Line ${i + 1}: Invalid format (expected 6+ columns, got ${parts.length})`)
      continue
    }

    const date = parts[0]?.trim()
    const description = parts[2]?.trim()
    const category = parts[3]?.trim()
    const type = parts[4]?.trim()
    const amountStr = parts[5]?.trim()

    // Skip payments
    if (type === "Payment" || description?.includes("AUTOMATIC PAYMENT")) continue

    // Validate required fields
    if (!date || !description || !amountStr) {
      errors.push(`Line ${i + 1}: Missing required fields`)
      continue
    }

    // Validate amount is a number
    const amount = Number.parseFloat(amountStr)
    if (isNaN(amount)) {
      errors.push(`Line ${i + 1}: Invalid amount "${amountStr}"`)
      continue
    }

    // Validate date format (MM/DD/YYYY)
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
      errors.push(`Line ${i + 1}: Invalid date format "${date}" (expected MM/DD/YYYY)`)
      continue
    }

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

  // Log errors if any (but don't throw - we want partial data)
  if (errors.length > 0) {
    console.warn(`[CSV Parser] ${card}: Found ${errors.length} error(s):`, errors.slice(0, 5))
    if (errors.length > 5) {
      console.warn(`[CSV Parser] ${card}: ... and ${errors.length - 5} more`)
    }
  }

  return transactions
}

function parseAmexCSV(csv: string): Transaction[] {
  const lines = csv.trim().split("\n")
  const transactions: Transaction[] = []
  const errors: string[] = []

  // Validate CSV has content
  if (lines.length < 2) {
    console.warn("[CSV Parser] amex: CSV has no data rows")
    return transactions
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 4) {
      errors.push(`Line ${i + 1}: Invalid format (expected 4+ columns, got ${parts.length})`)
      continue
    }

    const date = parts[0]?.trim()
    const description = parts[1]?.trim()
    const amountStr = parts[2]?.trim()
    const category = parts[3]?.trim() || "Other"

    // Skip payments
    if (description?.includes("PAYMENT") || description?.includes("AUTOPAY")) continue

    // Validate required fields
    if (!date || !description || !amountStr) {
      errors.push(`Line ${i + 1}: Missing required fields`)
      continue
    }

    // Validate amount is a number
    const amount = Number.parseFloat(amountStr)
    if (isNaN(amount)) {
      errors.push(`Line ${i + 1}: Invalid amount "${amountStr}"`)
      continue
    }

    // Validate date format (MM/DD/YYYY)
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
      errors.push(`Line ${i + 1}: Invalid date format "${date}" (expected MM/DD/YYYY)`)
      continue
    }

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

  // Log errors if any (but don't throw - we want partial data)
  if (errors.length > 0) {
    console.warn(`[CSV Parser] amex: Found ${errors.length} error(s):`, errors.slice(0, 5))
    if (errors.length > 5) {
      console.warn(`[CSV Parser] amex: ... and ${errors.length - 5} more`)
    }
  }

  return transactions
}

export function getAllTransactions(): Transaction[] {
  const chaseSapphireCSV = readCSVFile("chase-sapphire.csv")
  const amazonCardCSV = readCSVFile("amazon.csv")
  const amexCSV = readCSVFile("amex.csv")

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
