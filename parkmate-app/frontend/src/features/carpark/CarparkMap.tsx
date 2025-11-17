/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Box, CircularProgress, Alert, Typography, Fab, Tooltip, Paper, IconButton, Collapse, FormControlLabel, Checkbox, Divider } from '@mui/material';
import { MyLocation, FilterList, Close } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Carpark } from './carparkTypes';
import { useCarpark } from './useCarpark';
import { favoritesService } from '../favorites/favoritesService';
import { GeolocationError } from '../../services/geolocationService';
import { evChargersReal as evChargers, EvCharger } from './evChargersData';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// EV Charger favorites helpers (using localStorage)
const EV_FAVORITES_KEY = 'ev_charger_favorites';

const getEvFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(EV_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const isEvChargerFavorited = (chargerId: string): boolean => {
  const favorites = getEvFavorites();
  return favorites.includes(chargerId);
};

const addEvChargerFavorite = (chargerId: string): void => {
  const favorites = getEvFavorites();
  if (!favorites.includes(chargerId)) {
    favorites.push(chargerId);
    localStorage.setItem(EV_FAVORITES_KEY, JSON.stringify(favorites));
  }
};

const removeEvChargerFavorite = (chargerId: string): void => {
  const favorites = getEvFavorites();
  const updated = favorites.filter(id => id !== chargerId);
  localStorage.setItem(EV_FAVORITES_KEY, JSON.stringify(updated));
};

// Extend window interface
declare global {
  interface Window {
    google: typeof google;
  }
}

interface CarparkMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  style: React.CSSProperties;
  carparks: Carpark[];
  userLocation?: { lat: number; lng: number } | null;
  onCarparkClick?: (carpark: Carpark) => void;
  onMapClick?: (location: { lat: number; lng: number }) => void;
  onBoundsChanged?: (bounds: { center: { lat: number; lng: number }; radius: number }) => void;
  showUserLocation?: boolean;
  selectedEvCharger?: { latitude: number; longitude: number; id: string } | null;
  // EV connector filter props
  showType2?: boolean;
  showCCS2?: boolean;
  showCHAdeMO?: boolean;
  showCCS2Alt?: boolean;
  showCC2?: boolean;
}

