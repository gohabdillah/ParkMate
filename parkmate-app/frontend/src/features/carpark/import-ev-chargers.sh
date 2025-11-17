#!/bin/bash

# EV Charger CSV Import Script
# This script helps you import EV charger data from CSV

echo "🔌 EV Charger CSV Import Tool"
echo "================================"
echo ""

# Check if CSV file is provided
if [ -z "$1" ]; then
    echo "Usage: ./import-ev-chargers.sh <path-to-csv-file>"
    echo ""
    echo "Example:"
    echo "  ./import-ev-chargers.sh ev-chargers.csv"
    echo "  ./import-ev-chargers.sh ~/Downloads/ev-chargers.csv"
    exit 1
fi

CSV_FILE="$1"

# Check if file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Error: File not found: $CSV_FILE"
    exit 1
fi

echo "📁 CSV File: $CSV_FILE"
echo "📊 Processing..."
echo ""

# Run the parser
node parseEvChargers.js "$CSV_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import successful!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Review the generated evChargersData.ts file"
    echo "   2. Update CarparkMap.tsx to import from evChargersData"
    echo "   3. Restart your dev server: npm run dev"
    echo ""
    echo "🗺️  The EV chargers will now appear when you toggle EV mode!"
else
    echo ""
    echo "❌ Import failed. Please check the error messages above."
    exit 1
fi
