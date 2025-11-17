/**
 * CSV to TypeScript Converter for EV Chargers
 * 
 * This script reads the EV charger CSV file and generates a TypeScript file
 * with properly formatted EV charger data.
 * 
 * Usage:
 *   1. Place your CSV file in the same directory as this script
 *   2. Run: node parseEvChargers.js <path-to-csv-file>
 *   3. The script will generate evChargersData.ts
 */

const fs = require('fs');
const path = require('path');

// Function to parse CSV manually (handles comma-separated values)
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  
  // Detect separator (comma or tab)
  const firstLine = lines[0];
  const separator = firstLine.includes('\t') ? '\t' : ',';
  console.log(`Using separator: ${separator === '\t' ? 'TAB' : 'COMMA'}`);
  
  const headers = lines[0].split(separator);
  const chargers = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines

    const values = lines[i].split(separator);
    if (values.length < headers.length) continue; // Skip incomplete rows

    const charger = {};
    headers.forEach((header, index) => {
      charger[header.trim()] = values[index]?.trim() || '';
    });

    chargers.push(charger);
  }

  return chargers;
}

// Function to convert charger data to TypeScript format
function convertToTypeScript(chargers) {
  const tsChargers = chargers.map((charger, index) => {
    const regCode = charger['EV Charger Registration Code'] || `EV-${index}`;
    const name = charger['Name'] || 'Unknown';
    const outlets = parseInt(charger['No. of Charging Outlets']) || 1;
    const connectorType = charger['Type of Connector'] || 'Type 2';
    const powerKw = parseFloat(charger['Rated Output Power (kW)']) || 22;
    const postalCode = charger['Postal Code'] || '';
    const blockHouseNo = charger['Block/House No'] || '';
    const streetName = charger['Street Name'] || '';
    const buildingName = charger['Building Name'] || '';
    const floorNo = charger['Floor No'] || '';
    const lotNo = charger['Lot No'] || '';
    const isPublic = (charger['Is the charger publicly accessible?'] || 'Yes').toLowerCase() === 'yes';
    const longitude = parseFloat(charger['Longitude']) || 0;
    const latitude = parseFloat(charger['Latitude']) || 0;

    // Build address
    const addressParts = [
      blockHouseNo,
      streetName,
      buildingName && `(${buildingName})`,
      postalCode && `Singapore ${postalCode}`
    ].filter(Boolean);
    const address = addressParts.join(', ');

    return {
      id: regCode.toLowerCase(),
      registrationCode: regCode,
      name: name,
      address: address,
      latitude: latitude,
      longitude: longitude,
      provider: name,
      powerKw: powerKw,
      connectorType: connectorType,
      numberOfPorts: outlets,
      availability: 'unknown',
      postalCode: postalCode,
      blockHouseNo: blockHouseNo,
      streetName: streetName,
      buildingName: buildingName,
      floorNo: floorNo || undefined,
      lotNo: lotNo || undefined,
      isPubliclyAccessible: isPublic
    };
  });

  return tsChargers;
}

// Main function
function main() {
  const csvFilePath = process.argv[2];

  if (!csvFilePath) {
    console.error('Usage: node parseEvChargers.js <path-to-csv-file>');
    process.exit(1);
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`File not found: ${csvFilePath}`);
    process.exit(1);
  }

  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  console.log('Parsing CSV data...');
  const chargers = parseCSV(csvContent);
  console.log(`Found ${chargers.length} EV chargers`);

  console.log('Converting to TypeScript format...');
  const tsChargers = convertToTypeScript(chargers);

  // Filter out chargers with invalid coordinates
  const validChargers = tsChargers.filter(c => c.latitude !== 0 && c.longitude !== 0);
  console.log(`${validChargers.length} chargers have valid coordinates`);

  // Generate TypeScript file content
  const tsContent = `// Real EV Charger data for Singapore
// Auto-generated from official EV charger registry CSV
// Generated on: ${new Date().toISOString()}
// Total chargers: ${validChargers.length}

export interface EvCharger {
  id: string;
  registrationCode: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  provider: string;
  powerKw: number;
  connectorType: string;
  numberOfPorts: number;
  availability?: 'available' | 'occupied' | 'unknown';
  postalCode: string;
  blockHouseNo: string;
  streetName: string;
  buildingName: string;
  floorNo?: string;
  lotNo?: string;
  isPubliclyAccessible: boolean;
}

export const evChargersReal: EvCharger[] = ${JSON.stringify(validChargers, null, 2)};
`;

  // Write to file
  const outputPath = path.join(__dirname, 'evChargersData.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf-8');

  console.log(`✅ Successfully generated: ${outputPath}`);
  console.log(`📊 Statistics:`);
  console.log(`   - Total chargers: ${validChargers.length}`);
  
  // Provider statistics
  const providers = {};
  validChargers.forEach(c => {
    providers[c.provider] = (providers[c.provider] || 0) + 1;
  });
  console.log(`   - Providers: ${Object.keys(providers).length}`);
  Object.entries(providers).slice(0, 5).forEach(([provider, count]) => {
    console.log(`     • ${provider}: ${count}`);
  });

  // Connector types
  const connectors = {};
  validChargers.forEach(c => {
    connectors[c.connectorType] = (connectors[c.connectorType] || 0) + 1;
  });
  console.log(`   - Connector types:`);
  Object.entries(connectors).forEach(([type, count]) => {
    console.log(`     • ${type}: ${count}`);
  });

  // Power distribution
  const avgPower = validChargers.reduce((sum, c) => sum + c.powerKw, 0) / validChargers.length;
  console.log(`   - Average power: ${avgPower.toFixed(1)} kW`);
}

main();
