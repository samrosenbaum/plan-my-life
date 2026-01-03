"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Check, ChevronDown, Tag } from "lucide-react"
import { useCredits, getTransactionKey, AVAILABLE_CATEGORIES } from "@/lib/credits-context"

interface Transaction {
  date: string
  description: string
  category: string
  amount: number
  month: string
  card: string
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  transactions: Transaction[]
}

export function TransactionModal({ isOpen, onClose, title, transactions }: TransactionModalProps) {
  const {
    credits,
    categoryOverrides,
    setCredit,
    removeCredit,
    getAdjustedAmount,
    setCategoryOverride,
    removeCategoryOverride,
    getCategory,
  } = useCredits()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [creditInput, setCreditInput] = useState("")
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null)

  const cardLabels: Record<string, string> = {
    "chase-reserve": "Chase Sapphire",
    "chase-amazon": "Amazon Card",
    amex: "Amex Platinum",
    checking: "Checking",
  }

  // Calculate total with adjusted amounts
  const total = transactions.reduce((sum, t) => {
    const key = getTransactionKey(t.date, t.description, t.amount)
    return sum + Math.abs(getAdjustedAmount(t.amount, key))
  }, 0)

  const handleStartEdit = (transaction: Transaction) => {
    const key = getTransactionKey(transaction.date, transaction.description, transaction.amount)
    setEditingKey(key)
    setEditingCategoryKey(null)
    const existingCredit = credits[key]
    setCreditInput(existingCredit !== undefined ? existingCredit.toString() : Math.abs(transaction.amount).toString())
  }

  const handleSaveCredit = (transaction: Transaction) => {
    const key = getTransactionKey(transaction.date, transaction.description, transaction.amount)
    const creditValue = Number.parseFloat(creditInput)
    if (!isNaN(creditValue) && creditValue >= 0) {
      if (creditValue === 0) {
        removeCredit(key)
      } else {
        setCredit(key, Math.min(creditValue, Math.abs(transaction.amount)))
      }
    }
    setEditingKey(null)
    setCreditInput("")
  }

  const handleRemoveCredit = (transaction: Transaction) => {
    const key = getTransactionKey(transaction.date, transaction.description, transaction.amount)
    removeCredit(key)
    setEditingKey(null)
    setCreditInput("")
  }

  const handleFullRefund = (transaction: Transaction) => {
    const key = getTransactionKey(transaction.date, transaction.description, transaction.amount)
    setCredit(key, Math.abs(transaction.amount))
    setEditingKey(null)
    setCreditInput("")
  }

  const handleCategoryChange = (transaction: Transaction, newCategory: string) => {
    const key = getTransactionKey(transaction.date, transaction.description, transaction.amount)
    if (newCategory === transaction.category) {
      removeCategoryOverride(key)
    } else {
      setCategoryOverride(key, newCategory)
    }
    setEditingCategoryKey(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-background border-2 border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ borderRadius: "12px 16px 14px 18px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-dashed border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground font-sketch">{title}</h2>
                <p className="text-sm text-muted-foreground">
                  {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} totaling $
                  {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-muted-foreground mb-3">
                Click on a transaction to add credits. Click the category tag to reassign it.
              </p>
              <div className="space-y-2">
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction, index) => {
                    const key = getTransactionKey(transaction.date, transaction.description, transaction.amount)
                    const hasCredit = credits[key] !== undefined
                    const creditAmount = credits[key] || 0
                    const adjustedAmount = getAdjustedAmount(transaction.amount, key)
                    const isEditing = editingKey === key
                    const isFullRefund = creditAmount >= Math.abs(transaction.amount)
                    const currentCategory = getCategory(transaction.category, key)
                    const hasOverride = categoryOverrides[key] !== undefined
                    const isEditingCategory = editingCategoryKey === key

                    return (
                      <motion.div
                        key={`${transaction.date}-${transaction.description}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`p-3 rounded-lg border transition-colors ${
                          hasCredit
                            ? isFullRefund
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-yellow-500/10 border-yellow-500/30"
                            : "bg-muted/30 border-border/50 hover:bg-muted/50"
                        }`}
                        style={{ borderRadius: "6px 10px 8px 12px" }}
                      >
                        {isEditing ? (
                          // Edit credit mode
                          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground truncate flex-1">
                                {transaction.description}
                              </p>
                              <button
                                onClick={() => {
                                  setEditingKey(null)
                                  setCreditInput("")
                                }}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Credit amount: $</span>
                              <input
                                type="number"
                                value={creditInput}
                                onChange={(e) => setCreditInput(e.target.value)}
                                className="w-24 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                min="0"
                                max={Math.abs(transaction.amount)}
                                step="0.01"
                                autoFocus
                              />
                              <span className="text-xs text-muted-foreground">
                                of ${Math.abs(transaction.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveCredit(transaction)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                onClick={() => handleFullRefund(transaction)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Full Refund
                              </button>
                              {hasCredit && (
                                <button
                                  onClick={() => handleRemoveCredit(transaction)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate cursor-pointer ${isFullRefund ? "line-through text-muted-foreground" : "text-foreground"}`}
                                onClick={() => handleStartEdit(transaction)}
                              >
                                {transaction.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-1">
                                <span>{transaction.date}</span>
                                <span>•</span>
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                  {cardLabels[transaction.card] || transaction.card}
                                </span>
                                <span>•</span>
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingCategoryKey(isEditingCategory ? null : key)
                                      setEditingKey(null)
                                    }}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                                      hasOverride
                                        ? "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
                                        : "bg-muted hover:bg-muted/80"
                                    }`}
                                  >
                                    <Tag className="w-3 h-3" />
                                    {currentCategory}
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                  {/* Category dropdown */}
                                  {isEditingCategory && (
                                    <div
                                      className="absolute top-full left-0 mt-1 z-10 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[160px] max-h-48 overflow-y-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {AVAILABLE_CATEGORIES.map((cat) => (
                                        <button
                                          key={cat}
                                          onClick={() => handleCategoryChange(transaction, cat)}
                                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                                            currentCategory === cat ? "bg-primary/10 text-primary font-medium" : ""
                                          }`}
                                        >
                                          {cat}
                                          {cat === transaction.category && hasOverride && (
                                            <span className="text-xs text-muted-foreground ml-1">(original)</span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {hasCredit && (
                                  <>
                                    <span>•</span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded ${isFullRefund ? "bg-green-500/20 text-green-700" : "bg-yellow-500/20 text-yellow-700"}`}
                                    >
                                      {isFullRefund ? "Refunded" : `$${creditAmount.toFixed(2)} credit`}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div
                              className="text-right ml-2 cursor-pointer"
                              onClick={() => handleStartEdit(transaction)}
                            >
                              {hasCredit && !isFullRefund && (
                                <p className="text-xs text-muted-foreground line-through">
                                  ${Math.abs(transaction.amount).toFixed(2)}
                                </p>
                              )}
                              <p className={`text-sm font-bold ${isFullRefund ? "text-green-600" : "text-primary"}`}>
                                ${Math.abs(adjustedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