const CarparkMapComponent: React.FC<CarparkMapProps> = ({
  center,
  zoom,
  style,
  carparks,
  userLocation,
  onCarparkClick,
  onMapClick,
  onBoundsChanged,
  showUserLocation = true,
  selectedEvCharger = null,
  showType2 = true,
  showCCS2 = true,
  showCHAdeMO = true,
  showCCS2Alt = true,
  showCC2 = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerClusterer, setMarkerClusterer] = useState<MarkerClusterer | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const boundsChangedTimeoutRef = useRef<number | null>(null);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(12);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Get EV mode and connector filter from Redux store
  const { evMode, evConnectorFilter } = useSelector((state: RootState) => state.carpark);

  // Initialize map
  useEffect(() => {
    if (ref.current && !map && window.google) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      setMap(newMap);

      // Initialize marker clusterer
      const clusterer = new MarkerClusterer({
        map: newMap,
        markers: [],
      });
      setMarkerClusterer(clusterer);

      // Add map click listener
      if (onMapClick) {
        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMapClick({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            });
          }
        });
      }

      // Add bounds changed listener (fires when user pans/zooms)
      if (onBoundsChanged) {
        newMap.addListener('idle', () => {
          // Debounce the bounds change to avoid too many API calls
          if (boundsChangedTimeoutRef.current) {
            window.clearTimeout(boundsChangedTimeoutRef.current);
          }

          boundsChangedTimeoutRef.current = window.setTimeout(() => {
            const mapCenter = newMap.getCenter();
            const bounds = newMap.getBounds();
            
            if (mapCenter && bounds) {
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              
              // Calculate radius in meters (approximate)
              const centerLat = mapCenter.lat();
              const centerLng = mapCenter.lng();
              
              // Calculate distance to corner (rough approximation)
              const latDiff = ne.lat() - sw.lat();
              const lngDiff = ne.lng() - sw.lng();
              const radius = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000 / 2; // Convert to meters
              
              onBoundsChanged({
                center: { lat: centerLat, lng: centerLng },
                radius: Math.min(radius, 5000), // Cap at 5km
              });
            }
          }, 2000); // 2 second debounce to prevent excessive API calls
        });
      }
      
      // Add listener for bounds/zoom changes (for EV mode filtering)
      newMap.addListener('idle', () => {
        const bounds = newMap.getBounds();
        const zoom = newMap.getZoom();
        if (bounds) setMapBounds(bounds);
        if (zoom) setMapZoomLevel(zoom);
      });
    }

    return () => {
      if (boundsChangedTimeoutRef.current) {
        window.clearTimeout(boundsChangedTimeoutRef.current);
      }
    };
  }, [ref, map, center, zoom, onMapClick, onBoundsChanged]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Update map zoom when zoom prop changes
  useEffect(() => {
    if (map && zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  // Update user location marker
  useEffect(() => {
    if (map && showUserLocation) {
      if (userLocation) {
        if (userMarker) {
          userMarker.setPosition(userLocation);
        } else {
          const marker = new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Your Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            zIndex: 1000,
          });
          setUserMarker(marker);
        }
      } else if (userMarker) {
        userMarker.setMap(null);
        setUserMarker(null);
      }
    }
  }, [map, userLocation, userMarker, showUserLocation]);

  // Update carpark markers
  useEffect(() => {
    if (map && markerClusterer) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      markerClusterer.clearMarkers();

      let newMarkers: google.maps.Marker[] = [];

      if (evMode) {
        const startTime = performance.now();
        
        // Get current zoom and bounds for smart filtering
        const currentZoom = map.getZoom() || 12;
        const bounds = map.getBounds();
        
        let filteredEvChargers = evChargers;
        
        // Filter by connector type using checkbox selections
        const selectedConnectors: string[] = [];
        if (showType2) selectedConnectors.push('Type 2');
        if (showCCS2) selectedConnectors.push('CCS 2');
        if (showCHAdeMO) selectedConnectors.push('CHAdeMO');
        if (showCCS2Alt) selectedConnectors.push('CCS2');
        if (showCC2) selectedConnectors.push('CC2');
        
        // Only filter if at least one checkbox is unchecked
        if (selectedConnectors.length < 5) {
          filteredEvChargers = filteredEvChargers.filter(
            charger => selectedConnectors.includes(charger.connectorType)
          );
        }
        
        // Smart filtering based on zoom level
        if (bounds) {
          // Only show chargers within viewport + buffer
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          
          // Add 20% buffer to bounds for smooth panning
          const latBuffer = (ne.lat() - sw.lat()) * 0.2;
          const lngBuffer = (ne.lng() - sw.lng()) * 0.2;
          
          filteredEvChargers = filteredEvChargers.filter(charger => {
            const lat = charger.latitude;
            const lng = charger.longitude;
            
            return lat >= (sw.lat() - latBuffer) && 
                   lat <= (ne.lat() + latBuffer) &&
                   lng >= (sw.lng() - lngBuffer) && 
                   lng <= (ne.lng() + lngBuffer);
          });
        }
        
        // Additional limit based on zoom level to prevent overload
        let maxMarkers = 3000;
        if (currentZoom < 11) maxMarkers = 500;  // Zoomed out: fewer markers
        else if (currentZoom < 13) maxMarkers = 1500; // Medium zoom
        // Zoomed in (13+): show up to 3000
        
        if (filteredEvChargers.length > maxMarkers) {
          // Sample evenly distributed chargers
          const step = Math.ceil(filteredEvChargers.length / maxMarkers);
          filteredEvChargers = filteredEvChargers.filter((_, index) => index % step === 0);
        }
        
        const filterText = evConnectorFilter === 'all' ? '' : ` [${evConnectorFilter}]`;
        console.log(`🔌 EV Mode (zoom ${currentZoom})${filterText}: Showing ${filteredEvChargers.length} of ${evChargers.length} chargers`);
        
        // Create markers for filtered EV chargers
        newMarkers = filteredEvChargers.map(charger => {
          const marker = new window.google.maps.Marker({
            position: { lat: charger.latitude, lng: charger.longitude },
            title: charger.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: getEvChargerColor(charger),
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          // Add info window for EV charger
          marker.addListener('click', () => {
            // Close existing info window if open
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
            
            // Check if charger is favorited
            const isFavorited = isEvChargerFavorited(charger.id);
            
            // Create new info window and store reference
            const infoWindow = new window.google.maps.InfoWindow({
              content: createEvChargerInfoWindowContent(charger, isFavorited),
            });
            infoWindowRef.current = infoWindow;
            infoWindow.open(map, marker);

            // Add event listeners after InfoWindow opens
            window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
              // Favorite button event listener
              const favoriteBtn = document.getElementById(`favorite-ev-btn-${charger.id}`);
              if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  let currentlyFavorited = isEvChargerFavorited(charger.id);
                  
                  if (currentlyFavorited) {
                    removeEvChargerFavorite(charger.id);
                    currentlyFavorited = false;
                    console.log('Removed EV charger from favorites');
                  } else {
                    addEvChargerFavorite(charger.id);
                    currentlyFavorited = true;
                    console.log('Added EV charger to favorites');
                  }
                  
                  // Update the button
                  favoriteBtn.innerHTML = currentlyFavorited ? '❤️' : '🤍';
                  favoriteBtn.title = currentlyFavorited ? 'Remove from favorites' : 'Add to favorites';
                  
                  // Dispatch custom event to notify bottom sheet to refresh
                  window.dispatchEvent(new CustomEvent('evFavoritesChanged'));
                });
              }
              
              // Navigate button event listener
              const navigateBtn = document.getElementById(`navigate-ev-btn-${charger.id}`);
              if (navigateBtn) {
                navigateBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const lat = parseFloat(navigateBtn.getAttribute('data-lat') || '0');
                  const lng = parseFloat(navigateBtn.getAttribute('data-lng') || '0');
                  
                  const params = new URLSearchParams({
                    api: '1',
                    destination: `${lat},${lng}`,
                    travelmode: 'driving',
                  });
                  
                  const url = `https://www.google.com/maps/dir/?${params.toString()}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                });
              }
            });
          });

          return marker;
        });
        
        const endTime = performance.now();
        console.log(`✅ Created ${newMarkers.length} EV charger markers in ${(endTime - startTime).toFixed(0)}ms`);
      } else {
        // Create new markers for carparks
        newMarkers = (carparks || []).map(carpark => {
        const marker = new window.google.maps.Marker({
          position: { lat: carpark.latitude, lng: carpark.longitude },
          title: carpark.address,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: getMarkerColor(carpark),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 1,
            rotation: 180,
          },
        });

        // Add click listener
        if (onCarparkClick) {
          marker.addListener('click', () => onCarparkClick(carpark));
        }

        // Add info window with favorite button
        marker.addListener('click', async () => {
          // Close existing info window if open
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          
          // Check if carpark is favorited
          let isFavorited = false;
          try {
            isFavorited = await favoritesService.isFavorite(carpark.id);
          } catch (error) {
            console.log('Not logged in or error checking favorite status');
          }

          const infoWindow = new window.google.maps.InfoWindow({
            content: createInfoWindowContent(carpark, isFavorited),
          });
          infoWindowRef.current = infoWindow;

          infoWindow.open(map, marker);

          // Add event listener for favorite button after InfoWindow opens
          window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            const favoriteBtn = document.getElementById(`favorite-btn-${carpark.id}`);
            if (favoriteBtn) {
              favoriteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                  if (isFavorited) {
                    await favoritesService.removeFavorite(carpark.id);
                    isFavorited = false;
                    console.log('Removed from favorites');
                  } else {
                    await favoritesService.addFavorite(carpark.id);
                    isFavorited = true;
                    console.log('Added to favorites');
                  }
                  
                  // Update the button
                  favoriteBtn.innerHTML = isFavorited ? '❤️' : '🤍';
                  favoriteBtn.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
                } catch (error) {
                  console.error('Error toggling favorite:', error);
                  alert('Please log in to use favorites');
                }
              });
            }
            
            // Add event listener for navigate button
            const navigateBtn = document.getElementById(`navigate-btn-${carpark.id}`);
            if (navigateBtn) {
              navigateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const lat = parseFloat(navigateBtn.getAttribute('data-lat') || '0');
                const lng = parseFloat(navigateBtn.getAttribute('data-lng') || '0');
                const name = navigateBtn.getAttribute('data-name') || '';
                
                // Build Google Maps directions URL
                const params = new URLSearchParams({
                  api: '1',
                  destination: `${lat},${lng}`,
                  travelmode: 'driving',
                });
                
                const url = `https://www.google.com/maps/dir/?${params.toString()}`;
                window.open(url, '_blank', 'noopener,noreferrer');
                
                console.log('🗺️ Opening Google Maps directions to:', name);
              });
            }
          });
        });

        return marker;
      });
      }

      markersRef.current = newMarkers;
      markerClusterer.addMarkers(newMarkers);
    }
  }, [map, markerClusterer, carparks, onCarparkClick, evMode, evConnectorFilter, mapBounds, mapZoomLevel]);

  // Handle selected EV charger - trigger click on marker to open info window
  useEffect(() => {
    if (!map || !selectedEvCharger || !evMode) return;
    
    console.log('⚡ selectedEvCharger effect triggered:', selectedEvCharger);
    
    // Find the marker at the selected charger location
    const marker = markersRef.current.find((m: google.maps.Marker) => {
      const pos = m.getPosition();
      if (!pos) return false;
      
      const latMatch = Math.abs(pos.lat() - selectedEvCharger.latitude) < 0.00001;
      const lngMatch = Math.abs(pos.lng() - selectedEvCharger.longitude) < 0.00001;
      
      return latMatch && lngMatch;
    });
    
    if (marker) {
      console.log('🎯 Found marker, centering map and triggering click');
      
      // Center the map on the charger
      map.panTo({ lat: selectedEvCharger.latitude, lng: selectedEvCharger.longitude });
      map.setZoom(18);
      
      // Trigger click after a short delay to ensure map has centered
      setTimeout(() => {
        window.google.maps.event.trigger(marker, 'click');
      }, 300);
    } else {
      console.log('⚠️ Marker not found for charger, just centering map');
      // If marker not found, just center the map
      map.panTo({ lat: selectedEvCharger.latitude, lng: selectedEvCharger.longitude });
      map.setZoom(18);
    }
  }, [selectedEvCharger, map, evMode]);

  return <div ref={ref} style={style} />;
};

