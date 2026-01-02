"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, X, Sparkles } from "lucide-react"
import { useCredits, getTransactionKey } from "@/lib/credits-context"

interface Transaction {
  date: string
  description: string
  category: string
  amount: number
  month: string
  card: string
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  data?: {
    total?: number
    count?: number
    merchants?: { name: string; total: number; count: number }[]
    categories?: { name: string; total: number }[]
    months?: { month: string; total: number }[]
  }
}

interface SpendingChatProps {
  data: Transaction[]
  onViewTransactions: (title: string, transactions: Transaction[]) => void
}

export function SpendingChat({ data, onViewTransactions }: SpendingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hey! Ask me anything about your spending. Try questions like:\n\n• How much did I spend on Waymo?\n• What's my biggest category?\n• Show me December spending\n• How much at Whole Foods?",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { getAdjustedAmount, getCategory } = useCredits()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const processQuery = (query: string): Message => {
    const lowerQuery = query.toLowerCase()
    const id = Date.now().toString()

    // Helper to get adjusted data
    const getAdjustedData = () => {
      return data.map((item) => {
        const key = getTransactionKey(item.date, item.description, item.amount)
        return {
          ...item,
          adjustedAmount: Math.abs(getAdjustedAmount(item.amount, key)),
          effectiveCategory: getCategory(item.category, key),
        }
      })
    }

    const adjustedData = getAdjustedData()

    // Check for merchant queries
    const merchantKeywords = [
      "spend on",
      "spent on",
      "spend at",
      "spent at",
      "how much at",
      "how much on",
      "total for",
      "total at",
    ]
    for (const keyword of merchantKeywords) {
      if (lowerQuery.includes(keyword)) {
        const merchantQuery = lowerQuery.split(keyword)[1]?.trim().replace("?", "")
        if (merchantQuery) {
          const matches = adjustedData.filter((item) => item.description.toLowerCase().includes(merchantQuery))

          if (matches.length > 0) {
            const total = matches.reduce((sum, item) => sum + item.adjustedAmount, 0)
            const merchantMap: Record<string, { total: number; count: number }> = {}
            matches.forEach((item) => {
              if (!merchantMap[item.description]) {
                merchantMap[item.description] = { total: 0, count: 0 }
              }
              merchantMap[item.description].total += item.adjustedAmount
              merchantMap[item.description].count += 1
            })

            const merchants = Object.entries(merchantMap)
              .map(([name, data]) => ({ name, ...data }))
              .sort((a, b) => b.total - a.total)

            return {
              id,
              type: "assistant" as const,
              content: `You spent **$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on "${merchantQuery}" across ${matches.length} transaction(s).`,
              data: { total, count: matches.length, merchants },
            }
          } else {
            return {
              id,
              type: "assistant" as const,
              content: `I couldn't find any transactions matching "${merchantQuery}". Try a different search term!`,
            }
          }
        }
      }
    }

    // Check for category queries
    if (
      lowerQuery.includes("biggest category") ||
      lowerQuery.includes("top category") ||
      lowerQuery.includes("most spending")
    ) {
      const categoryMap: Record<string, number> = {}
      adjustedData.forEach((item) => {
        categoryMap[item.effectiveCategory] = (categoryMap[item.effectiveCategory] || 0) + item.adjustedAmount
      })

      const categories = Object.entries(categoryMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)

      const top = categories[0]
      return {
        id,
        type: "assistant" as const,
        content: `Your biggest spending category is **${top.name}** at **$${top.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.`,
        data: { categories: categories.slice(0, 5) },
      }
    }

    // Check for month queries
    const monthNames: Record<string, string> = {
      january: "Jan",
      february: "Feb",
      march: "Mar",
      april: "Apr",
      may: "May",
      june: "Jun",
      july: "Jul",
      august: "Aug",
      september: "Sep",
      october: "Oct",
      november: "Nov",
      december: "Dec",
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    }

    for (const [name, abbrev] of Object.entries(monthNames)) {
      if (lowerQuery.includes(name)) {
        const monthData = adjustedData.filter((item) => item.month === abbrev)
        const total = monthData.reduce((sum, item) => sum + item.adjustedAmount, 0)

        const categoryMap: Record<string, number> = {}
        monthData.forEach((item) => {
          categoryMap[item.effectiveCategory] = (categoryMap[item.effectiveCategory] || 0) + item.adjustedAmount
        })

        const categories = Object.entries(categoryMap)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)

        return {
          id,
          type: "assistant" as const,
          content: `In **${name.charAt(0).toUpperCase() + name.slice(1)}**, you spent **$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** across ${monthData.length} transactions.`,
          data: { total, count: monthData.length, categories },
        }
      }
    }

    // Check for total spending
    if (lowerQuery.includes("total") && (lowerQuery.includes("spend") || lowerQuery.includes("year"))) {
      const total = adjustedData.reduce((sum, item) => sum + item.adjustedAmount, 0)
      return {
        id,
        type: "assistant" as const,
        content: `Your total spending for 2025 is **$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** across ${adjustedData.length} transactions.`,
        data: { total, count: adjustedData.length },
      }
    }

    // Check for card-specific queries
    const cardNames: Record<string, string> = {
      "chase sapphire": "chase-reserve",
      sapphire: "chase-reserve",
      reserve: "chase-reserve",
      amazon: "chase-amazon",
      amex: "amex",
      platinum: "amex",
      checking: "checking",
    }

    for (const [name, cardKey] of Object.entries(cardNames)) {
      if (lowerQuery.includes(name)) {
        const cardData = adjustedData.filter((item) => item.card === cardKey)
        const total = cardData.reduce((sum, item) => sum + item.adjustedAmount, 0)

        return {
          id,
          type: "assistant" as const,
          content: `On your **${name.charAt(0).toUpperCase() + name.slice(1)}** card, you spent **$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** across ${cardData.length} transactions.`,
          data: { total, count: cardData.length },
        }
      }
    }

    // Default response
    return {
      id,
      type: "assistant" as const,
      content:
        "I'm not sure I understood that. Try asking things like:\n• How much did I spend on [merchant]?\n• What's my biggest category?\n• Show me [month] spending\n• Total spending this year",
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    const response = processQuery(input)
    setTimeout(() => {
      setMessages((prev) => [...prev, response])
    }, 300)
    setInput("")
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"
        whileHover={{ rotate: [0, -10, 10, 0] }}
        style={{
          borderRadius: "50% 45% 50% 55%",
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[360px] max-h-[500px] bg-card border-2 border-dashed border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
              borderRadius: "20px 16px 18px 22px",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dashed border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold font-sketch text-foreground">Spending Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-xl ${
                      message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                    style={{
                      borderRadius: message.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}
                  >
                    <p className="text-sm whitespace-pre-line">
                      {message.content.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="font-bold">
                            {part}
                          </strong>
                        ) : (
                          part
                        ),
                      )}
                    </p>

                    {/* Data visualization */}
                    {message.data?.merchants && message.data.merchants.length > 1 && (
                      <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                        {message.data.merchants.slice(0, 3).map((m) => (
                          <div key={m.name} className="flex justify-between text-xs opacity-80">
                            <span className="truncate max-w-[150px]">{m.name}</span>
                            <span>${m.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.data?.categories && (
                      <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                        {message.data.categories.map((c) => (
                          <div key={c.name} className="flex justify-between text-xs opacity-80">
                            <span>{c.name}</span>
                            <span>${c.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-dashed border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your spending..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
