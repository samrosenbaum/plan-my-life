# CSV Data Files

This directory contains transaction data from various credit cards and bank accounts.

## File Formats

### Chase Cards (chase-sapphire.csv, amazon.csv)

Format:
```csv
Transaction Date,Post Date,Description,Category,Type,Amount,Memo
MM/DD/YYYY,MM/DD/YYYY,Merchant Name,Category,Sale/Return,Amount,
```

Notes:
- **Amount**: Negative values are purchases, positive values are returns
- **Type**: "Sale" for purchases, "Return" for refunds, "Payment" for payments (ignored)

### Amex Card (amex.csv)

Format:
```csv
Date,Description,Amount,Category
MM/DD/YYYY,Merchant Name,Amount,Category
```

Notes:
- **Amount**: Positive values are purchases, negative values are credits/returns
- The parser flips the sign to match Chase format (purchases become negative)

## Updating Data

To update transaction data:

1. Export CSV from your credit card website
2. Replace the corresponding file in this directory
3. Ensure the format matches the expected headers
4. The app will automatically parse the new data on next load

## Data Privacy

These files contain your personal financial data. Keep them secure and do not commit real transaction data to public repositories.
