import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  style: React.CSSProperties;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>();

  useEffect(() => {
    if (ref.current && !map && (window as any).google) {
      const newMap = new (window as any).google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      setMap(newMap);

      // Add a marker for current location
      new (window as any).google.maps.Marker({
        position: center,
        map: newMap,
        title: 'Your Location',
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
    }
  }, [ref, map, center, zoom]);

  return <div ref={ref} style={style} />;
};

interface GoogleMapProps {
  height?: string | number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ height = '400px' }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Singapore for demo purposes
          setLocation({ lat: 1.3521, lng: 103.8198 });
          setError('Could not get your location. Showing default location.');
          setLoading(false);
        }
      );
    } else {
      setLocation({ lat: 1.3521, lng: 103.8198 });
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={height}
          >
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
        return location ? (
          <Box height={height} width="100%">
            {error && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            <MapComponent
              center={location}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={height}
          >
            <CircularProgress />
          </Box>
        );
      default:
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={height}
          >
            <CircularProgress />
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
      >
        <CircularProgress />
      </Box>
    );
  }

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

export default GoogleMap;