"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface BudgetLimit {
  category: string
  monthlyLimit: number
  alertThreshold: number // percentage (e.g., 80 = alert at 80% of budget)
}

export interface SpendingAlert {
  id: string
  type: "budget_warning" | "budget_exceeded" | "unusual_spending" | "recurring_detected"
  category?: string
  message: string
  amount?: number
  timestamp: number
  dismissed: boolean
}

interface BudgetContextType {
  budgets: BudgetLimit[]
  alerts: SpendingAlert[]
  setBudget: (category: string, limit: number, threshold: number) => void
  removeBudget: (category: string) => void
  dismissAlert: (alertId: string) => void
  checkBudgets: (categorySpending: Record<string, number>) => void
  detectAnomalies: (
    transactions: Array<{ amount: number; date: string; category: string; description: string }>
  ) => void
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<BudgetLimit[]>([])
  const [alerts, setAlerts] = useState<SpendingAlert[]>([])

  // Load budgets and alerts from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem("money-tracker-budgets")
    const savedAlerts = localStorage.getItem("money-tracker-alerts")

    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts))
    }
  }, [])

  // Save budgets to localStorage
  useEffect(() => {
    localStorage.setItem("money-tracker-budgets", JSON.stringify(budgets))
  }, [budgets])

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem("money-tracker-alerts", JSON.stringify(alerts))
  }, [alerts])

  const setBudget = (category: string, limit: number, threshold: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category)
      if (existing) {
        return prev.map((b) => (b.category === category ? { category, monthlyLimit: limit, alertThreshold: threshold } : b))
      }
      return [...prev, { category, monthlyLimit: limit, alertThreshold: threshold }]
    })
  }

  const removeBudget = (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)))
  }

  const addAlert = (alert: Omit<SpendingAlert, "id" | "timestamp" | "dismissed">) => {
    const newAlert: SpendingAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      dismissed: false,
    }
    setAlerts((prev) => [newAlert, ...prev])
  }

  const checkBudgets = (categorySpending: Record<string, number>) => {
    budgets.forEach((budget) => {
      const spent = categorySpending[budget.category] || 0
      const percentage = (spent / budget.monthlyLimit) * 100

      // Check if we should alert
      if (percentage >= 100) {
        // Budget exceeded
        const existingAlert = alerts.find(
          (a) => a.type === "budget_exceeded" && a.category === budget.category && !a.dismissed
        )
        if (!existingAlert) {
          addAlert({
            type: "budget_exceeded",
            category: budget.category,
            message: `Budget exceeded for ${budget.category}! Spent $${spent.toFixed(2)} of $${budget.monthlyLimit.toFixed(2)} budget.`,
            amount: spent - budget.monthlyLimit,
          })
        }
      } else if (percentage >= budget.alertThreshold) {
        // Approaching budget
        const existingAlert = alerts.find(
          (a) => a.type === "budget_warning" && a.category === budget.category && !a.dismissed
        )
        if (!existingAlert) {
          addAlert({
            type: "budget_warning",
            category: budget.category,
            message: `${percentage.toFixed(0)}% of ${budget.category} budget used ($${spent.toFixed(2)} of $${budget.monthlyLimit.toFixed(2)})`,
            amount: spent,
          })
        }
      }
    })
  }

  const detectAnomalies = (
    transactions: Array<{ amount: number; date: string; category: string; description: string }>
  ) => {
    // Detect recurring transactions
    const merchantCounts: Record<string, number> = {}
    transactions.forEach((t) => {
      const merchant = t.description.split(/[*#0-9]/)[0].trim()
      merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1
    })

    // Find recurring (appears 3+ times)
    Object.entries(merchantCounts).forEach(([merchant, count]) => {
      if (count >= 3) {
        const existingAlert = alerts.find(
          (a) => a.type === "recurring_detected" && a.message.includes(merchant) && !a.dismissed
        )
        if (!existingAlert) {
          addAlert({
            type: "recurring_detected",
            message: `Recurring charge detected: ${merchant} appears ${count} times this period`,
          })
        }
      }
    })

    // Detect unusual large transactions (> 3x average)
    const amounts = transactions.map((t) => Math.abs(t.amount)).filter((a) => a > 0)
    if (amounts.length > 10) {
      const average = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
      const threshold = average * 3

      transactions.forEach((t) => {
        if (Math.abs(t.amount) > threshold) {
          const existingAlert = alerts.find(
            (a) =>
              a.type === "unusual_spending" &&
              a.message.includes(t.description) &&
              !a.dismissed &&
              Date.now() - a.timestamp < 7 * 24 * 60 * 60 * 1000 // Within last 7 days
          )
          if (!existingAlert) {
            addAlert({
              type: "unusual_spending",
              message: `Unusually large transaction: ${t.description} - $${Math.abs(t.amount).toFixed(2)} (${((Math.abs(t.amount) / average) * 100).toFixed(0)}% above average)`,
              amount: Math.abs(t.amount),
            })
          }
        }
      })
    }
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        alerts,
        setBudget,
        removeBudget,
        dismissAlert,
        checkBudgets,
        detectAnomalies,
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const context = useContext(BudgetContext)
  if (!context) {
    throw new Error("useBudget must be used within BudgetProvider")
  }
  return context
}
