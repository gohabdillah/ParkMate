import { apiClient } from '../../services/apiClient';

export interface Favorite {
  id: string;
  userId: string;
  carparkId: string;
  createdAt: string;
}

export interface FavoriteWithCarpark extends Favorite {
  carpark: {
    id: string;
    externalId: string;
    address: string;
    latitude: number;
    longitude: number;
    carparkType?: string;
    parkingSystem?: string;
    freeParking?: string;
  };
}

class FavoritesService {
  private readonly baseUrl = '/favorites';

  /**
   * Add carpark to favorites
   */
  async addFavorite(carparkId: string): Promise<Favorite> {
    const response = await apiClient.post<{ success: boolean; data: Favorite }>(
      this.baseUrl,
      { carparkId }
    );
    return response.data.data;
  }

  /**
   * Remove carpark from favorites
   */
  async removeFavorite(carparkId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(
      `${this.baseUrl}/${carparkId}`
    );
    return response.data.success;
  }

  /**
   * Check if carpark is favorited
   */
  async isFavorite(carparkId: string): Promise<boolean> {
    const response = await apiClient.get<{ success: boolean; data: { isFavorite: boolean } }>(
      `${this.baseUrl}/check/${carparkId}`
    );
    return response.data.data.isFavorite;
  }

  /**
   * Get all user favorites
   */
  async getUserFavorites(): Promise<FavoriteWithCarpark[]> {
    const response = await apiClient.get<{ success: boolean; data: FavoriteWithCarpark[] }>(
      this.baseUrl
    );
    return response.data.data;
  }
}

export const favoritesService = new FavoritesService();
