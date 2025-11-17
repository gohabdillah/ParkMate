import { pool } from '@config/database';
import { Carpark, GetNearbyCarparkParams, SearchCarparkParams } from './carpark.types';
import logger from '@shared/utils/logger';

export class CarparkRepository {
  /**
   * Get nearby carparks using PostGIS spatial queries
   */
  async getNearbyCarparks(params: GetNearbyCarparkParams): Promise<Carpark[]> {
    const {
      latitude,
      longitude,
      radius = 2000, // 2km default
      limit = 30,
      minAvailableLots,
      maxPrice,
      carparkType,
      hasEvCharger,
      nightParking
    } = params;

    let whereConditions: string[] = [];
    let queryParams: any[] = [longitude, latitude, radius];
    let paramIndex = 4;

    if (minAvailableLots !== undefined) {
      whereConditions.push(`available_lots >= $${paramIndex}`);
      queryParams.push(minAvailableLots);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      whereConditions.push(`price_per_hour <= $${paramIndex}`);
      queryParams.push(maxPrice);
      paramIndex++;
    }

    if (carparkType) {
      whereConditions.push(`carpark_type = $${paramIndex}`);
      queryParams.push(carparkType);
      paramIndex++;
    }

    if (hasEvCharger !== undefined) {
      whereConditions.push(`has_ev_charger = $${paramIndex}`);
      queryParams.push(hasEvCharger);
      paramIndex++;
    }

    if (nightParking !== undefined) {
      whereConditions.push(`night_parking = $${paramIndex}`);
      queryParams.push(nightParking);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `AND ${whereConditions.join(' AND ')}` 
      : '';

    const query = `
      SELECT 
        id,
        external_id,
        address,
        longitude,
        latitude,
        total_lots,
        available_lots,
        lot_type,
        carpark_type,
        parking_system,
        short_term_parking,
        free_parking,
        night_parking,
        car_park_decks,
        gantry_height,
        car_park_basement,
        price_per_hour,
        price_weekday_rate_1,
        price_weekday_rate_2,
        price_saturday_rate,
        price_sunday_rate,
        price_per_half_hour,
        is_central_area,
        day_parking_cap,
        night_parking_cap,
        whole_day_parking_cap,
        grace_period_minutes,
        per_minute_rate,
        has_ev_charger,
        operating_hours,
        pricing_details,
        amenities,
        (
          6371 * acos(
            cos(radians($2)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($1)) + 
            sin(radians($2)) * sin(radians(latitude))
          )
        ) as distance,
        created_at,
        updated_at
      FROM carparks
      WHERE (
        6371 * acos(
          cos(radians($2)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($1)) + 
          sin(radians($2)) * sin(radians(latitude))
        )
      ) <= ($3 / 1000.0)
      ${whereClause}
      ORDER BY distance ASC
      LIMIT $${paramIndex}
    `;

    queryParams.push(limit);

    try {
      const result = await pool.query(query, queryParams);
      return result.rows.map(this.mapRowToCarpark);
    } catch (error) {
      logger.error('Error fetching nearby carparks:', error);
      throw error;
    }
  }

  /**
   * Search carparks with filters and sorting (without PostGIS)
   */
  async searchCarparks(params: SearchCarparkParams): Promise<{ carparks: Carpark[]; total: number }> {
    const {
      query,
      latitude,
      longitude,
      radius = 5000,
      limit = 50,
      offset = 0,
      sortBy = 'distance',
      sortOrder = 'asc'
    } = params;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    let distanceSelect = '';
    let distanceWhere = '';

    // Add location-based filtering if coordinates provided (using Haversine formula)
    if (latitude && longitude) {
      distanceSelect = `, (
        6371 * acos(
          cos(radians($${paramIndex + 1})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($${paramIndex})) + 
          sin(radians($${paramIndex + 1})) * sin(radians(latitude))
        )
      ) as distance`;
      
      distanceWhere = `(
        6371 * acos(
          cos(radians($${paramIndex + 1})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($${paramIndex})) + 
          sin(radians($${paramIndex + 1})) * sin(radians(latitude))
        )
      ) <= ($${paramIndex + 2} / 1000.0)`;
      
      queryParams.push(longitude, latitude, radius);
      whereConditions.push(distanceWhere);
      paramIndex += 3;
    }

    // Add text search if query provided
    if (query) {
      whereConditions.push(`(
        address ILIKE $${paramIndex} OR
        external_id ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${query}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Determine sort column
    let orderBy = 'created_at DESC';
    if (sortBy === 'distance' && latitude && longitude) {
      orderBy = `distance ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'price') {
      orderBy = `price_per_hour ${sortOrder.toUpperCase()} NULLS LAST`;
    } else if (sortBy === 'availability') {
      orderBy = `available_lots ${sortOrder.toUpperCase()}`;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM carparks
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        external_id,
        address,
        longitude,
        latitude,
        total_lots,
        available_lots,
        lot_type,
        carpark_type,
        parking_system,
        short_term_parking,
        free_parking,
        night_parking,
        car_park_decks,
        gantry_height,
        car_park_basement,
        price_per_hour,
        price_weekday_rate_1,
        price_weekday_rate_2,
        price_saturday_rate,
        price_sunday_rate,
        price_per_half_hour,
        is_central_area,
        day_parking_cap,
        night_parking_cap,
        whole_day_parking_cap,
        grace_period_minutes,
        per_minute_rate,
        has_ev_charger,
        operating_hours,
        pricing_details,
        amenities,
        created_at,
        updated_at
        ${distanceSelect}
      FROM carparks
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        pool.query(countQuery, queryParams.slice(0, -2)), // Exclude limit and offset
        pool.query(dataQuery, queryParams)
      ]);

      return {
        carparks: dataResult.rows.map(this.mapRowToCarpark),
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      logger.error('Error searching carparks:', error);
      throw error;
    }
  }

  /**
   * Get carpark by ID
   */
  async getCarparkById(id: string): Promise<Carpark | null> {
    const query = `
      SELECT 
        id,
        external_id,
        address,
        longitude,
        latitude,
        total_lots,
        available_lots,
        lot_type,
        carpark_type,
        parking_system,
        short_term_parking,
        free_parking,
        night_parking,
        car_park_decks,
        gantry_height,
        car_park_basement,
        price_per_hour,
        price_weekday_rate_1,
        price_weekday_rate_2,
        price_saturday_rate,
        price_sunday_rate,
        price_per_half_hour,
        is_central_area,
        day_parking_cap,
        night_parking_cap,
        whole_day_parking_cap,
        grace_period_minutes,
        per_minute_rate,
        has_ev_charger,
        operating_hours,
        pricing_details,
        amenities,
        created_at,
        updated_at
      FROM carparks
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToCarpark(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error fetching carpark by ID:', error);
      throw error;
    }
  }

  /**
   * Update carpark availability (for real-time updates)
   */
  async updateAvailability(externalId: string, availableLots: number, totalLots?: number): Promise<void> {
    const query = totalLots !== undefined
      ? `UPDATE carparks SET available_lots = $1, total_lots = $2, updated_at = NOW() WHERE external_id = $3`
      : `UPDATE carparks SET available_lots = $1, updated_at = NOW() WHERE external_id = $2`;

    const params = totalLots !== undefined 
      ? [availableLots, totalLots, externalId]
      : [availableLots, externalId];

    try {
      await pool.query(query, params);
    } catch (error) {
      logger.error('Error updating carpark availability:', error);
      throw error;
    }
  }

  /**
   * Map database row to Carpark object
   */
  private mapRowToCarpark(row: any): Carpark {
    return {
      id: row.id,
      externalId: row.external_id,
      address: row.address,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      totalLots: row.total_lots,
      availableLots: row.available_lots,
      lotType: row.lot_type,
      carparkType: row.carpark_type,
      parkingSystem: row.parking_system,
      shortTermParking: row.short_term_parking,
      freeParking: row.free_parking,
      nightParking: row.night_parking,
      carParkDecks: row.car_park_decks,
      gantryHeight: row.gantry_height ? parseFloat(row.gantry_height) : undefined,
      carParkBasement: row.car_park_basement,
      pricePerHour: row.price_per_hour ? parseFloat(row.price_per_hour) : undefined,
      priceWeekdayRate1: row.price_weekday_rate_1 ? parseFloat(row.price_weekday_rate_1) : undefined,
      priceWeekdayRate2: row.price_weekday_rate_2 ? parseFloat(row.price_weekday_rate_2) : undefined,
      priceSaturdayRate: row.price_saturday_rate ? parseFloat(row.price_saturday_rate) : undefined,
      priceSundayRate: row.price_sunday_rate ? parseFloat(row.price_sunday_rate) : undefined,
      pricePerHalfHour: row.price_per_half_hour ? parseFloat(row.price_per_half_hour) : undefined,
      isCentralArea: row.is_central_area,
      dayParkingCap: row.day_parking_cap ? parseFloat(row.day_parking_cap) : undefined,
      nightParkingCap: row.night_parking_cap ? parseFloat(row.night_parking_cap) : undefined,
      wholeDayParkingCap: row.whole_day_parking_cap ? parseFloat(row.whole_day_parking_cap) : undefined,
      gracePeriodMinutes: row.grace_period_minutes,
      perMinuteRate: row.per_minute_rate ? parseFloat(row.per_minute_rate) : undefined,
      hasEvCharger: row.has_ev_charger,
      operatingHours: row.operating_hours,
      pricingDetails: row.pricing_details,
      amenities: row.amenities,
      distance: row.distance ? parseFloat(row.distance) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Autocomplete search for carparks (fast, lightweight results)
   */
  async autocompleteCarparks(query: string, limit: number = 10): Promise<Array<{ id: string; externalId: string; address: string }>> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = `
      SELECT 
        id,
        external_id,
        address
      FROM carparks
      WHERE 
        address ILIKE $1 OR
        external_id ILIKE $1
      ORDER BY 
        CASE 
          WHEN address ILIKE $2 THEN 1
          WHEN external_id ILIKE $2 THEN 2
          ELSE 3
        END,
        address
      LIMIT $3
    `;

    try {
      const result = await pool.query(searchQuery, [`%${query}%`, `${query}%`, limit]);
      return result.rows.map(row => ({
        id: row.id,
        externalId: row.external_id,
        address: row.address
      }));
    } catch (error) {
      logger.error('Error in autocompleteCarparks:', error);
      throw error;
    }
  }
}

export const carparkRepository = new CarparkRepository();
