import { pool } from '@config/database';
import { Favorite, FavoriteWithCarpark } from './favorites.types';
import logger from '@shared/utils/logger';

export class FavoritesRepository {
  /**
   * Add a carpark to user's favorites
   */
  async addFavorite(userId: string, carparkId: string): Promise<Favorite> {
    const query = `
      INSERT INTO favorites (user_id, carpark_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, carpark_id) DO NOTHING
      RETURNING id, user_id as "userId", carpark_id as "carparkId", created_at as "createdAt"
    `;

    try {
      const result = await pool.query(query, [userId, carparkId]);
      if (result.rows.length === 0) {
        // Already exists, fetch it
        return await this.getFavorite(userId, carparkId);
      }
      return result.rows[0];
    } catch (error) {
      logger.error('Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Remove a carpark from user's favorites
   */
  async removeFavorite(userId: string, carparkId: string): Promise<boolean> {
    const query = `
      DELETE FROM favorites
      WHERE user_id = $1 AND carpark_id = $2
    `;

    try {
      const result = await pool.query(query, [userId, carparkId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error('Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Get a specific favorite
   */
  async getFavorite(userId: string, carparkId: string): Promise<Favorite> {
    const query = `
      SELECT id, user_id as "userId", carpark_id as "carparkId", created_at as "createdAt"
      FROM favorites
      WHERE user_id = $1 AND carpark_id = $2
    `;

    try {
      const result = await pool.query(query, [userId, carparkId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting favorite:', error);
      throw error;
    }
  }

  /**
   * Check if a carpark is favorited by user
   */
  async isFavorite(userId: string, carparkId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM favorites
      WHERE user_id = $1 AND carpark_id = $2
    `;

    try {
      const result = await pool.query(query, [userId, carparkId]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking favorite:', error);
      throw error;
    }
  }

  /**
   * Get all favorites for a user with carpark details
   */
  async getUserFavorites(userId: string): Promise<FavoriteWithCarpark[]> {
    const query = `
      SELECT 
        f.id,
        f.user_id as "userId",
        f.carpark_id as "carparkId",
        f.created_at as "createdAt",
        c.id as "carpark_id",
        c.external_id as "carpark_externalId",
        c.address as "carpark_address",
        c.latitude as "carpark_latitude",
        c.longitude as "carpark_longitude",
        c.carpark_type as "carpark_carparkType",
        c.parking_system as "carpark_parkingSystem",
        c.free_parking as "carpark_freeParking"
      FROM favorites f
      INNER JOIN carparks c ON f.carpark_id = c.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        id: row.id,
        userId: row.userId,
        carparkId: row.carparkId,
        createdAt: row.createdAt,
        carpark: {
          id: row.carpark_id,
          externalId: row.carpark_externalId,
          address: row.carpark_address,
          latitude: parseFloat(row.carpark_latitude),
          longitude: parseFloat(row.carpark_longitude),
          carparkType: row.carpark_carparkType,
          parkingSystem: row.carpark_parkingSystem,
          freeParking: row.carpark_freeParking
        }
      }));
    } catch (error) {
      logger.error('Error getting user favorites:', error);
      throw error;
    }
  }
}

export const favoritesRepository = new FavoritesRepository();
