// Real EV Charger data for Singapore
// Generated from official EV charger registry CSV

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

// This will be populated with real data from CSV
// For now, keeping it as an empty array - we'll add a parser
export const evChargersReal: EvCharger[] = [];
