import { Response } from 'express';
import { favoritesService } from './favorites.service';
import { AuthRequest } from '@shared/middleware/auth';
import logger from '@shared/utils/logger';

export class FavoritesController {
  /**
   * POST /api/v1/favorites
   * Add a carpark to favorites
   */
  async addFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { carparkId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      if (!carparkId) {
        res.status(400).json({
          success: false,
          message: 'Carpark ID is required'
        });
        return;
      }

      const favorite = await favoritesService.addFavorite(userId, carparkId);

      res.status(201).json({
        success: true,
        data: favorite
      });
    } catch (error) {
      logger.error('Error in addFavorite:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add favorite',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/v1/favorites/:carparkId
   * Remove a carpark from favorites
   */
  async removeFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { carparkId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const removed = await favoritesService.removeFavorite(userId, carparkId);

      if (!removed) {
        res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Favorite removed successfully'
      });
    } catch (error) {
      logger.error('Error in removeFavorite:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove favorite',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/favorites/check/:carparkId
   * Check if a carpark is favorited
   */
  async checkFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { carparkId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const isFavorite = await favoritesService.isFavorite(userId, carparkId);

      res.json({
        success: true,
        data: { isFavorite }
      });
    } catch (error) {
      logger.error('Error in checkFavorite:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check favorite status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/favorites
   * Get all user favorites
   */
  async getUserFavorites(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const favorites = await favoritesService.getUserFavorites(userId);

      res.json({
        success: true,
        data: favorites
      });
    } catch (error) {
      logger.error('Error in getUserFavorites:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get favorites',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const favoritesController = new FavoritesController();
