export interface Carpark {
  id: string;
  externalId: string;
  address: string;
  latitude: number;
  longitude: number;
  totalLots: number;
  availableLots: number;
  lotType?: string;
  carparkType?: string;
  parkingSystem?: string;
  shortTermParking?: string;
  freeParking?: string;
  nightParking: boolean;
  carParkDecks?: number;
  gantryHeight?: number;
  carParkBasement: boolean;
  pricePerHour?: number;
  priceWeekdayRate1?: number;
  priceWeekdayRate2?: number;
  priceSaturdayRate?: number;
  priceSundayRate?: number;
  // EPS Pricing fields
  pricePerHalfHour?: number; // $0.60 for non-central, $1.20 for central
  isCentralArea?: boolean; // TRUE if in Central Area
  dayParkingCap?: number; // $12 for non-central, $20 for central (7am-10:30pm)
  nightParkingCap?: number; // $5 cap for night parking (10:30pm-7am)
  wholeDayParkingCap?: number; // $12 for non-central, $20 for central
  gracePeriodMinutes?: number; // Grace period in minutes (default: 15)
  perMinuteRate?: number; // Per-minute rate (price_per_half_hour / 30)
  hasEvCharger: boolean;
  operatingHours?: any;
  pricingDetails?: any;
  amenities?: any;
  distance?: number; // Distance from user's location in meters
  availabilityPercentage?: number; // Real-time availability percentage (0-100)
  createdAt: Date;
  updatedAt: Date;
}

export interface GetNearbyCarparkParams {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, default 2000
  limit?: number; // default 30
  minAvailableLots?: number;
  maxPrice?: number;
  carparkType?: string;
  hasEvCharger?: boolean;
  nightParking?: boolean;
}

export interface SearchCarparkParams {
  query?: string; // Search by name or address
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'distance' | 'price' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateCarparkAvailability {
  externalId: string;
  availableLots: number;
  totalLots?: number;
}