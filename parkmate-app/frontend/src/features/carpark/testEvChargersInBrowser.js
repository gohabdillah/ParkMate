/**
 * Browser Console Test for EV Chargers
 * 
 * Open your browser's developer console and paste this code
 * to verify EV charger data is loaded correctly.
 */

// Test 1: Check if data is imported
console.log('🔌 EV Charger Data Test');
console.log('======================');

// You can test this in the browser console after the app loads
// Just copy and paste the following:

/*
// Import the data (in your app code)
import { evChargersReal } from './features/carpark/evChargersData';

console.log('Total EV chargers:', evChargersReal.length);
console.log('Sample charger:', evChargersReal[0]);

// Group by provider
const providers = {};
evChargersReal.forEach(c => {
  providers[c.provider] = (providers[c.provider] || 0) + 1;
});
console.log('Providers:', providers);

// Group by connector type
const connectors = {};
evChargersReal.forEach(c => {
  connectors[c.connectorType] = (connectors[c.connectorType] || 0) + 1;
});
console.log('Connector types:', connectors);

// Check coordinates are valid
const invalidCoords = evChargersReal.filter(c => 
  c.latitude < 1.2 || c.latitude > 1.5 || 
  c.longitude < 103.6 || c.longitude > 104.0
);
console.log('Chargers with invalid coordinates:', invalidCoords.length);

// Find chargers near a specific location (e.g., Marina Bay)
const marinaBay = { lat: 1.2838, lng: 103.8607 };
const nearby = evChargersReal.filter(c => {
  const latDiff = Math.abs(c.latitude - marinaBay.lat);
  const lngDiff = Math.abs(c.longitude - marinaBay.lng);
  return latDiff < 0.01 && lngDiff < 0.01; // ~1km radius
});
console.log('Chargers near Marina Bay:', nearby.length);
console.log('Sample nearby charger:', nearby[0]);
*/

// Or simpler - just check in Redux DevTools:
// Look for state.carpark.evMode
// When toggled, the map should switch between carparks and EV chargers
