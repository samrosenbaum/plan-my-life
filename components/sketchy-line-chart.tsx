"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface LineData {
  month: string
  amount: number
}

interface SketchyLineChartProps {
  data: LineData[]
  onMonthClick?: (month: string) => void
}

export function SketchyLineChart({ data, onMonthClick }: SketchyLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const amounts = data.map((d) => d.amount).filter((a) => a > 0)
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 1
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0

  const chartWidth = 800
  const chartHeight = 200
  const padding = 40

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2)
    const range = maxAmount - minAmount
    const normalizedY = range > 0 ? (item.amount - minAmount) / range : 0.5
    const y = chartHeight - padding - normalizedY * (chartHeight - padding * 2)
    return { x, y: isNaN(y) ? chartHeight - padding : y, ...item }
  })

  // Create a wavy path for hand-drawn effect
  const pathD = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    const prev = points[index - 1]
    const wobbleX = (index % 2 === 0 ? 5 : -5) + Math.random() * 3
    const wobbleY = (index % 2 === 0 ? -3 : 3) + Math.random() * 2
    const cpX = (prev.x + point.x) / 2 + wobbleX
    const cpY = (prev.y + point.y) / 2 + wobbleY
    return `${path} Q ${cpX} ${cpY} ${point.x} ${point.y}`
  }, "")

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

  return (
    <div className="relative overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
        className="w-full h-64 md:h-80"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines - sketchy style */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const y = chartHeight - padding - tick * (chartHeight - padding * 2)
          return (
            <g key={i}>
              <path
                d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-muted-foreground/20"
              />
              <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground text-xs">
                ${((minAmount + tick * (maxAmount - minAmount)) / 1000).toFixed(1)}k
              </text>
            </g>
          )
        })}

        {/* Area fill with gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Main line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 8 : 5}
              fill="#F97316"
              stroke="var(--background)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => point.amount > 0 && onMonthClick?.(point.month)}
              className="cursor-pointer drop-shadow-md"
            />

            {/* Month labels */}
            <text
              x={point.x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="fill-muted-foreground text-xs cursor-pointer"
              onClick={() => point.amount > 0 && onMonthClick?.(point.month)}
            >
              {point.month}
            </text>

            {/* Hover tooltip */}
            {hoveredIndex === index && point.amount > 0 && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect
                  x={point.x - 40}
                  y={point.y - 45}
                  width="80"
                  height="35"
                  rx="8"
                  fill="var(--foreground)"
                  className="drop-shadow-lg"
                />
                <text x={point.x} y={point.y - 30} textAnchor="middle" className="fill-background text-xs font-medium">
                  {point.month}
                </text>
                <text x={point.x} y={point.y - 16} textAnchor="middle" className="fill-background text-sm font-bold">
                  ${point.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>
                <text x={point.x} y={point.y - 2} textAnchor="middle" className="fill-background/70 text-[9px]">
                  Click to view
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
