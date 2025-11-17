#!/bin/bash

# EV Charger Data Test Script
# This script helps you verify the EV charger data is loaded correctly

echo "🔌 EV Charger Data Test"
echo "======================="
echo ""

# Check if evChargersData.ts exists
if [ ! -f "evChargersData.ts" ]; then
    echo "❌ Error: evChargersData.ts not found"
    echo "   Run: ./import-ev-chargers.sh ev-chargers.csv"
    exit 1
fi

echo "✅ evChargersData.ts exists"

# Count total chargers
TOTAL=$(grep -o '"id":' evChargersData.ts | wc -l | tr -d ' ')
echo "📊 Total chargers loaded: $TOTAL"

if [ "$TOTAL" -eq 0 ]; then
    echo "❌ No chargers found in the file!"
    echo "   The CSV might not have been parsed correctly."
    echo "   Try running: ./import-ev-chargers.sh ev-chargers.csv"
    exit 1
fi

echo ""
echo "🗺️  Sample chargers:"
# Show first 3 charger names
grep -A 2 '"name":' evChargersData.ts | head -9 | grep '"name":' | head -3

echo ""
echo "📍 Location check:"
# Check if we have valid Singapore coordinates
LAT_COUNT=$(grep -o '"latitude": 1\.[0-9]' evChargersData.ts | wc -l | tr -d ' ')
echo "   Chargers with valid Singapore latitude: $LAT_COUNT"

echo ""
echo "⚡ Power distribution:"
# Count different power levels
KW_7=$(grep -o '"powerKw": 7' evChargersData.ts | wc -l | tr -d ' ')
KW_22=$(grep -o '"powerKw": 22' evChargersData.ts | wc -l | tr -d ' ')
KW_50=$(grep -o '"powerKw": 50' evChargersData.ts | wc -l | tr -d ' ')
echo "   7kW chargers: $KW_7"
echo "   22kW chargers: $KW_22"
echo "   50kW+ chargers: $KW_50"

echo ""
echo "🔌 Connector types:"
grep -o '"connectorType": "[^"]*"' evChargersData.ts | sort | uniq -c | head -5

echo ""
echo "✅ Data verification complete!"
echo ""
echo "📝 Next steps to test on the map:"
echo "   1. Start your dev server: cd ../../.. && npm run dev"
echo "   2. Open the app in your browser"
echo "   3. Click your profile avatar"
echo "   4. Toggle 'EV Chargers' ON"
echo "   5. You should see $TOTAL green/red/orange circle markers!"
echo ""
