import { Request, Response } from 'express';
import { carparkService } from './carpark.service';
import logger from '@shared/utils/logger';

export class CarparkController {
  /**
   * GET /api/v1/carparks/nearby
   * Get carparks near a specific location
   */
  async getNearbyCarparks(req: Request, res: Response): Promise<void> {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const minAvailableLots = req.query.minAvailableLots 
        ? parseInt(req.query.minAvailableLots as string) 
        : undefined;
      const maxPrice = req.query.maxPrice 
        ? parseFloat(req.query.maxPrice as string) 
        : undefined;
      const carparkType = req.query.carparkType as string;
      const hasEvCharger = req.query.hasEvCharger === 'true';
      const nightParking = req.query.nightParking === 'true';

      logger.info(`Fetching nearby carparks for lat: ${latitude}, lng: ${longitude}`);

      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({
          success: false,
          message: 'Invalid latitude or longitude parameters'
        });
        return;
      }

      const carparks = await carparkService.getNearbyCarparks({
        latitude,
        longitude,
        radius,
        limit,
        minAvailableLots,
        maxPrice,
        carparkType,
        hasEvCharger: req.query.hasEvCharger ? hasEvCharger : undefined,
        nightParking: req.query.nightParking ? nightParking : undefined
      });

      res.json({
        carparks: carparks,
        total: carparks.length,
        radius: radius || 1000,
        center: {
          latitude,
          longitude
        }
      });
    } catch (error) {
      logger.error('Error in getNearbyCarparks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch nearby carparks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/carparks/search
   * Search carparks with filters and pagination
   */
  async searchCarparks(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string;
      const latitude = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const longitude = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const sortBy = req.query.sortBy as 'distance' | 'price' | 'availability' | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const result = await carparkService.searchCarparks({
        query,
        latitude,
        longitude,
        radius,
        limit,
        offset,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: result.carparks,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: limit || 50
        }
      });
    } catch (error) {
      logger.error('Error in searchCarparks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search carparks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/carparks/:id
   * Get carpark details by ID
   */
  async getCarparkById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const carpark = await carparkService.getCarparkById(id);

      if (!carpark) {
        res.status(404).json({
          success: false,
          message: 'Carpark not found'
        });
        return;
      }

      res.json({
        success: true,
        data: carpark
      });
    } catch (error) {
      logger.error('Error in getCarparkById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch carpark',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/carparks/stats
   * Get carpark statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await carparkService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/carparks/autocomplete
   * Autocomplete search for carparks
   */
  async autocompleteCarparks(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!query || query.trim().length === 0) {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      const results = await carparkService.autocompleteCarparks(query, limit);

      res.json({
        success: true,
        data: results,
        query
      });
    } catch (error) {
      logger.error('Error in autocompleteCarparks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to autocomplete carparks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const carparkController = new CarparkController();
