"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Credit record: key is "date-description-amount", value is the credit amount
type CreditRecord = Record<string, number>
type CategoryOverrideRecord = Record<string, string>

interface CreditsContextType {
  credits: CreditRecord
  categoryOverrides: CategoryOverrideRecord
  setCredit: (transactionKey: string, creditAmount: number) => void
  removeCredit: (transactionKey: string) => void
  getAdjustedAmount: (originalAmount: number, transactionKey: string) => number
  setCategoryOverride: (transactionKey: string, newCategory: string) => void
  removeCategoryOverride: (transactionKey: string) => void
  getCategory: (originalCategory: string, transactionKey: string) => string
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function getTransactionKey(date: string, description: string, amount: number): string {
  return `${date}|${description}|${amount}`
}

export const AVAILABLE_CATEGORIES = [
  "Food & Drink",
  "Groceries",
  "Shopping",
  "Travel",
  "Health & Wellness",
  "Bills & Utilities",
  "Entertainment",
  "Gas",
  "Professional Services",
  "Personal",
  "Rent",
] as const

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<CreditRecord>({})
  const [categoryOverrides, setCategoryOverrides] = useState<CategoryOverrideRecord>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedCredits = localStorage.getItem("spending-credits")
    if (storedCredits) {
      try {
        setCredits(JSON.parse(storedCredits))
      } catch {
        // Invalid JSON, ignore
      }
    }
    const storedCategories = localStorage.getItem("spending-category-overrides")
    if (storedCategories) {
      try {
        setCategoryOverrides(JSON.parse(storedCategories))
      } catch {
        // Invalid JSON, ignore
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("spending-credits", JSON.stringify(credits))
    }
  }, [credits, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("spending-category-overrides", JSON.stringify(categoryOverrides))
    }
  }, [categoryOverrides, isLoaded])

  const setCredit = (transactionKey: string, creditAmount: number) => {
    setCredits((prev) => ({
      ...prev,
      [transactionKey]: creditAmount,
    }))
  }

  const removeCredit = (transactionKey: string) => {
    setCredits((prev) => {
      const next = { ...prev }
      delete next[transactionKey]
      return next
    })
  }

  const getAdjustedAmount = (originalAmount: number, transactionKey: string): number => {
    const credit = credits[transactionKey]
    if (credit === undefined) return originalAmount
    const absOriginal = Math.abs(originalAmount)
    const adjusted = absOriginal - credit
    return originalAmount < 0 ? -Math.max(0, adjusted) : Math.max(0, adjusted)
  }

  const setCategoryOverride = (transactionKey: string, newCategory: string) => {
    setCategoryOverrides((prev) => ({
      ...prev,
      [transactionKey]: newCategory,
    }))
  }

  const removeCategoryOverride = (transactionKey: string) => {
    setCategoryOverrides((prev) => {
      const next = { ...prev }
      delete next[transactionKey]
      return next
    })
  }

  const getCategory = (originalCategory: string, transactionKey: string): string => {
    return categoryOverrides[transactionKey] || originalCategory
  }

  return (
    <CreditsContext.Provider
      value={{
        credits,
        categoryOverrides,
        setCredit,
        removeCredit,
        getAdjustedAmount,
        setCategoryOverride,
        removeCategoryOverride,
        getCategory,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider")
  }
  return context
}
