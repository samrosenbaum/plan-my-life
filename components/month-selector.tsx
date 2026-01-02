"use client"

import { motion } from "framer-motion"

interface MonthSelectorProps {
  selected: string
  onSelect: (month: string) => void
}

const months = [
  { id: "all", name: "All Year" },
  { id: "Jan", name: "Jan" },
  { id: "Feb", name: "Feb" },
  { id: "Mar", name: "Mar" },
  { id: "Apr", name: "Apr" },
  { id: "May", name: "May" },
  { id: "Jun", name: "Jun" },
  { id: "Jul", name: "Jul" },
  { id: "Aug", name: "Aug" },
  { id: "Sep", name: "Sep" },
  { id: "Oct", name: "Oct" },
  { id: "Nov", name: "Nov" },
  { id: "Dec", name: "Dec" },
]

export function MonthSelector({ selected, onSelect }: MonthSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {months.map((month) => (
        <motion.button
          key={month.id}
          onClick={() => onSelect(month.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selected === month.id
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          {month.name}
        </motion.button>
      ))}
    </div>
  )
}