// Helper function to determine marker color based on carpark properties
const getMarkerColor = (carpark: Carpark): string => {
  // Priority 1: Use real-time availability data if available
  if (carpark.availabilityPercentage !== undefined && carpark.availabilityPercentage !== null) {
    if (carpark.availabilityPercentage >= 30) {
      return '#4CAF50'; // Green - Good availability (30%+)
    } else if (carpark.availabilityPercentage >= 10) {
      return '#FF9800'; // Orange - Limited availability (10-29%)
    } else if (carpark.availabilityPercentage > 0) {
      return '#F44336'; // Red - Very limited availability (1-9%)
    } else {
      return '#757575'; // Grey - No availability
    }
  }

  // Priority 2: Fallback to free parking if no real-time data
  if (carpark.freeParking && carpark.freeParking !== 'NO') {
    return '#4CAF50'; // Green for free parking
  }

  // Priority 3: Fallback to carpark type
  if (carpark.carparkType === 'SURFACE') {
    return '#FF9800'; // Orange for surface parking
  }
  if (carpark.carparkType === 'MULTI-STOREY') {
    return '#2196F3'; // Blue for multi-storey
  }
  if (carpark.carparkType === 'BASEMENT CAR PARK') {
    return '#9C27B0'; // Purple for basement
  }

  // Default: Grey for no data
  return '#757575';
};

