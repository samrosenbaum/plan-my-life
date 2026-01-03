"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, TrendingUp, Bell, RefreshCcw } from "lucide-react"
import { useBudget, type SpendingAlert } from "@/lib/budget-context"

export function SpendingAlerts() {
  const { alerts, dismissAlert } = useBudget()

  const activeAlerts = alerts.filter((a) => !a.dismissed)

  if (activeAlerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: SpendingAlert["type"]) => {
    switch (type) {
      case "budget_exceeded":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "budget_warning":
        return <TrendingUp className="w-5 h-5 text-yellow-500" />
      case "unusual_spending":
        return <Bell className="w-5 h-5 text-orange-500" />
      case "recurring_detected":
        return <RefreshCcw className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getAlertColor = (type: SpendingAlert["type"]) => {
    switch (type) {
      case "budget_exceeded":
        return "border-red-500/50 bg-red-500/5"
      case "budget_warning":
        return "border-yellow-500/50 bg-yellow-500/5"
      case "unusual_spending":
        return "border-orange-500/50 bg-orange-500/5"
      case "recurring_detected":
        return "border-blue-500/50 bg-blue-500/5"
      default:
        return "border-border bg-muted/20"
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold font-sketch flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Spending Insights ({activeAlerts.length})
      </h3>

      <AnimatePresence mode="popLayout">
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-4 border-2 border-dashed rounded-xl ${getAlertColor(alert.type)}`}
            style={{ borderRadius: "12px 16px 14px 18px" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                {alert.category && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Category: {alert.category}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(alert.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="flex-shrink-0 p-1.5 hover:bg-background/80 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
