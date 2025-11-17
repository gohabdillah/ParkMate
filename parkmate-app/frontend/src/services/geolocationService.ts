import { UserLocation } from '../features/carpark/carparkTypes';

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class GeolocationError extends Error {
  constructor(
    message: string,
    public code: number,
    public originalError?: GeolocationPositionError
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

class GeolocationService {
  private readonly defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 300000, // 5 minutes
  };

  /**
   * Get user's current location
   */
  getCurrentLocation(options?: GeolocationOptions): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new GeolocationError('Geolocation is not supported by this browser', 0));
        return;
      }

      const opts = { ...this.defaultOptions, ...options };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(location);
        },
        (error) => {
          let message: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
            default:
              message = 'An unknown error occurred while retrieving location';
              break;
          }
          reject(new GeolocationError(message, error.code, error));
        },
        opts
      );
    });
  }

  /**
   * Watch user's location for changes
   */
  watchLocation(
    callback: (location: UserLocation) => void,
    errorCallback?: (error: GeolocationError) => void,
    options?: GeolocationOptions
  ): number {
    if (!navigator.geolocation) {
      const error = new GeolocationError('Geolocation is not supported by this browser', 0);
      errorCallback?.(error);
      return -1;
    }

    const opts = { ...this.defaultOptions, ...options };

    return navigator.geolocation.watchPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        callback(location);
      },
      (error) => {
        let message: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
          default:
            message = 'An unknown error occurred while retrieving location';
            break;
        }
        errorCallback?.(new GeolocationError(message, error.code, error));
      },
      opts
    );
  }

  /**
   * Stop watching location
   */
  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request location permission (for browsers that support it)
   */
  async requestPermission(): Promise<PermissionState> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.warn('Unable to query geolocation permission:', error);
      }
    }
    return 'prompt';
  }
}

export const geolocationService = new GeolocationService();