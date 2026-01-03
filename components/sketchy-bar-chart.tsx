"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface BarData {
  name: string
  value: number
}

interface SketchyBarChartProps {
  data: BarData[]
  onCategoryClick?: (category: string) => void
}

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export function SketchyBarChart({ data, onCategoryClick }: SketchyBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxValue = Math.max(...data.map((d) => d.value))

  const handleBarClick = (name: string) => {
    if (onCategoryClick) {
      onCategoryClick(name)
    }
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100
        const isHovered = hoveredIndex === index

        return (
          <motion.button
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="cursor-pointer w-full text-left"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleBarClick(item.name)}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`text-sm transition-all ${isHovered ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                {item.name}
              </span>
              <motion.span animate={{ scale: isHovered ? 1.1 : 1 }} className="text-sm font-medium text-foreground">
                ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </motion.span>
            </div>
            <div className="relative h-8 bg-muted/50 rounded-lg overflow-hidden border-2 border-dashed border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${percentage}%`,
                  height: isHovered ? "100%" : "100%",
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-md"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: "6px 12px 8px 10px",
                }}
              />
              {/* Hand-drawn effect overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <path
                  d={`M 0 ${4 + (index % 3)} Q ${percentage / 4}% ${2 + (index % 2)}, ${percentage / 2}% ${6 - (index % 3)}`}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
              </svg>
            </div>
          </motion.button>
        )
      })}
      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground pt-2">Click a bar to see transactions</p>
    </div>
  )
}
