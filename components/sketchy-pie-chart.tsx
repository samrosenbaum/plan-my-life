"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface PieData {
  name: string
  value: number
}

interface SketchyPieChartProps {
  data: PieData[]
  onCategoryClick?: (category: string) => void
}

const COLORS = [
  "#F97316", // orange
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
]

export function SketchyPieChart({ data, onCategoryClick }: SketchyPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  let currentAngle = -90 // Start from top

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const midRad = ((startAngle + endAngle) / 2) * (Math.PI / 180)

    const radius = 80
    const x1 = 100 + radius * Math.cos(startRad)
    const y1 = 100 + radius * Math.sin(startRad)
    const x2 = 100 + radius * Math.cos(endRad)
    const y2 = 100 + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    // Add some wobble to make it hand-drawn looking
    const wobble = index % 2 === 0 ? 2 : -2

    const path = `M 100 100 L ${x1 + wobble} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2 - wobble} ${y2} Z`

    // Label position
    const labelRadius = 110
    const labelX = 100 + labelRadius * Math.cos(midRad)
    const labelY = 100 + labelRadius * Math.sin(midRad)

    return {
      path,
      color: COLORS[index % COLORS.length],
      percentage,
      name: item.name,
      value: item.value,
      labelX,
      labelY,
    }
  })

  const handleSliceClick = (name: string) => {
    if (onCategoryClick) {
      onCategoryClick(name)
    }
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="w-full h-64 md:h-80">
        {/* Sketchy background circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="text-muted-foreground/20"
        />

        {slices.map((slice, index) => (
          <motion.path
            key={index}
            d={slice.path}
            fill={slice.color}
            stroke="var(--background)"
            strokeWidth="3"
            strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: hoveredIndex === index ? 1.05 : 1,
              opacity: 1,
            }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleSliceClick(slice.name)}
            className="cursor-pointer drop-shadow-md"
            style={{
              transformOrigin: "100px 100px",
              filter: hoveredIndex === index ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "none",
            }}
          />
        ))}

        {/* Center circle for donut effect */}
        <circle cx="100" cy="100" r="35" fill="var(--background)" />
        <text x="100" y="95" textAnchor="middle" className="fill-foreground text-xs font-bold">
          Total
        </text>
        <text x="100" y="112" textAnchor="middle" className="fill-primary text-sm font-bold">
          ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {slices.slice(0, 6).map((slice, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all cursor-pointer ${
              hoveredIndex === index ? "bg-muted scale-105" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleSliceClick(slice.name)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: slice.color,
                borderRadius: "50% 40% 60% 45%",
              }}
            />
            <span className="text-xs text-muted-foreground truncate max-w-20">{slice.name}</span>
            <span className="text-xs font-medium text-foreground">{slice.percentage.toFixed(1)}%</span>
          </motion.button>
        ))}
      </div>

      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground mt-2">Click a slice to see transactions</p>
    </div>
  )
}
