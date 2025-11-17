import { carparkRepository } from './carpark.repository';
import { Carpark, GetNearbyCarparkParams, SearchCarparkParams } from './carpark.types';
import { carparkAvailabilityService } from '../../integrations/carparkAvailability.service';
import logger from '@shared/utils/logger';

export class CarparkService {
  /**
   * Enrich carparks with real-time availability data
   */
  private async enrichWithAvailability(carparks: Carpark[]): Promise<Carpark[]> {
    try {
      // Get external IDs from carparks
      const externalIds = carparks
        .map(c => c.externalId)
        .filter(id => id) as string[];

      if (externalIds.length === 0) {
        return carparks;
      }

      // Fetch availability data
      const availabilityMap = await carparkAvailabilityService.getAvailabilityByExternalIds(externalIds);

      // Enrich carparks with availability data
      return carparks.map(carpark => {
        if (!carpark.externalId) {
          return carpark;
        }

        const availability = availabilityMap.get(carpark.externalId);
        if (availability) {
          return {
            ...carpark,
            totalLots: availability.totalLots,
            availableLots: availability.lotsAvailable,
            lotType: availability.lotType,
            availabilityPercentage: availability.availabilityPercentage,
          };
        }

        return carpark;
      });
    } catch (error) {
      logger.error('Error enriching carparks with availability:', error);
      // Return original carparks if enrichment fails
      return carparks;
    }
  }

  /**
   * Get carparks near a specific location
   */
  async getNearbyCarparks(params: GetNearbyCarparkParams): Promise<Carpark[]> {
    logger.info(`Fetching nearby carparks for lat: ${params.latitude}, lng: ${params.longitude}`);
    const carparks = await carparkRepository.getNearbyCarparks(params);
    return await this.enrichWithAvailability(carparks);
  }

  /**
   * Search carparks with various filters
   */
  async searchCarparks(params: SearchCarparkParams): Promise<{ carparks: Carpark[]; total: number; page: number; pages: number }> {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const result = await carparkRepository.searchCarparks(params);
    const pages = Math.ceil(result.total / limit);

    // Enrich with availability
    const enrichedCarparks = await this.enrichWithAvailability(result.carparks);

    return {
      carparks: enrichedCarparks,
      total: result.total,
      page,
      pages
    };
  }

  /**
   * Get carpark details by ID
   */
  async getCarparkById(id: string): Promise<Carpark | null> {
    return await carparkRepository.getCarparkById(id);
  }

  /**
   * Update carpark availability (for real-time updates from LTA API)
   */
  async updateAvailability(externalId: string, availableLots: number, totalLots?: number): Promise<void> {
    await carparkRepository.updateAvailability(externalId, availableLots, totalLots);
    logger.info(`Updated availability for carpark ${externalId}: ${availableLots} lots`);
  }

  /**
   * Get statistics about carparks in the system
   */
  async getStats(): Promise<{ total: number; withAvailability: number; averageAvailability: number }> {
    // This could be extended with more stats
    const carparks = await carparkRepository.searchCarparks({ limit: 10000 });
    const withAvailability = carparks.carparks.filter(c => c.availableLots > 0).length;
    const totalAvailable = carparks.carparks.reduce((sum, c) => sum + c.availableLots, 0);
    const averageAvailability = carparks.carparks.length > 0 
      ? totalAvailable / carparks.carparks.length 
      : 0;

    return {
      total: carparks.total,
      withAvailability,
      averageAvailability
    };
  }

  /**
   * Autocomplete search for carparks (returns lightweight results)
   */
  async autocompleteCarparks(query: string, limit?: number): Promise<Array<{ id: string; externalId: string; address: string }>> {
    return await carparkRepository.autocompleteCarparks(query, limit);
  }
}

export const carparkService = new CarparkService();
