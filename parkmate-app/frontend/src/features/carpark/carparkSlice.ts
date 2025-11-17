import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { carparkService, NearbyCarparksResponse, CarparkSearchResponse } from './carparkService';
import { 
  Carpark, 
  CarparkFilters, 
  NearbyCarparksRequest, 
  CarparkSearchRequest, 
  CarparkStats,
  UserLocation 
} from './carparkTypes';

export interface CarparkState {
  // Current user location
  userLocation: UserLocation | null;
  locationLoading: boolean;
  locationError: string | null;

  // Nearby carparks
  nearbyCarparks: Carpark[];
  nearbyLoading: boolean;
  nearbyError: string | null;
  nearbyRadius: number;
  nearbyCenter: { latitude: number; longitude: number } | null;
  nearbyTotal: number;

  // Search results
  searchResults: Carpark[];
  searchLoading: boolean;
  searchError: string | null;
  searchQuery: string;
  searchTotal: number;

  // Selected carpark
  selectedCarpark: Carpark | null;
  selectedLoading: boolean;
  selectedError: string | null;

  // Filters
  filters: CarparkFilters;

  // Stats
  stats: CarparkStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // UI state
  showFilters: boolean;
  mapCenter: { latitude: number; longitude: number } | null;
  mapZoom: number;
  evMode: boolean; // EV charger mode toggle
  evConnectorFilter: string; // EV connector type filter (e.g., 'Type 2', 'CCS 2', 'all')
}

const initialState: CarparkState = {
  userLocation: null,
  locationLoading: false,
  locationError: null,

  nearbyCarparks: [],
  nearbyLoading: false,
  nearbyError: null,
  nearbyRadius: 1000,
  nearbyCenter: null,
  nearbyTotal: 0,

  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchQuery: '',
  searchTotal: 0,

  selectedCarpark: null,
  selectedLoading: false,
  selectedError: null,

  filters: {
    max_distance: 1000,
  },

  stats: null,
  statsLoading: false,
  statsError: null,

  showFilters: false,
  mapCenter: { latitude: 1.3521, longitude: 103.8198 }, // Singapore center
  mapZoom: 12,
  evMode: false, // Default to regular carpark mode
  evConnectorFilter: 'all', // Default to show all connector types
};

// Async thunks
export const fetchNearbyCarparks = createAsyncThunk(
  'carpark/fetchNearbyCarparks',
  async (request: NearbyCarparksRequest, { rejectWithValue }) => {
    try {
      const response = await carparkService.getNearbyCarparks(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch nearby carparks');
    }
  }
);

export const searchCarparks = createAsyncThunk(
  'carpark/searchCarparks',
  async (request: CarparkSearchRequest, { rejectWithValue }) => {
    try {
      const response = await carparkService.searchCarparks(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search carparks');
    }
  }
);

export const fetchCarparkById = createAsyncThunk(
  'carpark/fetchCarparkById',
  async (id: string, { rejectWithValue }) => {
    try {
      const carpark = await carparkService.getCarparkById(id);
      return carpark;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch carpark details');
    }
  }
);

export const fetchCarparkStats = createAsyncThunk(
  'carpark/fetchCarparkStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await carparkService.getCarparkStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch carpark statistics');
    }
  }
);

const carparkSlice = createSlice({
  name: 'carpark',
  initialState,
  reducers: {
    setUserLocation: (state, action: PayloadAction<UserLocation>) => {
      state.userLocation = action.payload;
      state.locationError = null;
      // Update map center to user location
      state.mapCenter = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.locationLoading = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.locationError = action.payload;
      state.locationLoading = false;
    },
    clearLocationError: (state) => {
      state.locationError = null;
    },
    setFilters: (state, action: PayloadAction<Partial<CarparkFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { max_distance: 1000 };
    },
    toggleShowFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    setMapCenter: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchTotal = 0;
      state.searchError = null;
    },
    clearSelectedCarpark: (state) => {
      state.selectedCarpark = null;
      state.selectedError = null;
    },
    setEvMode: (state, action: PayloadAction<boolean>) => {
      state.evMode = action.payload;
    },
    setEvConnectorFilter: (state, action: PayloadAction<string>) => {
      state.evConnectorFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch nearby carparks
    builder
      .addCase(fetchNearbyCarparks.pending, (state) => {
        state.nearbyLoading = true;
        state.nearbyError = null;
      })
      .addCase(fetchNearbyCarparks.fulfilled, (state, action: PayloadAction<NearbyCarparksResponse>) => {
        state.nearbyLoading = false;
        state.nearbyCarparks = action.payload.carparks;
        state.nearbyRadius = action.payload.radius;
        state.nearbyCenter = action.payload.center;
        state.nearbyTotal = action.payload.total;
        state.nearbyError = null;
      })
      .addCase(fetchNearbyCarparks.rejected, (state, action) => {
        state.nearbyLoading = false;
        state.nearbyError = action.payload as string;
        state.nearbyCarparks = [];
      });

    // Search carparks
    builder
      .addCase(searchCarparks.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCarparks.fulfilled, (state, action: PayloadAction<CarparkSearchResponse>) => {
        state.searchLoading = false;
        state.searchResults = action.payload.carparks;
        state.searchQuery = action.payload.query;
        state.searchTotal = action.payload.total;
        state.searchError = null;
      })
      .addCase(searchCarparks.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
        state.searchResults = [];
      });

    // Fetch carpark by ID
    builder
      .addCase(fetchCarparkById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchCarparkById.fulfilled, (state, action: PayloadAction<Carpark>) => {
        state.selectedLoading = false;
        state.selectedCarpark = action.payload;
        state.selectedError = null;
      })
      .addCase(fetchCarparkById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload as string;
        state.selectedCarpark = null;
      });

    // Fetch carpark stats
    builder
      .addCase(fetchCarparkStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchCarparkStats.fulfilled, (state, action: PayloadAction<CarparkStats>) => {
        state.statsLoading = false;
        state.stats = action.payload;
        state.statsError = null;
      })
      .addCase(fetchCarparkStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
        state.stats = null;
      });
  },
});

export const {
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
  setEvMode,
  setEvConnectorFilter,
} = carparkSlice.actions;

export default carparkSlice.reducer;