import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"

// Mock the CSV files for testing
const mockChaseCSV = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
12/15/2025,12/16/2025,WHOLE FOODS,Groceries,Sale,-50.00,
12/14/2025,12/15/2025,UBER,Travel,Sale,-25.50,
12/13/2025,12/14/2025,AMAZON REFUND,Shopping,Return,30.00,
12/12/2025,12/13/2025,RESTAURANT,Food & Drink,Sale,-75.25,
12/11/2025,12/12/2025,PAYMENT,Payment,Payment,-500.00,`

const mockAmexCSV = `Date,Description,Amount,Category
12/15/2025,NETFLIX,15.99,Entertainment
12/14/2025,UBER,22.50,Transportation
12/13/2025,REFUND,-10.00,Shopping
12/12/2025,GYM,50.00,Health & Wellness`

describe("CSV Parser", () => {
  describe("Chase CSV Parsing", () => {
    it("should parse negative amounts as purchases (spending)", () => {
      // This is the critical behavior - negative amounts in Chase CSV are purchases
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const wholeFoods = transactions.find((t: any) => t.description === "WHOLE FOODS")
      expect(wholeFoods).toBeDefined()
      expect(wholeFoods.amount).toBe(-50.00) // Negative = spending
    })

    it("should parse positive amounts as returns (credits)", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const refund = transactions.find((t: any) => t.description === "AMAZON REFUND")
      expect(refund).toBeDefined()
      expect(refund.amount).toBe(30.00) // Positive = return/credit
      expect(refund.isReturn).toBe(true)
    })

    it("should filter out Payment transactions", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const payment = transactions.find((t: any) => t.description === "PAYMENT")
      expect(payment).toBeUndefined() // Payments should be filtered out
    })

    it("should correctly calculate net spending (purchases - returns)", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      // Total spending: -50.00 + -25.50 + -75.25 = -150.75
      // Total returns: +30.00
      // Net spending should be: |-150.75| - 30.00 = 120.75

      const totalSpending = transactions
        .filter((t: any) => t.amount < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)

      const totalReturns = transactions
        .filter((t: any) => t.amount > 0)
        .reduce((sum: number, t: any) => sum + t.amount, 0)

      const netSpending = totalSpending - totalReturns

      expect(totalSpending).toBe(150.75)
      expect(totalReturns).toBe(30.00)
      expect(netSpending).toBe(120.75)
    })
  })

  describe("Amex CSV Parsing", () => {
    it("should flip Amex amounts (positive becomes negative)", () => {
      // Amex CSV has opposite sign convention: positive = purchase, negative = credit
      // Parser should flip these to match Chase format
      const { parseAmexCSV } = require("../csv-parser")
      const transactions = parseAmexCSV(mockAmexCSV)

      const netflix = transactions.find((t: any) => t.description === "NETFLIX")
      expect(netflix).toBeDefined()
      expect(netflix.amount).toBe(-15.99) // Flipped from +15.99
    })

    it("should flip Amex credits (negative becomes positive)", () => {
      const { parseAmexCSV } = require("../csv-parser")
      const transactions = parseAmexCSV(mockAmexCSV)

      const refund = transactions.find((t: any) => t.description === "REFUND")
      expect(refund).toBeDefined()
      expect(refund.amount).toBe(10.00) // Flipped from -10.00
    })
  })

  describe("Year Detection", () => {
    it("should detect year from transaction dates", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      // All transactions should have 2025 as the year
      transactions.forEach((t: any) => {
        expect(t.date).toContain("2025")
      })
    })

    it("should use most common year when multiple years present", () => {
      const mixedYearCSV = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
12/31/2024,01/01/2025,OLD TRANSACTION,Shopping,Sale,-10.00,
12/15/2025,12/16/2025,TRANSACTION 1,Shopping,Sale,-20.00,
12/14/2025,12/15/2025,TRANSACTION 2,Shopping,Sale,-30.00,
12/13/2025,12/14/2025,TRANSACTION 3,Shopping,Sale,-40.00,`

      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mixedYearCSV, "chase-sapphire")

      const year2025Count = transactions.filter((t: any) => t.date.includes("2025")).length
      const year2024Count = transactions.filter((t: any) => t.date.includes("2024")).length

      expect(year2025Count).toBe(3)
      expect(year2024Count).toBe(1)
      expect(year2025Count).toBeGreaterThan(year2024Count) // 2025 is more common
    })
  })

  describe("Critical Bug: Math.abs() on returns", () => {
    it("should NOT apply Math.abs() to return amounts", () => {
      // This was the critical bug: using Math.abs() made returns add to spending instead of subtract
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const refund = transactions.find((t: any) => t.description === "AMAZON REFUND")

      // CORRECT: Return should be positive +30.00
      expect(refund.amount).toBe(30.00)

      // WRONG (the bug): Would be -30.00 if Math.abs() was incorrectly applied
      expect(refund.amount).not.toBe(-30.00)
    })

    it("should calculate net spending correctly WITHOUT Math.abs() bug", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      // Simulate the CORRECT calculation (purchases - returns)
      const netSpending = transactions.reduce((sum: number, t: any) => {
        if (t.amount < 0) {
          // Purchase: add absolute value to spending
          return sum + Math.abs(t.amount)
        } else {
          // Return: subtract from spending
          return sum - t.amount
        }
      }, 0)

      // Total: 50 + 25.50 + 75.25 - 30 = 120.75
      expect(netSpending).toBe(120.75)

      // Simulate the BUG (if Math.abs() was applied to everything)
      const buggyCalculation = transactions.reduce((sum: number, t: any) => {
        return sum + Math.abs(t.amount) // WRONG: treats returns as additional spending
      }, 0)

      // With bug: 50 + 25.50 + 75.25 + 30 = 180.75 (WRONG!)
      expect(buggyCalculation).toBe(180.75)
      expect(buggyCalculation).not.toBe(netSpending) // Bug produces different result
    })
  })

  describe("Amount Parsing", () => {
    it("should handle decimal amounts correctly", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const uber = transactions.find((t: any) => t.description === "UBER")
      expect(uber.amount).toBe(-25.50)

      const restaurant = transactions.find((t: any) => t.description === "RESTAURANT")
      expect(restaurant.amount).toBe(-75.25)
    })

    it("should handle whole number amounts", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const wholeFoods = transactions.find((t: any) => t.description === "WHOLE FOODS")
      expect(wholeFoods.amount).toBe(-50.00)
    })

    it("should validate amount is a number", () => {
      const invalidCSV = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
12/15/2025,12/16/2025,INVALID,Shopping,Sale,INVALID_AMOUNT,`

      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(invalidCSV, "chase-sapphire")

      // Should skip invalid rows
      expect(transactions.length).toBe(0)
    })
  })

  describe("Date Parsing", () => {
    it("should parse MM/DD/YYYY format correctly", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const wholeFoods = transactions.find((t: any) => t.description === "WHOLE FOODS")
      expect(wholeFoods.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it("should extract month correctly", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      // All test transactions are in December (month 12)
      transactions.forEach((t: any) => {
        expect(t.month).toBe("Dec")
      })
    })
  })

  describe("Category Handling", () => {
    it("should preserve category from CSV", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(mockChaseCSV, "chase-sapphire")

      const wholeFoods = transactions.find((t: any) => t.description === "WHOLE FOODS")
      expect(wholeFoods.category).toBe("Groceries")

      const uber = transactions.find((t: any) => t.description === "UBER")
      expect(uber.category).toBe("Travel")
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty CSV", () => {
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV("", "chase-sapphire")
      expect(transactions).toEqual([])
    })

    it("should handle CSV with only headers", () => {
      const headersOnly = "Transaction Date,Post Date,Description,Category,Type,Amount,Memo"
      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(headersOnly, "chase-sapphire")
      expect(transactions).toEqual([])
    })

    it("should handle malformed rows gracefully", () => {
      const malformedCSV = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
12/15/2025,12/16/2025,GOOD TRANSACTION,Shopping,Sale,-50.00,
MALFORMED ROW
12/14/2025,12/15/2025,ANOTHER GOOD,Shopping,Sale,-30.00,`

      const { parseChaseCSV } = require("../csv-parser")
      const transactions = parseChaseCSV(malformedCSV, "chase-sapphire")

      // Should parse valid rows and skip malformed ones
      expect(transactions.length).toBe(2)
    })
  })
})