// Helper function to get EV charger marker color based on availability
const getEvChargerColor = (charger: EvCharger): string => {
  if (charger.availability === 'available') {
    return '#4CAF50'; // Green - Available
  } else if (charger.availability === 'occupied') {
    return '#F44336'; // Red - Occupied
  } else {
    return '#FF9800'; // Orange - Unknown
  }
};

// Helper function to create EV charger info window content
const createEvChargerInfoWindowContent = (charger: EvCharger, isFavorited: boolean = false): string => {
  const availColor = charger.availability === 'available' ? '#4CAF50' : 
                     charger.availability === 'occupied' ? '#F44336' : '#FF9800';
  
  return `
    <div style="padding: 12px; min-width: 280px; max-width: 350px; font-family: 'Roboto', sans-serif;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 24px;">⚡</div>
          <div style="font-weight: bold; font-size: 16px; color: #333;">${charger.name}</div>
        </div>
        <button
          id="favorite-ev-btn-${charger.id}"
          style="
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
          "
          title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
        >
          ${isFavorited ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div style="color: #666; font-size: 13px; margin-bottom: 12px;">
        📍 ${charger.address}
      </div>

      <div style="
        background: ${availColor}15;
        border-left: 4px solid ${availColor};
        padding: 8px;
        margin: 8px 0;
        border-radius: 4px;
      ">
        <div style="color: #666; font-size: 12px;">
          ${charger.numberOfPorts} charging port${charger.numberOfPorts > 1 ? 's' : ''}
        </div>
      </div>

      <div style="
        background: #f5f5f5;
        padding: 10px;
        border-radius: 6px;
        margin: 8px 0;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666; font-size: 13px;">🔌 Connector Type:</span>
          <span style="color: #333; font-weight: 600; font-size: 13px;">${charger.connectorType}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666; font-size: 13px;">⚡ Power Output:</span>
          <span style="color: #333; font-weight: 600; font-size: 13px;">${charger.powerKw} kW</span>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 12px;">
        <button
          id="navigate-ev-btn-${charger.id}"
          data-lat="${charger.latitude}"
          data-lng="${charger.longitude}"
          style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#1976D2'"
          onmouseout="this.style.background='#2196F3'"
        >
          🗺️ Navigate
        </button>
      </div>
    </div>
  `;
};

