"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react"
import { useBudget, type BudgetLimit } from "@/lib/budget-context"

interface BudgetManagerProps {
  categorySpending: Record<string, number>
}

export function BudgetManager({ categorySpending }: BudgetManagerProps) {
  const { budgets, setBudget, removeBudget } = useBudget()
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newLimit, setNewLimit] = useState("")
  const [newThreshold, setNewThreshold] = useState("80")

  const handleAddBudget = () => {
    if (newCategory && newLimit && !isNaN(Number(newLimit))) {
      setBudget(newCategory, Number(newLimit), Number(newThreshold))
      setNewCategory("")
      setNewLimit("")
      setNewThreshold("80")
      setIsAdding(false)
    }
  }

  const getBudgetStatus = (budget: BudgetLimit) => {
    const spent = categorySpending[budget.category] || 0
    const percentage = (spent / budget.monthlyLimit) * 100
    const remaining = budget.monthlyLimit - spent

    if (percentage >= 100) {
      return { status: "exceeded", percentage, remaining, color: "text-red-500", icon: AlertTriangle }
    } else if (percentage >= budget.alertThreshold) {
      return { status: "warning", percentage, remaining, color: "text-yellow-500", icon: TrendingUp }
    } else {
      return { status: "ok", percentage, remaining, color: "text-green-500", icon: CheckCircle2 }
    }
  }

  return (
    <div className="bg-card border-2 border-dashed border-border rounded-xl p-6" style={{ borderRadius: "14px 18px 16px 20px" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold font-sketch">Budget Tracker</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-muted/30 border-2 border-dashed border-border rounded-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Food & Drink"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Limit ($)</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Alert at (%)</label>
                <input
                  type="number"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="80"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddBudget}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Save Budget
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewCategory("")
                  setNewLimit("")
                  setNewThreshold("80")
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {budgets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No budgets set yet</p>
          <p className="text-sm">Add a budget to track your spending and get alerts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const { status, percentage, remaining, color, icon: Icon } = getBudgetStatus(budget)
            const spent = categorySpending[budget.category] || 0

            return (
              <motion.div
                key={budget.category}
                layout
                className="p-4 bg-muted/20 border-2 border-dashed border-border rounded-lg"
                style={{ borderRadius: "12px 16px 14px 18px" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <h4 className="text-lg font-semibold">{budget.category}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${spent.toFixed(2)} of ${budget.monthlyLimit.toFixed(2)} spent
                    </p>
                  </div>
                  <button
                    onClick={() => removeBudget(budget.category)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      className={`h-full ${
                        status === "exceeded"
                          ? "bg-red-500"
                          : status === "warning"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${color}`}>{percentage.toFixed(1)}% used</span>
                  {remaining >= 0 ? (
                    <span className="text-muted-foreground">${remaining.toFixed(2)} remaining</span>
                  ) : (
                    <span className="text-red-500 font-medium">${Math.abs(remaining).toFixed(2)} over budget</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
