import { favoritesRepository } from './favorites.repository';
import { Favorite, FavoriteWithCarpark } from './favorites.types';

export class FavoritesService {
  async addFavorite(userId: string, carparkId: string): Promise<Favorite> {
    return await favoritesRepository.addFavorite(userId, carparkId);
  }

  async removeFavorite(userId: string, carparkId: string): Promise<boolean> {
    return await favoritesRepository.removeFavorite(userId, carparkId);
  }

  async isFavorite(userId: string, carparkId: string): Promise<boolean> {
    return await favoritesRepository.isFavorite(userId, carparkId);
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithCarpark[]> {
    return await favoritesRepository.getUserFavorites(userId);
  }
}

export const favoritesService = new FavoritesService();
