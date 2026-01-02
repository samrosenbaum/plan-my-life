"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface SketchyCardProps {
  title: string
  icon: string
  children: ReactNode
}

export function SketchyCard({ title, icon, children }: SketchyCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, rotate: 0.5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative bg-card rounded-lg p-6 border-2 border-border shadow-sketchy"
      style={{
        borderRadius: "12px 8px 16px 10px",
      }}
    >
      {/* Hand-drawn corner accents */}
      <svg className="absolute top-2 left-2 w-6 h-6 text-primary opacity-60" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4 L12 4 M4 4 L4 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />
      </svg>
      <svg className="absolute bottom-2 right-2 w-6 h-6 text-primary opacity-60" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 20 L12 20 M20 20 L20 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />
      </svg>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-semibold text-foreground font-sketch">{title}</h2>
      </div>
      <div className="relative">{children}</div>
    </motion.div>
  )
}
