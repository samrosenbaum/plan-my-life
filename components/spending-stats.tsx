"use client"

import { motion } from "framer-motion"

interface SpendingStatsProps {
  totalSpending: number
  transactionCount: number
  avgTransaction: number
}

export function SpendingStats({ totalSpending, transactionCount, avgTransaction }: SpendingStatsProps) {
  const stats = [
    {
      label: "Total Spent",
      value: `$${totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: "💰",
      color: "#F97316",
    },
    {
      label: "Transactions",
      value: transactionCount.toLocaleString(),
      icon: "🧾",
      color: "#3B82F6",
    },
    {
      label: "Avg. Transaction",
      value: `$${avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: "📊",
      color: "#10B981",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          className="relative bg-card rounded-lg p-4 border-2 border-border shadow-sketchy overflow-hidden"
          style={{ borderRadius: "10px 14px 12px 16px" }}
        >
          {/* Background doodle */}
          <svg className="absolute right-2 bottom-2 w-16 h-16 opacity-10" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" stroke={stat.color} strokeWidth="2" fill="none" strokeDasharray="8 4" />
          </svg>

          <div className="relative flex items-center gap-3">
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold font-sketch" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
