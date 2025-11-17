import { apiClient } from '../../services/apiClient';
import { 
  Carpark, 
  NearbyCarparksRequest, 
  CarparkSearchRequest, 
  CarparkStats 
} from './carparkTypes';

export interface NearbyCarparksResponse {
  carparks: Carpark[];
  total: number;
  radius: number;
  center: {
    latitude: number;
    longitude: number;
  };
}

export interface CarparkSearchResponse {
  carparks: Carpark[];
  total: number;
  query: string;
}

class CarparkService {
  private readonly baseUrl = '/carparks';

  /**
   * Get nearby carparks based on user's location
   */
  async getNearbyCarparks(request: NearbyCarparksRequest): Promise<NearbyCarparksResponse> {
    const params = new URLSearchParams({
      latitude: request.latitude.toString(),
      longitude: request.longitude.toString(),
      radius: (request.radius || 1000).toString(),
      limit: (request.limit || 50).toString(),
    });

    // Add filter parameters
    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<NearbyCarparksResponse>(`${this.baseUrl}/nearby?${params}`);
    return response.data;
  }

  /**
   * Search carparks by query
   */
  async searchCarparks(request: CarparkSearchRequest): Promise<CarparkSearchResponse> {
    const params = new URLSearchParams({
      query: request.query,
      limit: (request.limit || 50).toString(),
    });

    if (request.latitude) params.append('latitude', request.latitude.toString());
    if (request.longitude) params.append('longitude', request.longitude.toString());
    if (request.radius) params.append('radius', request.radius.toString());

    // Add filter parameters
    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<CarparkSearchResponse>(`${this.baseUrl}/search?${params}`);
    return response.data;
  }

  /**
   * Get carpark by ID
   */
  async getCarparkById(id: string): Promise<Carpark> {
    const response = await apiClient.get<{ success: boolean; data: Carpark }>(`${this.baseUrl}/${id}`);
    return response.data.data; // Extract the carpark from the nested data property
  }

  /**
   * Get carpark statistics
   */
  async getCarparkStats(): Promise<CarparkStats> {
    const response = await apiClient.get<CarparkStats>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Autocomplete search for carparks (returns lightweight results)
   */
  async autocompleteCarparks(query: string, limit: number = 10): Promise<Array<{ id: string; externalId: string; address: string }>> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await apiClient.get<{ success: boolean; data: Array<{ id: string; externalId: string; address: string }> }>(`${this.baseUrl}/autocomplete?${params}`);
    return response.data.data;
  }
}

export const carparkService = new CarparkService();