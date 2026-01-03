"use client"

import { motion } from "framer-motion"
import type { CardType } from "./spending-dashboard"

interface CardSelectorProps {
  selected: CardType
  onSelect: (card: CardType) => void
}

const cards = [
  { id: "all" as CardType, name: "All Cards", icon: "💳", color: "#6366F1" },
  {
    id: "chase-sapphire" as CardType,
    name: "Sapphire Reserve",
    icon: "💎",
    color: "#1E3A8A",
  },
  {
    id: "amazon" as CardType,
    name: "Amazon Card",
    icon: "📦",
    color: "#F97316",
  },
  { id: "amex" as CardType, name: "Amex Platinum", icon: "✨", color: "#047857" },
  { id: "checking" as CardType, name: "Checking", icon: "🏦", color: "#7C3AED" },
]

export function CardSelector({ selected, onSelect }: CardSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {cards.map((card) => (
        <motion.button
          key={card.id}
          onClick={() => onSelect(card.id)}
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
            selected === card.id
              ? "bg-primary text-primary-foreground border-primary shadow-sketchy"
              : "bg-card text-foreground border-border hover:border-primary/50"
          }`}
          style={{
            borderRadius: selected === card.id ? "12px 8px 14px 10px" : "10px",
          }}
        >
          <span className="text-lg">{card.icon}</span>
          <span className="text-sm font-medium">{card.name}</span>
        </motion.button>
      ))}
    </div>
  )
}
