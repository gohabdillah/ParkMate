import { Box, styled, Paper, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert, Collapse, Typography, Divider, IconButton } from '@mui/material';
import { History as HistoryIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Navbar, FavoritesBottomSheet } from '@shared/components';
import CarparkMap from '../features/carpark/CarparkMap';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { carparkService } from '../features/carpark/carparkService';
import { Carpark } from '../features/carpark/carparkTypes';
import { useSearchHistory } from '../features/history/useSearchHistory';

// Styled search form component
const SearchForm = styled('form')({
  '--timing': '0.3s',
  '--width-of-input': '400px',
  '--height-of-input': '45px',
  '--border-height': '2px',
  '--input-bg': '#fff',
  '--border-color': '#2f2ee9',
  '--border-radius': '30px',
  '--after-border-radius': '1px',
  position: 'relative',
  width: 'var(--width-of-input)',
  height: 'var(--height-of-input)',
  display: 'flex',
  alignItems: 'center',
  paddingInline: '0.8em',
  borderRadius: 'var(--border-radius)',
  transition: 'border-radius 0.5s ease',
  background: 'var(--input-bg)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    background: 'var(--border-color)',
    transform: 'scaleX(0)',
    transformOrigin: 'center',
    width: '100%',
    height: 'var(--border-height)',
    left: 0,
    bottom: 0,
    borderRadius: '1px',
    transition: 'transform var(--timing) ease',
  },
  
  '&:focus-within': {
    borderRadius: 'var(--after-border-radius)',
  },
  
  '&:focus-within::before': {
    transform: 'scale(1)',
  },
  
  '& button': {
    border: 'none',
    background: 'none',
    color: '#8b8ba7',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    
    '&:hover': {
      color: '#2f2ee9',
    },
  },
  
  '& svg': {
    width: '17px',
    marginTop: '3px',
  },
});

const SearchInput = styled('input')({
  fontSize: '0.9rem',
  backgroundColor: 'transparent',
  width: '100%',
  height: '100%',
  paddingInline: '0.5em',
  paddingBlock: '0.7em',
  border: 'none',
  
  '&:focus': {
    outline: 'none',
  },
  
  '&::placeholder': {
    color: '#8b8ba7',
  },
});

const ResetButton = styled('button')({
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.3s ease',
  
  'input:not(:placeholder-shown) ~ &': {
    opacity: 1,
    visibility: 'visible',
  },
});

// Dropdown container for autocomplete results
const DropdownContainer = styled(Paper)({
  position: 'absolute',
  top: 'calc(100% + 5px)',
  left: 0,
  right: 0,
  maxHeight: '300px',
  overflowY: 'auto',
  zIndex: 1001,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
});