// Helper function to create info window content with favorite button
const createInfoWindowContent = (carpark: Carpark, isFavorited: boolean = false): string => {
  const distance = carpark.distance ? `${Math.round(carpark.distance)}m away` : '';
  const freeParking = carpark.freeParking && carpark.freeParking !== 'NO' ? 
    `<div style="color: #4CAF50; font-weight: bold;">Free Parking: ${carpark.freeParking}</div>` : '';
  
  // Availability information
  let availabilityInfo = '';
  if (carpark.availabilityPercentage !== undefined && carpark.availableLots !== undefined && carpark.totalLots !== undefined) {
    const availColor = carpark.availabilityPercentage >= 30 ? '#4CAF50' : 
                       carpark.availabilityPercentage >= 10 ? '#FF9800' : 
                       carpark.availabilityPercentage > 0 ? '#F44336' : '#757575';
    availabilityInfo = `
      <div style="
        background: ${availColor}15;
        border-left: 4px solid ${availColor};
        padding: 8px;
        margin: 8px 0;
        border-radius: 4px;
      ">
        <div style="font-weight: bold; color: ${availColor}; margin-bottom: 4px;">
          ${carpark.availableLots} / ${carpark.totalLots} lots available
        </div>
        <div style="color: #666; font-size: 12px;">
          ${carpark.availabilityPercentage}% available
        </div>
      </div>
    `;
  }
  
  const heartIcon = isFavorited 
    ? '❤️' // Filled heart for favorited
    : '🤍'; // Empty heart for not favorited
  
  return `
    <div style="max-width: 280px; font-family: Arial, sans-serif; position: relative;">
      <button 
        id="favorite-btn-${carpark.id}" 
        data-carpark-id="${carpark.id}"
        style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
        "
        title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
      >
        ${heartIcon}
      </button>
      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; padding-right: 30px;">${carpark.address}</h3>
      ${distance ? `<div style="color: #666; margin-bottom: 4px;">${distance}</div>` : ''}
      ${availabilityInfo}
      
      ${carpark.pricePerHalfHour ? `
        <div style="
          background: #f5f5f5;
          border-left: 4px solid #2196F3;
          padding: 8px;
          margin: 8px 0;
          border-radius: 4px;
        ">
          <div style="font-weight: bold; color: #2196F3; margin-bottom: 4px;">
            💰 Parking Rates ${carpark.isCentralArea ? '(Central Area)' : '(Non-Central)'}
          </div>
          <div style="font-size: 13px; color: #333; margin-bottom: 2px;">
            <strong>$${carpark.pricePerHalfHour.toFixed(2)}</strong> per 0.5 hour
          </div>
          ${carpark.perMinuteRate ? `
            <div style="font-size: 12px; color: #666;">
              ($${carpark.perMinuteRate.toFixed(4)} per minute)
            </div>
          ` : ''}
          ${carpark.dayParkingCap ? `
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Day cap (7am-10:30pm): <strong>$${carpark.dayParkingCap.toFixed(2)}</strong>
            </div>
          ` : ''}
          ${carpark.nightParkingCap && carpark.nightParking ? `
            <div style="font-size: 12px; color: #666;">
              Night cap (10:30pm-7am): <strong>$${carpark.nightParkingCap.toFixed(2)}</strong>
            </div>
          ` : ''}
          ${carpark.gracePeriodMinutes ? `
            <div style="font-size: 11px; color: #4CAF50; margin-top: 4px;">
              ✓ ${carpark.gracePeriodMinutes} min grace period
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div style="margin-bottom: 4px;"><strong>Type:</strong> ${carpark.carparkType || 'N/A'}</div>
      <div style="margin-bottom: 4px;"><strong>System:</strong> ${carpark.parkingSystem || 'N/A'}</div>
      ${carpark.carParkDecks ? `<div style="margin-bottom: 4px;"><strong>Decks:</strong> ${carpark.carParkDecks}</div>` : ''}
      ${carpark.gantryHeight ? `<div style="margin-bottom: 4px;"><strong>Height Limit:</strong> ${carpark.gantryHeight}m</div>` : ''}
      ${freeParking}
      <div style="margin-top: 8px; color: #888; font-size: 12px;">ID: ${carpark.externalId}</div>
      
      <button 
        id="navigate-btn-${carpark.id}"
        data-lat="${carpark.latitude}"
        data-lng="${carpark.longitude}"
        data-name="${carpark.address}"
        style="
          width: 100%;
          margin-top: 12px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #2f2ee9 0%, #4845f5 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(47, 46, 233, 0.3);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        "
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(47, 46, 233, 0.4)'"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(47, 46, 233, 0.3)'"
        onmousedown="this.style.transform='translateY(0)'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
        Navigate
      </button>
    </div>
  `;
};

interface CarparkMapContainerProps {
  height?: string | number;
  initialZoom?: number;
  selectedCarpark?: Carpark | null;
  selectedEvCharger?: { latitude: number; longitude: number; id: string } | null;
}

const CarparkMap: React.FC<CarparkMapContainerProps> = ({ 
  height = '600px', 
  initialZoom = 16, // Increased zoom for closer view
  selectedCarpark = null,
  selectedEvCharger = null
}) => {
  const {
    userLocation,
    nearbyCarparks,
    mapCenter,
    mapZoom,
    getCurrentLocation,
    findNearbyCarparks,
    updateMapCenter,
    updateMapZoom,
  } = useCarpark();

  // Get EV mode and connector filter from Redux store
  const { evMode } = useSelector((state: RootState) => state.carpark);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const lastFetchedLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastSelectedCarparkIdRef = useRef<string | null>(null);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSheltered, setShowSheltered] = useState(true);
  const [showOpen, setShowOpen] = useState(true);
  const [heightFilter, setHeightFilter] = useState<'all' | 'low' | 'high'>('all'); // low: <1.8m, high: >=1.8m
  const [operatingFilter, setOperatingFilter] = useState<'all' | 'non-overnight' | 'overnight'>('all');

  // EV Connector type filters (checkboxes)
  const [showType2, setShowType2] = useState(true);
  const [showCCS2, setShowCCS2] = useState(true);
  const [showCHAdeMO, setShowCHAdeMO] = useState(true);
  const [showCCS2Alt, setShowCCS2Alt] = useState(true); // CCS2 variant
  const [showCC2, setShowCC2] = useState(true);

  // Filter carparks based on sheltered/open, height, and operating hours
  const filteredCarparks = nearbyCarparks.filter(carpark => {
    // Carpark type filter (sheltered/open)
    const isSheltered = carpark.carparkType === 'MULTI-STOREY CAR PARK' || 
                        carpark.carparkType === 'BASEMENT CAR PARK' ||
                        carpark.carParkBasement === true;
    const isOpen = carpark.carparkType === 'SURFACE CAR PARK' || 
                   (!isSheltered && carpark.carparkType);
    
    let typeMatch = true;
    if (isSheltered) typeMatch = showSheltered;
    else if (isOpen) typeMatch = showOpen;
    
    if (!typeMatch) return false;

    // Height filter
    if (heightFilter !== 'all' && carpark.gantryHeight) {
      if (heightFilter === 'low' && carpark.gantryHeight >= 1.8) return false;
      if (heightFilter === 'high' && carpark.gantryHeight < 1.8) return false;
    }

    // Operating hours filter
    if (operatingFilter !== 'all') {
      if (operatingFilter === 'overnight' && !carpark.nightParking) return false;
      if (operatingFilter === 'non-overnight' && carpark.nightParking) return false;
    }

    return true;
  });

  // Initialize location and fetch nearby carparks
  useEffect(() => {
    const initializeMap = async () => {
      if (isInitializedRef.current) return;
      
      try {
        setLoading(true);
        const location = await getCurrentLocation();
        
        // Set the map to zoom in on user location
        updateMapCenter({ 
          latitude: location.latitude, 
          longitude: location.longitude 
        });
        updateMapZoom(16); // Close zoom level
        
        // Fetch nearby carparks with larger radius for initial load
        await findNearbyCarparks({ radius: 2000, limit: 100 });
        
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error initializing map:', error);
        
        // Check if it's a permission denied error
        if (error instanceof GeolocationError && error.code === 1) {
          // Code 1 is PERMISSION_DENIED
          setError('Location access denied. Please enable permissions.');
        } else if (error instanceof Error && error.message.includes('denied')) {
          setError('Location access denied. Please enable permissions.');
        } else {
          setError('Could not get your location. Using default location.');
        }
        
        // Fallback to Singapore center
        updateMapCenter({ latitude: 1.3521, longitude: 103.8198 });
        updateMapZoom(12);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle selected carpark from search - zoom to it
  useEffect(() => {
    console.log('🔄 selectedCarpark effect triggered, carpark:', selectedCarpark);
    console.log('🔄 lastSelectedCarparkIdRef.current:', lastSelectedCarparkIdRef.current);
    
    if (selectedCarpark && selectedCarpark.id !== lastSelectedCarparkIdRef.current) {
      console.log('✨ Zooming to selected carpark:', selectedCarpark.address);
      console.log('📍 Target coordinates:', { lat: selectedCarpark.latitude, lng: selectedCarpark.longitude });
      console.log('🔍 Target zoom level: 18');
      
      // Store the current carpark ID to prevent re-running for the same carpark
      lastSelectedCarparkIdRef.current = selectedCarpark.id;
      
      // Update map center to selected carpark location
      updateMapCenter({
        latitude: selectedCarpark.latitude,
        longitude: selectedCarpark.longitude
      });
      console.log('✅ updateMapCenter called');
      
      // Set a close zoom level to focus on the selected carpark
      updateMapZoom(18);
      console.log('✅ updateMapZoom(18) called');
    } else {
      console.log('⏭️ Skipping zoom (same carpark or null)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCarpark]); // Only run when selectedCarpark changes

  // Handle map bounds change (when user pans or zooms)
  const handleBoundsChanged = useCallback(async (bounds: { center: { lat: number; lng: number }; radius: number }) => {
    // Avoid concurrent fetches
    if (isFetchingRef.current) return;
    
    // Check if the user has moved significantly (at least 500 meters)
    if (lastFetchedLocationRef.current) {
      const lastLat = lastFetchedLocationRef.current.lat;
      const lastLng = lastFetchedLocationRef.current.lng;
      const currentLat = bounds.center.lat;
      const currentLng = bounds.center.lng;
      
      // Calculate distance in meters using simple approximation
      const latDiff = Math.abs(currentLat - lastLat);
      const lngDiff = Math.abs(currentLng - lastLng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;
      
      // Only fetch if moved more than 500 meters
      if (distance < 500) {
        return;
      }
    }
    
    try {
      isFetchingRef.current = true;
      
      // Store the current location
      lastFetchedLocationRef.current = { lat: bounds.center.lat, lng: bounds.center.lng };
      
      // Update map center in state
      updateMapCenter({ 
        latitude: bounds.center.lat, 
        longitude: bounds.center.lng 
      });
      
      // Fetch carparks in the new viewport using the bounds center
      await findNearbyCarparks({ 
        latitude: bounds.center.lat,
        longitude: bounds.center.lng,
        radius: Math.max(bounds.radius, 1000), // Minimum 1km radius
        limit: 100,
        useCurrentLocation: false 
      });
    } catch (error) {
      console.error('Error fetching carparks for bounds:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [findNearbyCarparks, updateMapCenter]);

  const handleMyLocationClick = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      updateMapCenter({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      await findNearbyCarparks({ useCurrentLocation: true });
      // Clear any previous error when location is successfully obtained
      setError(null);
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Check if it's a permission denied error
      if (error instanceof GeolocationError && error.code === 1) {
        // Code 1 is PERMISSION_DENIED
        setError('Location access denied. Please enable permissions.');
      } else if (error instanceof Error && error.message.includes('denied')) {
        setError('Location access denied. Please enable permissions.');
      } else {
        setError('Could not get your location. Please try again.');
      }
    }
  }, [getCurrentLocation, updateMapCenter, findNearbyCarparks]);

  const handleCarparkClick = useCallback((carpark: Carpark) => {
    console.log('Selected carpark:', carpark);
    // You can dispatch an action to select the carpark or show details
  }, []);

  const handleMapClick = useCallback((location: { lat: number; lng: number }) => {
    updateMapCenter({ latitude: location.lat, longitude: location.lng });
  }, [updateMapCenter]);

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <CircularProgress />
          </Box>
        );
      case Status.FAILURE:
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={height}
            flexDirection="column"
            gap={2}
          >
            <Alert severity="error">
              <Typography variant="h6">Failed to load Google Maps</Typography>
              <Typography variant="body2">
                Please check your API key and internet connection
              </Typography>
            </Alert>
          </Box>
        );
      case Status.SUCCESS:
        const center = mapCenter || userLocation ? {
          lat: mapCenter?.latitude || userLocation?.latitude || 1.3521,
          lng: mapCenter?.longitude || userLocation?.longitude || 103.8198,
        } : { lat: 1.3521, lng: 103.8198 };

        const userPos = userLocation ? {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        } : null;

        return (
          <Box height={height} width="100%" position="relative">
            {error && (
              <Alert 
                severity={error.includes('denied') ? 'error' : 'warning'} 
                sx={{ 
                  mb: 1,
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  minWidth: '320px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            <CarparkMapComponent
              center={center}
              zoom={mapZoom || initialZoom}
              style={{ height: '100%', width: '100%' }}
              carparks={filteredCarparks}
              userLocation={userPos}
              onCarparkClick={handleCarparkClick}
              onMapClick={handleMapClick}
              onBoundsChanged={handleBoundsChanged}
              selectedEvCharger={selectedEvCharger}
              showType2={showType2}
              showCCS2={showCCS2}
              showCHAdeMO={showCHAdeMO}
              showCCS2Alt={showCCS2Alt}
              showCC2={showCC2}
            />

            {/* Floating Action Buttons - Left Side */}
            <Box
              position="absolute"
              bottom={70}
              left={16}
              display="flex"
              flexDirection="column"
              gap={1}
            >
              <Tooltip title="Get my location">
                <Fab
                  size="small"
                  onClick={handleMyLocationClick}
                  sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <MyLocation />
                </Fab>
              </Tooltip>
            </Box>

            {/* Filter Button - Bottom Right */}
            <Box
              position="absolute"
              bottom={70}
              right={16}
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              gap={1}
              zIndex={1000}
            >
              {/* Filter Panel */}
              <Collapse in={filterOpen} timeout={300}>
                <Paper
                  elevation={3}
                  sx={{
                    mb: 1,
                    p: 2,
                    minWidth: 250,
                    maxWidth: 320,
                    maxHeight: 'calc(100vh - 200px)', // Leave space for top/bottom nav
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    borderRadius: 2,
                    // Custom scrollbar styling
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#888',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: '#555',
                      },
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {evMode ? 'Filter EV Chargers' : 'Filter Carparks'}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setFilterOpen(false)}
                      sx={{ padding: 0.5 }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ mb: 1.5 }} />
                  
                  {evMode ? (
                    // EV Charger Filters
                    <>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
                        Connector Type
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={0.5} mb={1.5}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showType2}
                              onChange={(e) => setShowType2(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">⚡ Type 2 (Most Common)</Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showCCS2}
                              onChange={(e) => setShowCCS2(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">⚡⚡ CCS 2 (Fast Charging)</Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showCHAdeMO}
                              onChange={(e) => setShowCHAdeMO(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">🔋 CHAdeMO</Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showCCS2Alt}
                              onChange={(e) => setShowCCS2Alt(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">⚡ CCS2</Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showCC2}
                              onChange={(e) => setShowCC2(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">🔌 CC2</Typography>
                          }
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {[showType2, showCCS2, showCHAdeMO, showCCS2Alt, showCC2].filter(Boolean).length} of 5 selected
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => {
                            setShowType2(true);
                            setShowCCS2(true);
                            setShowCHAdeMO(true);
                            setShowCCS2Alt(true);
                            setShowCC2(true);
                          }}
                        >
                          Reset All
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                  {/* Carpark Type */}
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
                    Carpark Type
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5} mb={1.5}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showSheltered}
                          onChange={(e) => setShowSheltered(e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">🏢 Sheltered (Multi-storey, Basement)</Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showOpen}
                          onChange={(e) => setShowOpen(e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">�️ Open (Surface)</Typography>
                      }
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Height Limit */}
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
                    Height Limit
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5} mb={1.5}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={heightFilter === 'all'}
                          onChange={() => setHeightFilter('all')}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">All Heights</Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={heightFilter === 'low'}
                          onChange={() => setHeightFilter('low')}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">📏 Low Clearance (&lt; 1.8m)</Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={heightFilter === 'high'}
                          onChange={() => setHeightFilter('high')}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">📐 High Clearance (≥ 1.8m)</Typography>
                      }
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Operating Hours */}
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
                    Operating Hours
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5} mb={1.5}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={operatingFilter === 'all'}
                          onChange={() => setOperatingFilter('all')}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">All Operating Hours</Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={operatingFilter === 'non-overnight'}
                          onChange={() => setOperatingFilter('non-overnight')}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">☀️ Non-Overnight Only</Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={operatingFilter === 'overnight'}
                          onChange={() => setOperatingFilter('overnight')}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">🌙 Overnight Parking</Typography>
                      }
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Showing {filteredCarparks.length} of {nearbyCarparks.length}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => {
                        setShowSheltered(true);
                        setShowOpen(true);
                        setHeightFilter('all');
                        setOperatingFilter('all');
                      }}
                    >
                      Reset All
                    </Typography>
                  </Box>
                    </>
                  )}
                </Paper>
              </Collapse>

              {/* Filter FAB */}
              <Tooltip title={filterOpen ? "Close filters" : (evMode ? "Filter EV chargers" : "Filter carparks")}>
                <Fab
                  size="small"
                  onClick={() => setFilterOpen(!filterOpen)}
                  sx={{
                    backgroundColor: filterOpen ? 'primary.main' : 'white',
                    color: filterOpen ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: filterOpen ? 'primary.dark' : '#f5f5f5',
                    },
                  }}
                >
                  <FilterList />
                </Fab>
              </Tooltip>
            </Box>

            {/* Loading overlay */}
            {loading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                justifyContent="center"
                alignItems="center"
                bgcolor="rgba(255, 255, 255, 0.8)"
                zIndex={1000}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        );
      default:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <CircularProgress />
          </Box>
        );
    }
  };

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        flexDirection="column"
        gap={2}
      >
        <Alert severity="warning">
          <Typography variant="h6">Google Maps API Key Required</Typography>
          <Typography variant="body2">
            Please set VITE_GOOGLE_MAPS_API_KEY in your .env file
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render} libraries={['places']} />
  );
};

export default CarparkMap;