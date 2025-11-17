import axios from 'axios';
import RedisClient from '../config/redis';
import { logger } from '../shared/utils/logger';

interface CarparkAvailabilityInfo {
  total_lots: string;
  lot_type: string;
  lots_available: string;
}

interface CarparkAvailabilityData {
  carpark_number: string;
  update_datetime: string;
  carpark_info: CarparkAvailabilityInfo[];
}

interface AvailabilityResponse {
  items: Array<{
    timestamp: string;
    carpark_data: CarparkAvailabilityData[];
  }>;
}

export interface CarparkAvailability {
  carparkNumber: string;
  totalLots: number;
  lotsAvailable: number;
  lotType: string;
  updateDatetime: string;
  availabilityPercentage: number;
}

class CarparkAvailabilityService {
  private readonly API_URL = 'https://api.data.gov.sg/v1/transport/carpark-availability';
  private readonly CACHE_KEY = 'carpark:availability:all';
  private readonly CACHE_DURATION = 300; // 5 minutes in seconds
  private redisClient: ReturnType<typeof RedisClient.getInstance>;

  constructor() {
    this.redisClient = RedisClient.getInstance();
  }

  /**
   * Fetch carpark availability from data.gov.sg API
   */
  private async fetchFromAPI(): Promise<Map<string, CarparkAvailability>> {
    try {
      const headers: any = {};
      
      // Add API key if available
      if (process.env.DATA_GOV_SG_API_KEY) {
        headers['X-Api-Key'] = process.env.DATA_GOV_SG_API_KEY;
      }

      const response = await axios.get<AvailabilityResponse>(this.API_URL, {
        headers,
        timeout: 10000, // 10 second timeout
      });

      if (!response.data?.items?.[0]?.carpark_data) {
        throw new Error('Invalid API response format');
      }

      const availabilityMap = new Map<string, CarparkAvailability>();
      const carparkData = response.data.items[0].carpark_data;

      for (const carpark of carparkData) {
        // Most carparks have only one lot type (C for Car)
        // If multiple lot types exist, we'll use the first one (usually C)
        const info = carpark.carpark_info[0];
        
        const totalLots = parseInt(info.total_lots);
        const lotsAvailable = parseInt(info.lots_available);
        const availabilityPercentage = totalLots > 0 
          ? Math.round((lotsAvailable / totalLots) * 100)
          : 0;

        availabilityMap.set(carpark.carpark_number, {
          carparkNumber: carpark.carpark_number,
          totalLots,
          lotsAvailable,
          lotType: info.lot_type,
          updateDatetime: carpark.update_datetime,
          availabilityPercentage,
        });
      }

      logger.info(`Fetched availability for ${availabilityMap.size} carparks`);
      return availabilityMap;
    } catch (error) {
      logger.error('Error fetching carpark availability:', error);
      throw error;
    }
  }

  /**
   * Get availability data with caching
   */
  async getAvailability(): Promise<Map<string, CarparkAvailability>> {
    try {
      // Try to get from cache first
      if (this.redisClient) {
        const cached = await this.redisClient.get(this.CACHE_KEY);
        if (cached) {
          logger.info('Returning cached availability data');
          const parsed = JSON.parse(cached);
          return new Map(Object.entries(parsed));
        }
      }

      // Fetch fresh data from API
      const availabilityMap = await this.fetchFromAPI();

      // Cache the result
      if (this.redisClient && availabilityMap.size > 0) {
        const cacheData = Object.fromEntries(availabilityMap);
        await this.redisClient.set(
          this.CACHE_KEY,
          JSON.stringify(cacheData),
          this.CACHE_DURATION
        );
        logger.info('Cached availability data');
      }

      return availabilityMap;
    } catch (error) {
      logger.error('Error getting carpark availability:', error);
      // Return empty map on error instead of throwing
      return new Map();
    }
  }

  /**
   * Get availability for a specific carpark by external ID
   */
  async getAvailabilityByExternalId(externalId: string): Promise<CarparkAvailability | null> {
    const availabilityMap = await this.getAvailability();
    return availabilityMap.get(externalId) || null;
  }

  /**
   * Get availability for multiple carparks by external IDs
   */
  async getAvailabilityByExternalIds(externalIds: string[]): Promise<Map<string, CarparkAvailability>> {
    const allAvailability = await this.getAvailability();
    const result = new Map<string, CarparkAvailability>();

    for (const externalId of externalIds) {
      const availability = allAvailability.get(externalId);
      if (availability) {
        result.set(externalId, availability);
      }
    }

    return result;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  async clearCache(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(this.CACHE_KEY);
      logger.info('Cleared availability cache');
    }
  }

  /**
   * Determine color based on availability percentage
   */
  static getColorByAvailability(availabilityPercentage: number): string {
    if (availabilityPercentage >= 30) {
      return '#4CAF50'; // Green - Good availability (30%+)
    } else if (availabilityPercentage >= 10) {
      return '#FF9800'; // Orange - Limited availability (10-29%)
    } else if (availabilityPercentage > 0) {
      return '#F44336'; // Red - Very limited availability (1-9%)
    } else {
      return '#757575'; // Grey - No availability or no data
    }
  }
}

export const carparkAvailabilityService = new CarparkAvailabilityService();
