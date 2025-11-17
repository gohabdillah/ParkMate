import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Paper,
  Divider,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { 
  KeyboardArrowUp, 
  KeyboardArrowDown, 
  Delete, 
  LocationOn,
  Favorite as FavoriteIcon,
  NearMe,
  AttachMoney,
  CheckCircle
} from '@mui/icons-material';
import { favoritesService } from '../../features/favorites/favoritesService';
import { useCarpark } from '../../features/carpark/useCarpark';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { evChargersReal as evChargers, EvCharger } from '../../features/carpark/evChargersData';

// EV Charger favorites helper (matching the one in CarparkMap)
const EV_FAVORITES_KEY = 'ev_charger_favorites';

const getEvFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(EV_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

interface FavoriteWithCarpark {
  id: string;
  userId: string;
  carparkId: string;
  createdAt: string;
  carpark: {
    id: string;
    externalId: string;
    address: string;
    latitude: number;
    longitude: number;
    carparkType?: string;
    parkingSystem?: string;
  };
}

interface FavoritesBottomSheetProps {
  onSelectCarpark?: (carpark: any) => void;
  onSelectEvCharger?: (charger: { latitude: number; longitude: number; id: string }) => void;
}

const FavoritesBottomSheet = ({ onSelectCarpark, onSelectEvCharger }: FavoritesBottomSheetProps) => {
  const [favorites, setFavorites] = useState<FavoriteWithCarpark[]>([]);
  const [evFavorites, setEvFavorites] = useState<EvCharger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // 0: Nearest, 1: Price, 2: Availability, 3: Favorites
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Get EV mode from Redux
  const { evMode } = useSelector((state: RootState) => state.carpark);
  
  // Get nearby carparks from store
  const { nearbyCarparks, nearbyLoading, userLocation } = useCarpark();

  // Calculate nearby EV chargers when in EV mode
  const nearbyEvChargers = useMemo(() => {
    if (!evMode || !userLocation) return [];
    
    // Calculate distance for each charger
    const chargersWithDistance = evChargers.map(charger => {
      const R = 6371e3; // Earth radius in meters
      const φ1 = userLocation.latitude * Math.PI / 180;
      const φ2 = charger.latitude * Math.PI / 180;
      const Δφ = (charger.latitude - userLocation.latitude) * Math.PI / 180;
      const Δλ = (charger.longitude - userLocation.longitude) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return {
        ...charger,
        distance
      };
    });

    // Filter to within 2km
    const nearbyChargers = chargersWithDistance.filter(charger => charger.distance <= 2000);
    
    // Group by location (lat/lng) to avoid duplicates
    // Keep the first charger for each unique location
    const locationMap = new Map();
    nearbyChargers.forEach(charger => {
      const locationKey = `${charger.latitude.toFixed(6)},${charger.longitude.toFixed(6)}`;
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, charger);
      }
    });
    
    // Convert back to array and sort by distance
    return Array.from(locationMap.values())
      .sort((a, b) => a.distance - b.distance);
  }, [evMode, userLocation]);

  // Heights for different states
  const minimalHeight = 105;
  const collapsedHeight = 200;
  const expandedHeight = window.innerHeight * 0.7;

  useEffect(() => {
    loadFavorites();
    loadEvFavorites();
  }, []);

  // Listen for EV favorites changes
  useEffect(() => {
    const handleEvFavoritesChange = () => {
      loadEvFavorites();
    };
    
    window.addEventListener('evFavoritesChanged', handleEvFavoritesChange);
    return () => window.removeEventListener('evFavoritesChanged', handleEvFavoritesChange);
  }, []);

  // Reset tab when switching between EV mode and normal mode
  useEffect(() => {
    // If current tab is invalid for the mode, reset to tab 0 (Nearest)
    if (evMode && currentTab > 1) {
      setCurrentTab(0);
    } else if (!evMode && currentTab > 3) {
      setCurrentTab(0);
    }
  }, [evMode]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const data = await favoritesService.getUserFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvFavorites = () => {
    try {
      const favoriteIds = getEvFavorites();
      const favoriteChargers = evChargers.filter(charger => favoriteIds.includes(charger.id));
      setEvFavorites(favoriteChargers);
    } catch (err) {
      console.error('Error loading EV favorites:', err);
    }
  };

  const handleRemoveEvFavorite = (chargerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const favorites = getEvFavorites();
      const updated = favorites.filter(id => id !== chargerId);
      localStorage.setItem(EV_FAVORITES_KEY, JSON.stringify(updated));
      loadEvFavorites();
      // Dispatch event to update map if needed
      window.dispatchEvent(new CustomEvent('evFavoritesChanged'));
    } catch (err) {
      console.error('Error removing EV favorite:', err);
    }
  };

  const handleRemoveFavorite = async (carparkId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await favoritesService.removeFavorite(carparkId);
      setFavorites(favorites.filter(fav => fav.carparkId !== carparkId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const handleCarparkClick = (carpark: FavoriteWithCarpark['carpark']) => {
    if (onSelectCarpark) {
      onSelectCarpark(carpark);
      setIsOpen(false);
      setIsExpanded(false);
    }
  };

  // Handle tapping the header to cycle through states
  const handleHeaderClick = () => {
    if (!isOpen) {
      // First tap: open to collapsed state (show ~2 items)
      setIsOpen(true);
      setIsExpanded(false);
    } else if (!isExpanded) {
      // Second tap: expand to full
      setIsExpanded(true);
    } else {
      // Third tap: collapse back to show ~2 items
      setIsExpanded(false);
    }
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
    setDragCurrentY(clientY);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    setDragCurrentY(clientY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const dragDistance = dragStartY - dragCurrentY;
    const threshold = 50; // Minimum drag distance to trigger state change

    // Determine next state based on drag
    if (!isOpen && dragDistance > threshold) {
      // From minimal to collapsed
      setIsOpen(true);
      setIsExpanded(false);
    } else if (isOpen && !isExpanded && dragDistance > threshold) {
      // From collapsed to expanded
      setIsExpanded(true);
    } else if (isExpanded && dragDistance < -threshold) {
      // From expanded to collapsed
      setIsExpanded(false);
    } else if (isOpen && !isExpanded && dragDistance < -threshold) {
      // From collapsed to minimal
      setIsOpen(false);
    }

    setDragStartY(0);
    setDragCurrentY(0);
  };

  // Calculate dynamic height during drag
  const getDynamicHeight = () => {
    if (!isDragging) {
      // Return appropriate height based on state
      if (!isOpen) return minimalHeight;
      if (isExpanded) return expandedHeight;
      return collapsedHeight;
    }

    // During drag, calculate new height
    const dragDistance = dragStartY - dragCurrentY;
    let currentHeight = minimalHeight;
    
    if (!isOpen) {
      currentHeight = minimalHeight;
    } else if (isExpanded) {
      currentHeight = expandedHeight;
    } else {
      currentHeight = collapsedHeight;
    }
    
    const newHeight = currentHeight + dragDistance;
    return Math.max(minimalHeight, Math.min(expandedHeight, newHeight));
  };

  return (
    <Paper
      ref={sheetRef}
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: getDynamicHeight(),
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        zIndex: 999,
        transition: isDragging ? 'none' : 'height 0.3s ease-out',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      {/* Drag Handle Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'transparent',
        }}
      >
        {/* Drag indicator - clickable/draggable */}
        <Box
          onClick={handleHeaderClick}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          sx={{
            cursor: 'pointer',
            '&:active': { cursor: 'grabbing' },
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {/* Dynamic arrow based on state */}
          {!isOpen ? (
            <KeyboardArrowUp sx={{ fontSize: '2rem' }} />
          ) : isExpanded ? (
            <KeyboardArrowDown sx={{ fontSize: '2rem' }} />
          ) : (
            <KeyboardArrowUp sx={{ fontSize: '2rem' }} />
          )}
        </Box>

        {/* Tabs - Always visible */}
        <Box sx={{ backgroundColor: 'primary.main' }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => {
              setCurrentTab(newValue);
              // If in minimal state, expand to collapsed when clicking a tab
              if (!isOpen) {
                setIsOpen(true);
                setIsExpanded(false);
              }
            }}
            variant="fullWidth"
            sx={{
              minHeight: 56,
              '& .MuiTab-root': {
                minHeight: 56,
                fontSize: '0.85rem',
                textTransform: 'none',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'secondary.main',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'secondary.main',
              },
            }}
          >
            <Tab 
              icon={<NearMe sx={{ fontSize: '1.2rem' }} />} 
              label="Nearest"
            />
            {!evMode && (
              <Tab 
                icon={<AttachMoney sx={{ fontSize: '1.2rem' }} />} 
                label="Price"
              />
            )}
            {!evMode && (
              <Tab 
                icon={<CheckCircle sx={{ fontSize: '1.2rem' }} />} 
                label="Availability"
              />
            )}
            <Tab 
              icon={<FavoriteIcon sx={{ fontSize: '1.2rem' }} />} 
              label="Favorites"
            />
          </Tabs>
        </Box>
      </Box>

      {/* Content Area - Only visible when open */}
      {isOpen && (
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: 'background.paper' }}>
          {/* Tab 0: Nearest Carparks/Chargers (always at index 0) */}
          {currentTab === 0 && (
            nearbyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : evMode ? (
              // Display EV chargers when in EV mode
              nearbyEvChargers.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No nearby chargers found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try searching in a different location
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {nearbyEvChargers.slice(0, 10).map((charger, index) => (
                    <Box key={charger.id}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          px: 2,
                          py: 1.5,
                        }}
                        onClick={() => {
                          // Move map to charger and open info window
                          if (onSelectEvCharger) {
                            onSelectEvCharger({
                              latitude: charger.latitude,
                              longitude: charger.longitude,
                              id: charger.id
                            });
                            setIsOpen(false);
                            setIsExpanded(false);
                          }
                        }}
                      >
                        <IconButton 
                          sx={{ mr: 1.5 }}
                          size="small"
                        >
                          <LocationOn />
                        </IconButton>
                        
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              fontWeight={500}
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {charger.address}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip 
                                component="span"
                                label={`${Math.round(charger.distance)}m`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                                variant="outlined"
                              />
                              <Chip 
                                component="span"
                                label={charger.connectorType} 
                                size="small" 
                                color="primary"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                component="span"
                                label={`${charger.powerKw}kW`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                component="span"
                                label={charger.provider} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(nearbyEvChargers.length, 10) - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )
            ) : (
              // Display regular carparks when NOT in EV mode
              nearbyCarparks.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No nearby carparks found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try searching in a different location
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {nearbyCarparks.slice(0, 10).map((carpark, index) => (
                    <Box key={carpark.id}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          px: 2,
                          py: 1.5,
                        }}
                        onClick={() => {
                          if (onSelectCarpark) {
                            onSelectCarpark(carpark);
                            setIsOpen(false);
                            setIsExpanded(false);
                          }
                        }}
                      >
                        <IconButton 
                          sx={{ mr: 1.5 }}
                          size="small"
                        >
                          <LocationOn />
                        </IconButton>
                        
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              fontWeight={500}
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {carpark.address}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                              {carpark.distance && (
                                <Chip 
                                  component="span"
                                  label={`${Math.round(carpark.distance)}m`} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                  variant="outlined"
                                />
                              )}
                              {carpark.carparkType && (
                                <Chip 
                                  component="span"
                                  label={carpark.carparkType} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                              {carpark.freeParking && carpark.freeParking !== 'NO' && (
                                <Chip 
                                  component="span"
                                  label="Free" 
                                  size="small" 
                                  color="success"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(nearbyCarparks.length, 10) - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )
            )
          )}

          {/* Tab 1: Price (only when NOT in EV mode) */}
          {!evMode && currentTab === 1 && (
            nearbyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {[...nearbyCarparks]
                  .sort((a, b) => {
                    // Helper function to get effective price per half hour
                    const getPrice = (carpark: any): number => {
                      // Check for actual free parking (SUN/PH or similar)
                      if (carpark.freeParking && carpark.freeParking !== 'NO') {
                        return 0; // Free parking ranks first
                      }
                      
                      // Use pricePerHalfHour (most common field for HDB carparks)
                      if (carpark.pricePerHalfHour !== undefined && carpark.pricePerHalfHour !== null) {
                        return carpark.pricePerHalfHour;
                      }
                      
                      // Fallback to pricePerHour (divide by 2 to normalize)
                      if (carpark.pricePerHour !== undefined && carpark.pricePerHour !== null) {
                        return carpark.pricePerHour / 2;
                      }
                      
                      // Fallback to weekday rate 1
                      if (carpark.priceWeekdayRate1 !== undefined && carpark.priceWeekdayRate1 !== null) {
                        return carpark.priceWeekdayRate1;
                      }
                      
                      // No price data - rank last
                      return Infinity;
                    };
                    
                    const priceA = getPrice(a);
                    const priceB = getPrice(b);
                    
                    return priceA - priceB; // Sort ascending (cheapest first)
                  })
                  .slice(0, 10)
                  .map((carpark, index) => {
                    // Calculate display price
                    const isFree = carpark.freeParking && carpark.freeParking !== 'NO';
                    const displayPrice = isFree ? 0 : (
                      carpark.pricePerHalfHour || 
                      (carpark.pricePerHour ? carpark.pricePerHour / 2 : null) ||
                      carpark.priceWeekdayRate1 || 
                      null
                    );
                    
                    return (
                      <Box key={carpark.id}>
                        <ListItem
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            px: 2,
                            py: 1.5,
                          }}
                          onClick={() => {
                            if (onSelectCarpark) {
                              onSelectCarpark(carpark);
                              setIsOpen(false);
                              setIsExpanded(false);
                            }
                          }}
                        >
                          <IconButton 
                            sx={{ mr: 1.5, color: isFree ? 'success.main' : 'text.primary' }}
                            size="small"
                          >
                            <AttachMoney />
                          </IconButton>
                          
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body1" 
                                fontWeight={500}
                                sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {carpark.address}
                              </Typography>
                            }
                            secondary={
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                {displayPrice !== null ? (
                                  <>
                                    <Chip 
                                      component="span"
                                      label={`$${displayPrice.toFixed(2)}/30min`} 
                                      size="small" 
                                      color={isFree ? "success" : "primary"}
                                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                    />
                                    {carpark.dayParkingCap && (
                                      <Chip 
                                        component="span"
                                        label={`Day Cap: $${carpark.dayParkingCap.toFixed(2)}`} 
                                        size="small" 
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                        variant="outlined"
                                      />
                                    )}
                                    {isFree && carpark.freeParking && carpark.freeParking !== 'NO' && (
                                      <Chip 
                                        component="span"
                                        label={carpark.freeParking} 
                                        size="small" 
                                        color="success"
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                        variant="outlined"
                                      />
                                    )}
                                    {carpark.isCentralArea && (
                                      <Chip 
                                        component="span"
                                        label="Central Area" 
                                        size="small" 
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                        variant="outlined"
                                      />
                                    )}
                                  </>
                                ) : (
                                  <Chip 
                                    component="span"
                                    label="Price N/A" 
                                    size="small" 
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {carpark.distance && (
                                  <Chip 
                                    component="span"
                                    label={`${Math.round(carpark.distance)}m`} 
                                    size="small" 
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < 9 && <Divider />}
                      </Box>
                    );
                  })}
              </List>
            )
          )}

          {/* Tab 2: Availability (only when NOT in EV mode) */}
          {!evMode && currentTab === 2 && (
            nearbyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {nearbyCarparks.slice(0, 10).map((carpark, index) => (
                  <Box key={carpark.id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        px: 2,
                        py: 1.5,
                      }}
                      onClick={() => {
                        if (onSelectCarpark) {
                          onSelectCarpark(carpark);
                          setIsOpen(false);
                          setIsExpanded(false);
                        }
                      }}
                    >
                      <IconButton 
                        sx={{ mr: 1.5, color: 'success.main' }}
                        size="small"
                      >
                        <CheckCircle />
                      </IconButton>
                      
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body1" 
                            fontWeight={500}
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {carpark.address}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip 
                              component="span"
                              label="Available" 
                              size="small" 
                              color="success"
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                            />
                            {carpark.carparkType && (
                              <Chip 
                                component="span"
                                label={carpark.carparkType} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                            {carpark.carParkDecks && (
                              <Chip 
                                component="span"
                                label={`${carpark.carParkDecks} decks`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < 9 && <Divider />}
                  </Box>
                ))}
              </List>
            )
          )}

          {/* Favorites Tab: Index 3 when NOT in EV mode, Index 1 when in EV mode */}
          {((evMode && currentTab === 1) || (!evMode && currentTab === 3)) && (
            isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : evMode ? (
              // Show EV charger favorites when in EV mode
              evFavorites.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No favorite chargers yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click the heart icon on EV chargers to save them here!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {evFavorites.map((charger, index) => (
                    <Box key={charger.id}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          px: 2,
                          py: 1.5,
                        }}
                        onClick={() => {
                          if (onSelectEvCharger) {
                            onSelectEvCharger({
                              latitude: charger.latitude,
                              longitude: charger.longitude,
                              id: charger.id
                            });
                            setIsOpen(false);
                            setIsExpanded(false);
                          }
                        }}
                      >
                        <IconButton 
                          sx={{ mr: 1.5, color: 'error.main' }}
                          size="small"
                        >
                          <FavoriteIcon />
                        </IconButton>
                        
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              fontWeight={500}
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {charger.address}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip 
                                component="span"
                                label={charger.connectorType} 
                                size="small" 
                                color="primary"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                component="span"
                                label={`${charger.powerKw}kW`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                component="span"
                                label={charger.provider} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                        />
                        
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => handleRemoveEvFavorite(charger.id, e)}
                          sx={{ color: 'error.main', ml: 1 }}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItem>
                      {index < evFavorites.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )
            ) : (
              // Show carpark favorites when NOT in EV mode
              favorites.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No favorites yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click the heart icon on carparks to save them here!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {favorites.map((favorite, index) => (
                    <Box key={favorite.id}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          px: 2,
                          py: 1.5,
                        }}
                        onClick={() => handleCarparkClick(favorite.carpark)}
                      >
                        <IconButton 
                          sx={{ mr: 1.5, color: 'error.main' }}
                          size="small"
                        >
                          <FavoriteIcon />
                        </IconButton>
                        
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              fontWeight={500}
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {favorite.carpark.address}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                ID: {favorite.carpark.externalId}
                              </Typography>
                              {favorite.carpark.carparkType && (
                                <Chip 
                                  component="span"
                                  label={favorite.carpark.carparkType} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                        />
                        
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => handleRemoveFavorite(favorite.carparkId, e)}
                          sx={{ color: 'error.main', ml: 1 }}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItem>
                      {index < favorites.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )
            )
          )}
        </Box>
      )}
    </Paper>
  );
};

export default FavoritesBottomSheet;