const DropdownItem = styled(ListItemButton)({
  padding: '12px 16px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

interface AutocompleteResult {
  id: string;
  externalId: string;
  address: string;
}

const Home = () => {
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [selectedEvCharger, setSelectedEvCharger] = useState<{ latitude: number; longitude: number; id: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);
  
  // Search history hook
  const { recentHistory, addToHistory, removeFromHistory, formatRelativeTime } = useSearchHistory();
  
  // Handle navigation from history page
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedCarparkId) {
      // Load the carpark from history
      const loadCarparkFromHistory = async () => {
        try {
          const carparkDetails = await carparkService.getCarparkById(state.selectedCarparkId);
          setSelectedCarpark(carparkDetails);
          if (state.address) {
            setSearchQuery(state.address);
          }
          // Clear the location state
          window.history.replaceState({}, document.title);
        } catch (error) {
          console.error('Error loading carpark from history:', error);
        }
      };
      loadCarparkFromHistory();
    }
  }, [location]);


  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await carparkService.autocompleteCarparks(searchQuery, 10);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  // Cleanup error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim().length === 0) return;
    
    // Clear any existing error
    setShowError(false);
    
    try {
      const results = await carparkService.searchCarparks({
        query: searchQuery,
        limit: 50
      });
      
      // Check if no results found (handle undefined or empty array)
      if (!results || !results.carparks || results.carparks.length === 0) {
        showErrorNotification('Invalid input. Please enter a valid address.');
        return;
      }
      
      // Display on map
      console.log('Found', results.carparks.length, 'carparks');
      setShowDropdown(false);
    } catch (error) {
      console.error('Error searching carparks:', error);
      showErrorNotification('Carpark database not reachable');
    }
  };
  
  // Helper function to show error notification
  const showErrorNotification = (message: string) => {
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    
    setErrorMessage(message);
    setShowError(true);
    
    // Auto-hide after 5 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setShowError(false);
    }, 5000) as unknown as number;
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteResult) => {
    console.log('🔍 Search suggestion clicked:', suggestion);
    setSearchQuery(suggestion.address);
    setShowDropdown(false);
    
    try {
      // Fetch full carpark details by ID
      console.log('📡 Fetching carpark details for ID:', suggestion.id);
      const carparkDetails = await carparkService.getCarparkById(suggestion.id);
      console.log('✅ Carpark details received:', carparkDetails);
      console.log('📍 Coordinates:', { lat: carparkDetails.latitude, lng: carparkDetails.longitude });
      
      // Add to search history
      addToHistory({
        id: carparkDetails.id,
        externalId: carparkDetails.externalId,
        address: carparkDetails.address,
        latitude: carparkDetails.latitude,
        longitude: carparkDetails.longitude,
      });
      
      setSelectedCarpark(carparkDetails);
      console.log('🗺️ Selected carpark state updated');
      
      // Fetch nearby carparks around the selected carpark location
      // This ensures we have updated data when zooming to a specific carpark
      console.log('🔄 Fetching nearby carparks around selected location...');
      try {
        await carparkService.getNearbyCarparks({
          latitude: carparkDetails.latitude,
          longitude: carparkDetails.longitude,
          radius: 1000, // 1km radius
          limit: 50,
        });
        console.log('✅ Nearby carparks refreshed');
      } catch (nearbyError) {
        console.warn('⚠️ Could not fetch nearby carparks:', nearbyError);
        // Non-critical error, continue with just the selected carpark
      }
    } catch (error) {
      console.error('❌ Error fetching carpark details:', error);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setShowError(false); // Clear any error messages
  };
  
  // Handle clicking on a history item
  const handleHistoryItemClick = async (historyItem: any) => {
    console.log('📜 History item clicked:', historyItem);
    
    // Set the search query to the history item's address
    setSearchQuery(historyItem.address);
    setShowDropdown(false);
    
    try {
      // Fetch full carpark details by ID
      const carparkDetails = await carparkService.getCarparkById(historyItem.carparkId);
      
      // Update history timestamp (moves it to top)
      addToHistory({
        id: carparkDetails.id,
        externalId: carparkDetails.externalId,
        address: carparkDetails.address,
        latitude: carparkDetails.latitude,
        longitude: carparkDetails.longitude,
      });
      
      setSelectedCarpark(carparkDetails);
      
      // Fetch nearby carparks
      try {
        await carparkService.getNearbyCarparks({
          latitude: carparkDetails.latitude,
          longitude: carparkDetails.longitude,
          radius: 1000,
          limit: 50,
        });
      } catch (nearbyError) {
        console.warn('Could not fetch nearby carparks');
      }
    } catch (error) {
      console.error('Error loading history item:', error);
    }
  };

  // Handle carpark selection from favorites bottom sheet
  const handleFavoriteSelect = async (carpark: any) => {
    console.log('💝 Favorite carpark selected:', carpark);
    
    try {
      // Fetch full carpark details to ensure we have all data
      const carparkDetails = await carparkService.getCarparkById(carpark.id);
      
      // Add to search history
      addToHistory({
        id: carparkDetails.id,
        externalId: carparkDetails.externalId,
        address: carparkDetails.address,
        latitude: carparkDetails.latitude,
        longitude: carparkDetails.longitude,
      });
      
      setSelectedCarpark(carparkDetails);
      console.log('🗺️ Map updated with favorite carpark');
    } catch (error) {
      console.error('❌ Error loading favorite carpark:', error);
      // Fallback: use the carpark data we have
      setSelectedCarpark(carpark as Carpark);
    }
  };

  // Handle EV charger selection from favorites bottom sheet
  const handleEvChargerSelect = (charger: { latitude: number; longitude: number; id: string }) => {
    console.log('⚡ EV charger selected:', charger);
    setSelectedEvCharger(charger);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navigation Bar */}
      <Navbar />
      
      {/* Main Content - Carpark Map with Search Bar Overlay */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {/* Search Bar positioned on top of map */}
        <Box 
          ref={searchContainerRef}
          sx={{ 
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '400px',
          }}
        >
          <SearchForm onSubmit={handleSearch}>
            <button type="submit">
              <svg 
                width="17" 
                height="16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                role="img" 
                aria-labelledby="search"
              >
                <path 
                  d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" 
                  stroke="currentColor" 
                  strokeWidth="1.333" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <SearchInput
              className="input"
              placeholder="Search for carparks by name or location..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                // Show dropdown if there are suggestions or history
                if (suggestions.length > 0 || (searchQuery.trim().length === 0 && recentHistory.length > 0)) {
                  setShowDropdown(true);
                }
              }}
            />
            <ResetButton 
              className="reset" 
              type="button"
              onClick={handleReset}
              style={{ 
                opacity: searchQuery ? 1 : 0, 
                visibility: searchQuery ? 'visible' : 'hidden' 
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </ResetButton>
          </SearchForm>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <DropdownContainer>
              <List sx={{ p: 0 }}>
                {isLoadingSuggestions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : suggestions.length > 0 ? (
                  // Show autocomplete suggestions
                  suggestions.map((suggestion) => (
                    <DropdownItem
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <ListItemText
                        primary={suggestion.address}
                        secondary={`ID: ${suggestion.externalId}`}
                        primaryTypographyProps={{
                          style: { fontSize: '0.9rem', fontWeight: 500 }
                        }}
                        secondaryTypographyProps={{
                          style: { fontSize: '0.75rem', color: '#666' }
                        }}
                      />
                    </DropdownItem>
                  ))
                ) : recentHistory.length > 0 ? (
                  // Show recent history when no suggestions
                  <>
                    <Box sx={{ px: 2, py: 1, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HistoryIcon sx={{ fontSize: '1rem', color: '#666' }} />
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Recent Searches
                      </Typography>
                    </Box>
                    {recentHistory.map((item) => (
                      <DropdownItem
                        key={item.id}
                        onClick={() => handleHistoryItemClick(item)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                          <HistoryIcon sx={{ fontSize: '1.2rem', color: '#999' }} />
                          <ListItemText
                            primary={item.address}
                            secondary={formatRelativeTime(item.timestamp)}
                            primaryTypographyProps={{
                              style: { fontSize: '0.9rem', fontWeight: 500 }
                            }}
                            secondaryTypographyProps={{
                              style: { fontSize: '0.7rem', color: '#999' }
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(item.id);
                            }}
                            sx={{ ml: 'auto' }}
                          >
                            <ClearIcon sx={{ fontSize: '1rem', color: '#999' }} />
                          </IconButton>
                        </Box>
                      </DropdownItem>
                    ))}
                    <Divider />
                    <ListItem sx={{ py: 0.5 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#999', 
                          textAlign: 'center', 
                          width: '100%',
                          fontStyle: 'italic'
                        }}
                      >
                        Start typing to search for carparks
                      </Typography>
                    </ListItem>
                  </>
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No results found"
                      primaryTypographyProps={{
                        style: { fontSize: '0.9rem', color: '#999', textAlign: 'center' }
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </DropdownContainer>
          )}
          
          {/* Error Notification Bubble */}
          <Collapse in={showError}>
            <Alert 
              severity="error" 
              onClose={() => setShowError(false)}
              sx={{ 
                mt: 1,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                animation: 'slideDown 0.3s ease-out',
                '@keyframes slideDown': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(-10px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {errorMessage}
            </Alert>
          </Collapse>
        </Box>
        
        {/* Carpark Map */}
        <CarparkMap 
          height="100%" 
          selectedCarpark={selectedCarpark} 
          selectedEvCharger={selectedEvCharger}
        />
      </Box>

      {/* Favorites Bottom Sheet */}
      <FavoritesBottomSheet 
        onSelectCarpark={handleFavoriteSelect}
        onSelectEvCharger={handleEvChargerSelect}
      />
    </Box>
  );
};

export default Home;
