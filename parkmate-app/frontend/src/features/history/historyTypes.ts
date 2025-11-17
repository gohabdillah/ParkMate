export interface SearchHistoryItem {
  id: string;
  carparkId: string;
  externalId: string;
  address: string;
  timestamp: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchHistoryStats {
  totalSearches: number;
  lastSearched: number | null;
  mostSearched: SearchHistoryItem | null;
}
