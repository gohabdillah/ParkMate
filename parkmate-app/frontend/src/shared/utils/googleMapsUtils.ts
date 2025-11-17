/**
 * Google Maps Navigation Utilities
 */

export interface NavigationOptions {
  latitude: number;
  longitude: number;
  destinationName?: string;
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

/**
 * Opens Google Maps with directions to the specified destination
 * Works on all devices - opens native app on mobile, web on desktop
 */
export const openGoogleMapsDirections = ({
  latitude,
  longitude,
  destinationName,
  travelMode = 'driving',
}: NavigationOptions): void => {
  // Build the Google Maps URL with directions
  const params = new URLSearchParams({
    api: '1',
    destination: `${latitude},${longitude}`,
    travelmode: travelMode,
  });

  // Add destination name if provided (makes it more user-friendly)
  if (destinationName) {
    params.append('destination_place_id', destinationName);
  }

  const url = `https://www.google.com/maps/dir/?${params.toString()}`;

  // Open in new tab/window (will open native app on mobile)
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Opens Google Maps centered on a specific location
 */
export const openGoogleMapsLocation = (
  latitude: number,
  longitude: number,
  zoom: number = 15
): void => {
  const url = `https://www.google.com/maps/@${latitude},${longitude},${zoom}z`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Opens Google Maps search for a specific place
 */
export const openGoogleMapsSearch = (query: string): void => {
  const params = new URLSearchParams({
    api: '1',
    query,
  });
  const url = `https://www.google.com/maps/search/?${params.toString()}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
