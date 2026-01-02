"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TransactionModal } from "./transaction-modal"
import { useCredits, getTransactionKey } from "@/lib/credits-context"

interface Transaction {
  date: string
  description: string
  amount: number
  category: string
  month: string
  card: string
  isReturn?: boolean
}

interface TopMerchantsProps {
  data: Transaction[]
}

export function TopMerchants({ data }: TopMerchantsProps) {
  const [showAll, setShowAll] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"total" | "largest">("total")
  const { getAdjustedAmount } = useCredits()

  const { merchants, merchantTransactions } = useMemo(() => {
    const merchantTotals: Record<
      string,
      { total: number; count: number; largest: number; transactions: Transaction[] }
    > = {}

    data.forEach((item) => {
      const merchant = item.description
        .replace(/\*.*$/, "")
        .replace(/\d{5,}/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 30)

      if (merchant.length < 3) return

      const key = getTransactionKey(item.date, item.description, item.amount)
      const adjustedAmount = getAdjustedAmount(item.amount, key)

      if (!merchantTotals[merchant]) {
        merchantTotals[merchant] = { total: 0, count: 0, largest: 0, transactions: [] }
      }

      if (adjustedAmount < 0) {
        // Purchase - add the absolute value
        merchantTotals[merchant].total += Math.abs(adjustedAmount)
        merchantTotals[merchant].largest = Math.max(merchantTotals[merchant].largest, Math.abs(adjustedAmount))
      } else if (adjustedAmount > 0) {
        // Return/credit - subtract from total
        merchantTotals[merchant].total -= adjustedAmount
      }

      merchantTotals[merchant].count++
      merchantTotals[merchant].transactions.push(item)
    })

    const sortedMerchants = Object.entries(merchantTotals)
      .filter(([, data]) => data.total > 0) // Only show merchants with positive net spending
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => (sortBy === "total" ? b.total - a.total : b.largest - a.largest))
      .slice(0, 30)

    return {
      merchants: sortedMerchants,
      merchantTransactions: merchantTotals,
    }
  }, [data, sortBy, getAdjustedAmount])

  const displayedMerchants = showAll ? merchants : merchants.slice(0, 12)
  const maxTotal = merchants[0]?.[sortBy === "total" ? "total" : "largest"] || 1

  const getMerchantEmoji = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("amazon")) return "📦"
    if (lower.includes("uber")) return "🚗"
    if (lower.includes("doordash") || lower.includes("food")) return "🍔"
    if (lower.includes("netflix") || lower.includes("hulu")) return "🎬"
    if (lower.includes("safeway") || lower.includes("grocery") || lower.includes("groce")) return "🛒"
    if (lower.includes("delta") || lower.includes("united") || lower.includes("airline") || lower.includes("jetblue"))
      return "✈️"
    if (lower.includes("hotel") || lower.includes("westin")) return "🏨"
    if (lower.includes("apple")) return "🍎"
    if (lower.includes("target") || lower.includes("walmart")) return "🎯"
    if (lower.includes("gas") || lower.includes("shell") || lower.includes("loop")) return "⛽"
    if (lower.includes("coffee") || lower.includes("starbucks") || lower.includes("philz")) return "☕"
    if (lower.includes("fitness") || lower.includes("equinox")) return "💪"
    if (lower.includes("marisa") || lower.includes("health")) return "🏥"
    if (lower.includes("printful") || lower.includes("printify")) return "🖨️"
    if (lower.includes("lyft") || lower.includes("waymo")) return "🚕"
    if (lower.includes("temu")) return "🛍️"
    if (lower.includes("j.crew") || lower.includes("jcrew")) return "👕"
    return "🏪"
  }

  const handleMerchantClick = (merchantName: string) => {
    setSelectedMerchant(merchantName)
  }

  const selectedTransactions = selectedMerchant ? merchantTransactions[selectedMerchant]?.transactions || [] : []

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortBy("total")}
          className={`px-3 py-1.5 text-sm rounded-lg border-2 border-dashed transition-colors ${
            sortBy === "total"
              ? "bg-primary/10 border-primary text-primary font-medium"
              : "border-border/50 text-muted-foreground hover:border-primary/30"
          }`}
        >
          By Total Spent
        </button>
        <button
          onClick={() => setSortBy("largest")}
          className={`px-3 py-1.5 text-sm rounded-lg border-2 border-dashed transition-colors ${
            sortBy === "largest"
              ? "bg-primary/10 border-primary text-primary font-medium"
              : "border-border/50 text-muted-foreground hover:border-primary/30"
          }`}
        >
          By Largest Purchase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {displayedMerchants.map((merchant, index) => {
            const value = sortBy === "total" ? merchant.total : merchant.largest
            const percentage = (value / maxTotal) * 100

            return (
              <motion.button
                key={merchant.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                layout
                onClick={() => handleMerchantClick(merchant.name)}
                className="relative bg-muted/30 rounded-lg p-3 border border-border/50 overflow-hidden text-left hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer"
                style={{ borderRadius: "8px 12px 10px 14px" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className="absolute left-0 top-0 h-full bg-primary/10"
                  style={{ borderRadius: "8px 12px 10px 14px" }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0">{getMerchantEmoji(merchant.name)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{merchant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {merchant.count} transaction{merchant.count > 1 ? "s" : ""} - click to view
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-primary">
                      ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    {sortBy === "largest" && merchant.count > 1 && (
                      <p className="text-xs text-muted-foreground">
                        ${merchant.total.toLocaleString(undefined, { maximumFractionDigits: 0 })} total
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {merchants.length > 12 && (
        <motion.button
          onClick={() => setShowAll(!showAll)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-2 text-sm text-primary font-medium border-2 border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        >
          {showAll ? "Show Less" : `Show ${merchants.length - 12} More`}
        </motion.button>
      )}

      <TransactionModal
        isOpen={selectedMerchant !== null}
        onClose={() => setSelectedMerchant(null)}
        title={selectedMerchant || ""}
        transactions={selectedTransactions}
      />
    </div>
  )
}
