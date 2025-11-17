import { SearchHistoryItem } from './historyTypes';

class SearchHistoryService {
  private readonly STORAGE_KEY = 'parkmate_search_history';
  private readonly MAX_ITEMS = 20; // Keep last 20 searches

  /**
   * Add a carpark to search history
   */
  addToHistory(carpark: {
    id: string;
    externalId: string;
    address: string;
    latitude: number;
    longitude: number;
  }): void {
    try {
      const history = this.getHistory();
      
      // Remove duplicate if exists (same carparkId)
      const filtered = history.filter(item => item.carparkId !== carpark.id);
      
      // Create new history item
      const newItem: SearchHistoryItem = {
        id: this.generateId(),
        carparkId: carpark.id,
        externalId: carpark.externalId,
        address: carpark.address,
        timestamp: Date.now(),
        coordinates: {
          latitude: carpark.latitude,
          longitude: carpark.longitude,
        },
      };
      
      // Add new item at the beginning (most recent first)
      filtered.unshift(newItem);
      
      // Keep only MAX_ITEMS
      const trimmed = filtered.slice(0, this.MAX_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
      
      console.log('✅ Added to search history:', carpark.address);
    } catch (error) {
      console.error('Error saving to search history:', error);
    }
  }

  /**
   * Get all search history (sorted by most recent first)
   */
  getHistory(): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  /**
   * Get recent history (last N items)
   */
  getRecentHistory(limit: number = 5): SearchHistoryItem[] {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * Clear all search history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ Search history cleared');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * Remove a single item from history
   */
  removeItem(id: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('✅ Removed item from search history');
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  /**
   * Check if a carpark is in history
   */
  isInHistory(carparkId: string): boolean {
    const history = this.getHistory();
    return history.some(item => item.carparkId === carparkId);
  }

  /**
   * Get history count
   */
  getHistoryCount(): number {
    return this.getHistory().length;
  }

  /**
   * Format timestamp to relative time
   */
  formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const searchHistoryService = new SearchHistoryService();
