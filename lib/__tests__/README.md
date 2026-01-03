# Unit Tests

This directory contains unit tests for the money-tracker application's critical calculation logic.

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### CSV Parser Tests (`csv-parser.test.ts`)

Comprehensive tests for transaction parsing and calculation logic:

#### Critical Bug Tests
- **Math.abs() bug**: Verifies that returns are NOT incorrectly converted to purchases
- **Net spending calculation**: Ensures purchases - returns = correct net spending
- **Sign preservation**: Validates that positive amounts (returns) stay positive

#### Chase CSV Parsing
- Negative amounts are parsed as purchases (spending)
- Positive amounts are parsed as returns (credits)
- Payment transactions are filtered out
- Net spending is calculated correctly (purchases - returns)

#### Amex CSV Parsing
- Amount sign flipping (Amex uses opposite convention)
- Positive Amex amounts become negative (purchases)
- Negative Amex amounts become positive (credits)

#### Year Detection
- Extracts year from transaction dates
- Uses most common year when multiple years present
- Handles edge cases (year boundaries, missing data)

#### Amount Parsing
- Decimal amounts (e.g., $25.50)
- Whole number amounts (e.g., $50.00)
- Invalid amount validation
- Number format edge cases

#### Date Parsing
- MM/DD/YYYY format validation
- Month extraction (Jan, Feb, Mar, etc.)
- Date range handling

#### Category Handling
- Category preservation from CSV
- Category mapping

#### Edge Cases
- Empty CSV files
- CSV with only headers
- Malformed rows
- Invalid data graceful handling

## Why These Tests Matter

The original codebase had a **critical bug** where `Math.abs()` was applied to all amounts, causing returns/refunds to be added to spending instead of subtracted. This made spending totals significantly inflated.

**Example of the bug:**
```typescript
// WRONG (the bug):
adjustedAmount: Math.abs(getAdjustedAmount(item.amount, key))
// Result: Returns add to spending instead of subtracting

// CORRECT (the fix):
adjustedAmount: getAdjustedAmount(item.amount, key)
// Result: Returns properly subtract from spending
```

These tests ensure that:
1. The bug doesn't regress
2. All calculation logic is correct
3. Edge cases are handled gracefully
4. CSV parsing works across different formats

## Adding New Tests

When adding new calculation logic or modifying existing logic:

1. Add corresponding test cases
2. Test both happy path and edge cases
3. Include tests for error handling
4. Document the expected behavior

## Test Framework

- **Vitest**: Modern, fast test runner with TypeScript support
- **Node environment**: Tests run in Node.js (not browser)
- **Coverage**: V8 coverage provider for accurate code coverage reports
