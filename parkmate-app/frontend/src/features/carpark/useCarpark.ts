import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState, AppDispatch } from '../../store/store';
import { geolocationService, GeolocationError } from '../../services/geolocationService';
import {
  fetchNearbyCarparks,
  searchCarparks,
  fetchCarparkById,
  fetchCarparkStats,
  setUserLocation,
  setLocationLoading,
  setLocationError,
  clearLocationError,
  setFilters,
  clearFilters,
  toggleShowFilters,
  setMapCenter,
  setMapZoom,
  clearSearchResults,
  clearSelectedCarpark,
} from './carparkSlice';
import { 
  CarparkFilters, 
  NearbyCarparksRequest, 
  CarparkSearchRequest 
} from './carparkTypes';

export const useCarpark = () => {
  const dispatch = useDispatch<AppDispatch>();
  const carparkState = useSelector((state: RootState) => state.carpark);

  // Get user's current location
  const getCurrentLocation = useCallback(async () => {
    dispatch(setLocationLoading(true));
    dispatch(clearLocationError());

    try {
      const location = await geolocationService.getCurrentLocation();
      dispatch(setUserLocation(location));
      return location;
    } catch (error) {
      const message = error instanceof GeolocationError 
        ? error.message 
        : 'Failed to get current location';
      dispatch(setLocationError(message));
      throw error;
    }
  }, [dispatch]);

  // Get nearby carparks
  const getNearbyCarparks = useCallback(async (request: NearbyCarparksRequest) => {
    return dispatch(fetchNearbyCarparks(request));
  }, [dispatch]);

  // Search carparks
  const searchCarparksByQuery = useCallback(async (request: CarparkSearchRequest) => {
    return dispatch(searchCarparks(request));
  }, [dispatch]);

  // Get carpark details by ID
  const getCarparkById = useCallback(async (id: string) => {
    return dispatch(fetchCarparkById(id));
  }, [dispatch]);

  // Get carpark statistics
  const getCarparkStats = useCallback(async () => {
    return dispatch(fetchCarparkStats());
  }, [dispatch]);

  // Find nearby carparks based on current location or specified location
  const findNearbyCarparks = useCallback(async (options?: {
    radius?: number;
    limit?: number;
    filters?: CarparkFilters;
    useCurrentLocation?: boolean;
    latitude?: number;
    longitude?: number;
  }) => {
    const { 
      radius = 1000, 
      limit = 50, 
      filters, 
      useCurrentLocation = true,
      latitude: specifiedLat,
      longitude: specifiedLng
    } = options || {};

    let location = carparkState.userLocation;

    // Use specified location if provided
    if (specifiedLat !== undefined && specifiedLng !== undefined) {
      location = { 
        latitude: specifiedLat, 
        longitude: specifiedLng,
        timestamp: Date.now()
      };
    } else if (useCurrentLocation && !location) {
      // Get current location if not available and requested
      try {
        location = await getCurrentLocation();
      } catch (error) {
        throw new Error('Unable to get current location');
      }
    } else if (carparkState.mapCenter) {
      // Use map center if available
      location = {
        ...carparkState.mapCenter,
        timestamp: Date.now()
      };
    }

    if (!location) {
      throw new Error('Location is required to find nearby carparks');
    }

    const request: NearbyCarparksRequest = {
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      limit,
      filters: { ...carparkState.filters, ...filters },
    };

    return getNearbyCarparks(request);
  }, [carparkState.userLocation, carparkState.mapCenter, carparkState.filters, getCurrentLocation, getNearbyCarparks]);

  // Update filters
  const updateFilters = useCallback((filters: Partial<CarparkFilters>) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  // Clear filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Toggle filter panel
  const toggleFilters = useCallback(() => {
    dispatch(toggleShowFilters());
  }, [dispatch]);

  // Update map center
  const updateMapCenter = useCallback((center: { latitude: number; longitude: number }) => {
    dispatch(setMapCenter(center));
  }, [dispatch]);

  // Update map zoom
  const updateMapZoom = useCallback((zoom: number) => {
    dispatch(setMapZoom(zoom));
  }, [dispatch]);

  // Clear search results
  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // Clear selected carpark
  const clearSelected = useCallback(() => {
    dispatch(clearSelectedCarpark());
  }, [dispatch]);

  // Auto-fetch nearby carparks when location changes
  useEffect(() => {
    if (carparkState.userLocation && (carparkState.nearbyCarparks || []).length === 0) {
      findNearbyCarparks({ useCurrentLocation: false });
    }
  }, [carparkState.userLocation, carparkState.nearbyCarparks?.length, findNearbyCarparks]);

  return {
    // State with safety checks for arrays
    ...carparkState,
    nearbyCarparks: carparkState.nearbyCarparks || [],
    searchResults: carparkState.searchResults || [],
    
    // Actions
    getCurrentLocation,
    getNearbyCarparks,
    searchCarparksByQuery,
    getCarparkById,
    getCarparkStats,
    findNearbyCarparks,
    updateFilters,
    resetFilters,
    toggleFilters,
    updateMapCenter,
    updateMapZoom,
    clearSearch,
    clearSelected,
  };
};