# 💰 Money Tracker

A beautiful, interactive spending visualization dashboard that helps you understand and analyze your credit card transactions across multiple accounts.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/samrosenbaum/v0-spending-visualization)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)

## ✨ Features

### 📊 Interactive Dashboard
- **Real-time spending visualization** with animated charts using Recharts
- **Multi-card support**: Track Chase Sapphire, Amazon Card, and Amex Platinum simultaneously
- **Category breakdown**: See spending by category with beautiful pie charts
- **Monthly trends**: Visualize spending patterns over time

### 🤖 AI-Powered Chat Assistant
- Ask natural language questions about your spending
- "How much did I spend on Uber this month?"
- "What's my biggest spending category?"
- "Show me all Whole Foods transactions"

### 💳 Smart Transaction Management
- **Automatic CSV parsing** for Chase and Amex formats
- **Return/refund handling**: Correctly subtracts returns from spending (critical bug fix!)
- **Category overrides**: Manually recategorize transactions
- **Credits/adjustments**: Add custom adjustments to any transaction

### 📈 Analytics & Insights
- Total spending across all cards
- Average transaction amount
- Transaction count and frequency
- Category-wise spending breakdown
- Monthly comparison charts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Credit card transaction data in CSV format

### Installation

```bash
# Clone the repository
git clone https://github.com/samrosenbaum/money-tracker.git
cd money-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Adding Your Transaction Data

1. Export CSV files from your credit card websites:
   - **Chase cards**: Download as CSV (includes Chase Sapphire, Amazon Card)
   - **Amex**: Download as CSV

2. Place CSV files in the `data/` directory:
   ```
   data/
   ├── chase-sapphire.csv
   ├── amazon.csv
   └── amex.csv
   ```

3. Ensure CSV formats match expected headers (see `data/README.md` for details)

4. Restart the dev server to load new data

## 📁 Project Structure

```
money-tracker/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── spending-dashboard.tsx   # Main dashboard
│   ├── spending-chat.tsx        # AI chat assistant
│   ├── spending-stats.tsx       # Statistics cards
│   ├── category-chart.tsx       # Category pie chart
│   └── error-boundary.tsx       # Error handling
├── lib/                     # Core logic
│   ├── csv-parser.ts        # CSV parsing & calculations
│   ├── spending-data.ts     # Data exports
│   └── __tests__/           # Unit tests
├── data/                    # CSV transaction data
│   ├── chase-sapphire.csv
│   ├── amazon.csv
│   ├── amex.csv
│   └── README.md            # CSV format documentation
└── vitest.config.ts         # Test configuration
```

## 🧪 Testing

This project includes comprehensive unit tests for all critical calculation logic.

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- ✅ CSV parsing (Chase & Amex formats)
- ✅ Net spending calculations (purchases - returns)
- ✅ Critical bug prevention (Math.abs() on returns)
- ✅ Year detection from transaction dates
- ✅ Amount & date parsing
- ✅ Edge cases & error handling

See `lib/__tests__/README.md` for detailed test documentation.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### TypeScript Configuration

This project uses **strict mode** with additional safety options:
- `noUncheckedIndexedAccess`: Prevents undefined access bugs
- `noImplicitReturns`: Ensures all code paths return values
- `noUnusedLocals` & `noUnusedParameters`: Catches dead code
- `exactOptionalPropertyTypes`: Stricter optional property handling

## 🐛 Recent Bug Fixes

### Critical: Math.abs() on Returns (Fixed)
**The Bug**: Returns and refunds were being ADDED to spending instead of SUBTRACTED.

**Impact**: Spending totals were significantly inflated (e.g., a $100 return made spending $100 higher instead of $100 lower).

**Root Cause**: `Math.abs()` was being applied to all transaction amounts, converting positive returns to negative purchases.

**Fix**: Removed incorrect `Math.abs()` usage and implemented proper `calculateNetSpending` logic.

**Location**: `components/spending-chat.tsx:45-50`

**Test Coverage**: Comprehensive tests ensure this bug cannot regress (`lib/__tests__/csv-parser.test.ts`)

### Other Fixes
- ✅ **Dynamic year detection**: No longer hardcoded to 2025
- ✅ **Error boundaries**: Graceful error handling throughout app
- ✅ **CSV validation**: Robust parsing with error logging
- ✅ **Type safety**: Enhanced TypeScript strict mode configuration

## 🏗️ Architecture

### Data Flow

1. **CSV Files** (`data/*.csv`) → Raw transaction data
2. **CSV Parser** (`lib/csv-parser.ts`) → Parses and validates transactions
3. **Spending Data** (`lib/spending-data.ts`) → Exports processed data
4. **Components** → Consume data and render UI
5. **LocalStorage** → Persists user adjustments (credits, overrides)

### Key Technologies

- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with Server Components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Framer Motion**: Smooth animations
- **Vitest**: Fast unit testing
- **Radix UI**: Accessible component primitives

## 📊 CSV Format Reference

### Chase Cards Format
```csv
Transaction Date,Post Date,Description,Category,Type,Amount,Memo
12/15/2025,12/16/2025,WHOLE FOODS,Groceries,Sale,-50.00,
12/14/2025,12/15/2025,REFUND,Shopping,Return,30.00,
```

**Note**: Negative amounts = purchases, positive amounts = returns

### Amex Format
```csv
Date,Description,Amount,Category
12/15/2025,NETFLIX,15.99,Entertainment
12/14/2025,REFUND,-10.00,Shopping
```

**Note**: Positive amounts = purchases, negative amounts = credits (opposite of Chase)

The parser automatically handles these different conventions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Quality Standards

- All code must pass TypeScript strict mode checks
- New features require unit tests
- Follow existing code style and conventions
- Update documentation for user-facing changes

## 📝 License

This project is private and proprietary.

## 🔗 Links

- **Live App**: [https://vercel.com/samrosenbaum/v0-spending-visualization](https://vercel.com/samrosenbaum/v0-spending-visualization)
- **GitHub**: [https://github.com/samrosenbaum/money-tracker](https://github.com/samrosenbaum/money-tracker)
- **Built with**: [v0.app](https://v0.app/chat/lqu2QIpJfFu)

## 💡 Tips & Tricks

### Performance
- Transaction data is processed once at build time
- LocalStorage is used for user-specific adjustments
- Charts use React.memo for optimal re-rendering

### Security
- Never commit real transaction CSVs to public repositories
- Add `data/*.csv` to `.gitignore` if making repo public
- Use environment variables for sensitive configuration

### Customization
- Modify category colors in `category-chart.tsx`
- Adjust chart styling in component files
- Add new card types by extending CSV parser logic

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### CSV not loading
- Check file is in `data/` directory
- Verify CSV headers match expected format (see `data/README.md`)
- Check console for parsing errors

### Tests failing
```bash
# Clear cache and re-run
npm run test -- --clearCache
npm test
```

### Type errors after update
```bash
# Regenerate type definitions
rm -rf .next
npm run dev
```

---

**Built with ❤️ using Next.js, TypeScript, and v0.app**
