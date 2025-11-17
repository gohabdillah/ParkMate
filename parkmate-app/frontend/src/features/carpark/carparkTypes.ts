export interface Carpark {
  id: string;
  externalId: string;
  address: string;
  latitude: number;
  longitude: number;
  carparkType?: string;
  parkingSystem?: string;
  shortTermParking?: string;
  freeParking?: string;
  nightParking?: boolean;
  carParkDecks?: number;
  gantryHeight?: number;
  carParkBasement?: boolean;
  totalLots?: number;
  availableLots?: number;
  lotType?: string;
  distance?: number; // Distance from user's location in meters
  availabilityPercentage?: number; // Real-time availability percentage (0-100)
  createdAt: string;
  updatedAt: string;
  // Optional pricing fields
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
  hasEvCharger?: boolean;
  operatingHours?: string;
  pricingDetails?: string;
  amenities?: string;
}

export interface CarparkFilters {
  carpark_type?: string;
  parking_system?: string;
  free_parking?: boolean;
  night_parking?: boolean;
  has_basement?: boolean;
  max_distance?: number; // in meters
  min_available_lots?: number;
}

export interface NearbyCarparksRequest {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, default 1000
  limit?: number; // default 50
  filters?: CarparkFilters;
}

export interface CarparkSearchRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  filters?: CarparkFilters;
}

export interface CarparkStats {
  total_carparks: number;
  total_lots: number;
  available_lots: number;
  carpark_types: Record<string, number>;
  parking_systems: Record<string, number>;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}