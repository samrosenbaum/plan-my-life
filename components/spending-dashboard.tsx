"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SketchyCard } from "./sketchy-card"
import { SketchyPieChart } from "./sketchy-pie-chart"
import { SketchyBarChart } from "./sketchy-bar-chart"
import { SketchyLineChart } from "./sketchy-line-chart"
import { CardSelector } from "./card-selector"
import { MonthSelector } from "./month-selector"
import { TopMerchants } from "./top-merchants"
import { SpendingStats } from "./spending-stats"
import { TransactionModal } from "./transaction-modal"
import { MerchantSearch } from "./merchant-search"
import { SpendingChat } from "./spending-chat"
import { BudgetManager } from "./budget-manager"
import { SpendingAlerts } from "./spending-alerts"
import { chaseReserveData, amazonCardData, amexData, checkingData, dataYear } from "@/lib/spending-data"
import { useCredits, getTransactionKey } from "@/lib/credits-context"
import { useBudget } from "@/lib/budget-context"

export type CardType = "all" | "chase-sapphire" | "amazon" | "amex" | "checking"

type ModalContext = { type: "category"; value: string } | { type: "month"; value: string } | null

export default function SpendingDashboard() {
  const [selectedCard, setSelectedCard] = useState<CardType>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [modalContext, setModalContext] = useState<ModalContext>(null)
  const [merchantModal, setMerchantModal] = useState<{ title: string; transactions: typeof chaseReserveData } | null>(
    null,
  )
  const { getAdjustedAmount, getCategory } = useCredits()
  const { checkBudgets, detectAnomalies } = useBudget()

  const allCardData = useMemo(() => {
    let data: typeof chaseReserveData = []

    if (selectedCard === "all" || selectedCard === "chase-sapphire") {
      data = [...data, ...chaseReserveData]
    }
    if (selectedCard === "all" || selectedCard === "amazon") {
      data = [...data, ...amazonCardData]
    }
    if (selectedCard === "all" || selectedCard === "amex") {
      data = [...data, ...amexData]
    }
    if (selectedCard === "all" || selectedCard === "checking") {
      data = [...data, ...checkingData]
    }

    return data // Include all transactions - returns will be factored into net calculations
  }, [selectedCard])

  const filteredData = useMemo(() => {
    let data = allCardData

    if (selectedMonth !== "all") {
      data = data.filter((item) => item.month === selectedMonth)
    }

    return data
  }, [allCardData, selectedMonth])

  const totalSpending = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      const key = getTransactionKey(item.date, item.description, item.amount)
      const adjustedAmount = getAdjustedAmount(item.amount, key)
      // Negative amounts are purchases, positive are returns - sum them all for net
      return sum + Math.abs(Math.min(0, adjustedAmount)) - Math.max(0, adjustedAmount)
    }, 0)
  }, [filteredData, getAdjustedAmount])

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {}
    filteredData.forEach((item) => {
      const key = getTransactionKey(item.date, item.description, item.amount)
      const cat = getCategory(item.category || "Other", key)
      const adjustedAmount = getAdjustedAmount(item.amount, key)
      // Net: add absolute value of purchases, subtract returns
      if (adjustedAmount < 0) {
        categories[cat] = (categories[cat] || 0) + Math.abs(adjustedAmount)
      } else {
        categories[cat] = (categories[cat] || 0) - adjustedAmount
      }
    })
    return Object.entries(categories)
      .filter(([, value]) => value > 0) // Only show categories with positive net spending
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filteredData, getAdjustedAmount, getCategory])

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {}
    filteredData.forEach((item) => {
      const key = getTransactionKey(item.date, item.description, item.amount)
      const adjustedAmount = getAdjustedAmount(item.amount, key)
      if (adjustedAmount < 0) {
        months[item.month] = (months[item.month] || 0) + Math.abs(adjustedAmount)
      } else {
        months[item.month] = (months[item.month] || 0) - adjustedAmount
      }
    })
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthOrder.map((month) => ({
      month,
      amount: Math.max(0, months[month] || 0), // Ensure no negative totals
    }))
  }, [filteredData, getAdjustedAmount])

  const purchaseCount = useMemo(() => {
    return filteredData.filter((item) => item.amount < 0).length
  }, [filteredData])

  // Autonomous budget monitoring and anomaly detection
  useEffect(() => {
    // Check budgets against current spending
    const categorySpending: Record<string, number> = {}
    categoryData.forEach((cat) => {
      categorySpending[cat.name] = cat.value
    })
    checkBudgets(categorySpending)

    // Detect spending anomalies and recurring transactions
    detectAnomalies(filteredData)
  }, [categoryData, filteredData, checkBudgets, detectAnomalies])

  const modalTransactions = useMemo(() => {
    if (!modalContext) return []
    if (modalContext.type === "category") {
      return filteredData.filter((item) => {
        const key = getTransactionKey(item.date, item.description, item.amount)
        const effectiveCategory = getCategory(item.category, key)
        return effectiveCategory === modalContext.value
      })
    } else {
      return allCardData.filter((item) => item.month === modalContext.value)
    }
  }, [filteredData, allCardData, modalContext, getCategory])

  const modalTitle = useMemo(() => {
    if (!modalContext) return ""
    if (modalContext.type === "category") {
      return modalContext.value
    } else {
      const monthNames: Record<string, string> = {
        Jan: "January",
        Feb: "February",
        Mar: "March",
        Apr: "April",
        May: "May",
        Jun: "June",
        Jul: "July",
        Aug: "August",
        Sep: "September",
        Oct: "October",
        Nov: "November",
        Dec: "December",
      }
      return `${monthNames[modalContext.value] || modalContext.value} ${dataYear}`
    }
  }, [modalContext])

  const handleCategoryClick = (category: string) => {
    setModalContext({ type: "category", value: category })
  }

  const handleMonthClick = (month: string) => {
    setModalContext({ type: "month", value: month })
  }

  const handleMerchantSearchClick = (merchant: string, transactions: typeof chaseReserveData) => {
    setMerchantModal({ title: merchant, transactions })
  }

  const handleChatViewTransactions = (title: string, transactions: typeof chaseReserveData) => {
    setMerchantModal({ title, transactions })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-sketch">
            {dataYear} Spending Tracker
          </h1>
          <p className="text-muted-foreground text-lg">{"Where tf does my money go"}</p>
        </div>

        {/* Merchant Search Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <MerchantSearch data={allCardData} onMerchantClick={handleMerchantSearchClick} />
        </div>

        {/* Selectors */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <CardSelector selected={selectedCard} onSelect={setSelectedCard} />
          <MonthSelector selected={selectedMonth} onSelect={setSelectedMonth} />
        </div>

        {/* Stats Row */}
        <SpendingStats
          totalSpending={totalSpending}
          transactionCount={purchaseCount}
          avgTransaction={purchaseCount > 0 ? totalSpending / purchaseCount : 0}
        />

        {/* Autonomous Insights & Alerts */}
        <div className="mt-8">
          <SpendingAlerts />
        </div>

        {/* Budget Tracker */}
        <div className="mt-8">
          <BudgetManager categorySpending={Object.fromEntries(categoryData.map((c) => [c.name, c.value]))} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`pie-${selectedCard}-${selectedMonth}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <SketchyCard title="Spending by Category" icon="~">
                <SketchyPieChart data={categoryData} onCategoryClick={handleCategoryClick} />
              </SketchyCard>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`bar-${selectedCard}-${selectedMonth}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <SketchyCard title="Top Categories" icon="~">
                <SketchyBarChart data={categoryData.slice(0, 6)} onCategoryClick={handleCategoryClick} />
              </SketchyCard>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`line-${selectedCard}-${selectedMonth}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2"
            >
              <SketchyCard title="Monthly Spending Trend" icon="~">
                <SketchyLineChart data={monthlyData} onMonthClick={handleMonthClick} />
              </SketchyCard>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`merchants-${selectedCard}-${selectedMonth}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2"
            >
              <SketchyCard title="Top Merchants" icon="~">
                <TopMerchants data={filteredData} />
              </SketchyCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Doodle */}
        <div className="text-center mt-12 text-muted-foreground">
          <svg className="inline-block w-32 h-8" viewBox="0 0 128 32" fill="none">
            <path
              d="M4 16 Q 32 4, 64 16 Q 96 28, 124 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 4"
              className="opacity-40"
            />
          </svg>
          <p className="mt-2 text-sm">Made with care</p>
        </div>
      </motion.div>

      {/* Transaction Modal - now handles both category and month */}
      <TransactionModal
        isOpen={modalContext !== null}
        onClose={() => setModalContext(null)}
        title={modalTitle}
        transactions={modalTransactions}
      />

      {/* Merchant Modal from Search */}
      <TransactionModal
        isOpen={merchantModal !== null}
        onClose={() => setMerchantModal(null)}
        title={merchantModal?.title || ""}
        transactions={merchantModal?.transactions || []}
      />

      {/* Spending Chat Assistant */}
      <SpendingChat data={allCardData} dataYear={dataYear} onViewTransactions={handleChatViewTransactions} />
    </div>
  )
}
