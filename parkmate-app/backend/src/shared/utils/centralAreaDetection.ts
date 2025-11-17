/**
 * Singapore Central Area Detection Service
 * 
 * This service determines if a carpark is located in the Central Area of Singapore
 * based on its coordinates. The Central Area is defined by URA (Urban Redevelopment Authority).
 * 
 * Central Area roughly includes:
 * - Downtown Core
 * - Marina South
 * - Newton
 * - Orchard
 * - Outram
 * - River Valley
 * - Rochor
 * - Singapore River
 * - Straits View
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Central Area boundary polygon (approximate)
 * Based on URA's Central Area definition
 */
const CENTRAL_AREA_POLYGON: Coordinates[] = [
  { latitude: 1.2900, longitude: 103.8200 }, // Marina South
  { latitude: 1.2800, longitude: 103.8600 }, // East Coast Parkway
  { latitude: 1.3000, longitude: 103.8700 }, // Kallang
  { latitude: 1.3200, longitude: 103.8650 }, // Lavender
  { latitude: 1.3300, longitude: 103.8500 }, // Little India
  { latitude: 1.3150, longitude: 103.8350 }, // Newton
  { latitude: 1.3050, longitude: 103.8200 }, // Orchard
  { latitude: 1.2850, longitude: 103.8150 }, // Tiong Bahru
  { latitude: 1.2750, longitude: 103.8250 }, // Tanjong Pagar
  { latitude: 1.2650, longitude: 103.8350 }, // Marina Bay
  { latitude: 1.2700, longitude: 103.8500 }, // Marina East
  { latitude: 1.2800, longitude: 103.8550 }, // Gardens by the Bay
];

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  const x = point.latitude;
  const y = point.longitude;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Determine if a carpark is in the Central Area based on coordinates
 */
export function isCentralArea(latitude: number, longitude: number): boolean {
  // Check if coordinates are within Central Area polygon
  const point: Coordinates = { latitude, longitude };
  return isPointInPolygon(point, CENTRAL_AREA_POLYGON);
}

/**
 * Get pricing details based on whether carpark is in Central Area
 */
export function getPricingByLocation(
  isCentral: boolean
): {
  pricePerHalfHour: number;
  dayParkingCap: number;
  wholeDayParkingCap: number;
  nightParkingCap: number;
  gracePeriodMinutes: number;
  perMinuteRate: number;
} {
  if (isCentral) {
    return {
      pricePerHalfHour: 1.2, // $1.20 for Central Area
      dayParkingCap: 20.0, // $20 for day parking
      wholeDayParkingCap: 20.0, // $20 for whole day
      nightParkingCap: 5.0, // $5 for night
      gracePeriodMinutes: 15, // 15 minutes grace period
      perMinuteRate: 0.04, // $1.20 / 30 minutes
    };
  } else {
    return {
      pricePerHalfHour: 0.6, // $0.60 for Non-Central Area
      dayParkingCap: 12.0, // $12 for day parking
      wholeDayParkingCap: 12.0, // $12 for whole day
      nightParkingCap: 5.0, // $5 for night
      gracePeriodMinutes: 15, // 15 minutes grace period
      perMinuteRate: 0.02, // $0.60 / 30 minutes
    };
  }
}

/**
 * Calculate parking fee based on duration and location
 * 
 * @param durationMinutes - Parking duration in minutes
 * @param isCentral - Whether carpark is in Central Area
 * @param isNightParking - Whether parking is during night hours (10:30pm - 7am)
 * @param gracePeriodMinutes - Grace period in minutes (default: 15)
 * @returns Parking fee in dollars
 */
export function calculateParkingFee(
  durationMinutes: number,
  isCentral: boolean,
  isNightParking: boolean = false,
  gracePeriodMinutes: number = 15
): number {
  // No charge if within grace period
  if (durationMinutes <= gracePeriodMinutes) {
    return 0;
  }

  const pricing = getPricingByLocation(isCentral);
  const chargeableMinutes = durationMinutes - gracePeriodMinutes;
  
  // Calculate fee based on per-minute rate
  let fee = chargeableMinutes * pricing.perMinuteRate;

  // Apply caps
  if (isNightParking) {
    // Night parking cap: $5
    fee = Math.min(fee, pricing.nightParkingCap);
  } else {
    // Day parking cap
    fee = Math.min(fee, pricing.dayParkingCap);
  }

  // Round to 2 decimal places
  return Math.round(fee * 100) / 100;
}

/**
 * Get a human-readable description of parking charges
 */
export function getParkingChargesDescription(isCentral: boolean): string {
  const pricing = getPricingByLocation(isCentral);
  const area = isCentral ? 'Central Area' : 'Non-Central Area';

  return `
${area} Parking Charges:
- Rate: $${pricing.pricePerHalfHour.toFixed(2)} per 0.5 hour ($${pricing.perMinuteRate.toFixed(4)} per minute)
- Day parking cap (7am-10:30pm): $${pricing.dayParkingCap.toFixed(2)}
- Night parking cap (10:30pm-7am): $${pricing.nightParkingCap.toFixed(2)}
- Whole day parking cap: $${pricing.wholeDayParkingCap.toFixed(2)}
- Grace period: ${pricing.gracePeriodMinutes} minutes (no charge if exiting within ${pricing.gracePeriodMinutes} minutes)
  `.trim();
}

export default {
  isCentralArea,
  getPricingByLocation,
  calculateParkingFee,
  getParkingChargesDescription,
};
