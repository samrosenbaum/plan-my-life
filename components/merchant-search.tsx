"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"
import { useCredits, getTransactionKey } from "@/lib/credits-context"

interface Transaction {
  date: string
  description: string
  category: string
  amount: number
  month: string
  card: string
  isReturn?: boolean
}

interface MerchantSearchProps {
  data: Transaction[]
  onMerchantClick: (merchant: string, transactions: Transaction[]) => void
}

function normalizeMerchant(description: string): string {
  return description
    .toUpperCase() // Normalize case
    .replace(/\*.*$/, "") // Remove everything after *
    .replace(/\d{5,}/g, "") // Remove long number sequences (order IDs, etc.)
    .replace(/\s+#\d+/g, "") // Remove transaction numbers like " #12345"
    .replace(/\s+-\s+.*/g, "") // Remove everything after " - "
    .replace(/\s+\d{1,2}\/\d{1,2}$/g, "") // Remove trailing dates like " 12/25"
    .replace(/TST\*?\s*/g, "") // Remove "TST*" or "TST" prefix
    .replace(/SP\s+/g, "") // Remove "SP " prefix
    .replace(/DD\s+\*/g, "") // Remove "DD *" prefix (DoorDash)
    .replace(/AMZN\s+MKTP\s+US\*/gi, "AMAZON ") // Normalize Amazon Marketplace
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim()
    .slice(0, 40) // Allow slightly longer names
}

export function MerchantSearch({ data, onMerchantClick }: MerchantSearchProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const { getAdjustedAmount } = useCredits()

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase()
    const merchantMap: Record<string, { total: number; count: number; transactions: Transaction[] }> = {}

    data.forEach((item) => {
      const normalizedName = normalizeMerchant(item.description)
      // Match against both normalized name and original description
      if (normalizedName.toLowerCase().includes(lowerQuery) || item.description.toLowerCase().includes(lowerQuery)) {
        const key = getTransactionKey(item.date, item.description, item.amount)
        const adjustedAmount = getAdjustedAmount(item.amount, key)

        if (!merchantMap[normalizedName]) {
          merchantMap[normalizedName] = { total: 0, count: 0, transactions: [] }
        }

        // Correctly calculate net spending: purchases (negative) - returns (positive)
        if (adjustedAmount < 0) {
          // Purchase: add absolute value to spending
          merchantMap[normalizedName].total += Math.abs(adjustedAmount)
        } else if (adjustedAmount > 0) {
          // Return/credit: subtract from spending
          merchantMap[normalizedName].total -= adjustedAmount
        }

        merchantMap[normalizedName].count += 1
        merchantMap[normalizedName].transactions.push(item)
      }
    })

    return Object.entries(merchantMap)
      .filter(([name, data]) => name.length >= 3) // Show all merchants with valid names
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        transactions: data.transactions,
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total)) // Sort by absolute spending (highest activity first)
      .slice(0, 10)
  }, [query, data, getAdjustedAmount])

  const totalForQuery = useMemo(() => {
    return searchResults.reduce((sum, r) => sum + r.total, 0)
  }, [searchResults])

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-card border-2 border-dashed rounded-xl transition-all ${
          isFocused ? "border-primary shadow-lg" : "border-border"
        }`}
        style={{
          borderRadius: "12px 16px 14px 18px",
        }}
      >
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search merchants... (e.g., waymo, uber, amazon)"
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {query.trim() && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-dashed border-border rounded-xl shadow-lg z-50 overflow-hidden"
            style={{
              borderRadius: "14px 12px 16px 14px",
            }}
          >
            <div className="p-3 border-b border-dashed border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-bold text-foreground">{searchResults.length}</span> merchant(s) matching "
                {query}"
              </p>
              <p className="text-lg font-bold text-primary font-sketch">
                Net Total: $
                {totalForQuery.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <motion.button
                  key={result.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onMerchantClick(result.name, result.transactions)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left border-b border-dashed border-border/50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground truncate max-w-[250px]">{result.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.count} transaction{result.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-bold text-primary font-sketch">
                    ${result.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {query.trim() && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-dashed border-border rounded-xl shadow-lg z-50 p-4 text-center"
            style={{
              borderRadius: "14px 12px 16px 14px",
            }}
          >
            <p className="text-muted-foreground">No merchants found matching "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
