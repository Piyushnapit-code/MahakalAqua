import { api } from './api';

export interface LocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
}

export interface ContactData {
  phoneNumber: string;
  name?: string;
  email?: string;
  countryCode?: string;
  consentGiven?: boolean;
}

export interface VisitorSession {
  hasSession: boolean;
  visitId: string | null;
  cookieConsent: boolean;
  sessionId: string;
}

class VisitorTrackingService {
  private locationPermissionRequested = false;
  private phoneNumberCollected = false;



  // Get current visitor session
  async getSession(): Promise<VisitorSession> {
    try {
      const response = await api.get('/visitor/session');
      return response.data;
    } catch (error) {
      console.error('Error getting visitor session:', error);
      return {
        hasSession: false,
        visitId: null,
        cookieConsent: false,
        sessionId: ''
      };
    }
  }

  // Request location permission and get coordinates
  async requestLocationPermission(): Promise<boolean> {
    // Check if already requested
    if (this.locationPermissionRequested) {
      return false;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      this.locationPermissionRequested = true;
      localStorage.setItem('locationPermissionRequested', 'true');
      localStorage.setItem('locationPermissionStatus', 'unsupported');
      return false;
    }

    try {
      // First check permission state if available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          console.warn('Location permission is denied');
          this.locationPermissionRequested = true;
          localStorage.setItem('locationPermissionRequested', 'true');
          localStorage.setItem('locationPermissionStatus', 'denied');
          return false;
        }
      }

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          console.warn('Location request timed out');
          this.locationPermissionRequested = true;
          localStorage.setItem('locationPermissionRequested', 'true');
          localStorage.setItem('locationPermissionStatus', 'timeout');
          resolve(false);
        }, 15000); // 15 second timeout

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            clearTimeout(timeoutId);
            try {
              const locationData: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              };

              // Try to get address from coordinates using reverse geocoding
              await this.reverseGeocode(locationData);

              // Send location data to backend
              const success = await this.updateLocation(locationData);
              this.locationPermissionRequested = true;
              localStorage.setItem('locationPermissionRequested', 'true');
              localStorage.setItem('locationPermissionStatus', success ? 'granted' : 'error');
              
              if (success) {
                localStorage.setItem('lastLocationUpdate', Date.now().toString());
                localStorage.setItem('lastLocationData', JSON.stringify(locationData));
              }
              
              resolve(success);
            } catch (error) {
              console.error('Error processing location:', error);
              this.locationPermissionRequested = true;
              localStorage.setItem('locationPermissionRequested', 'true');
              localStorage.setItem('locationPermissionStatus', 'error');
              resolve(false);
            }
          },
          (error) => {
            clearTimeout(timeoutId);
            let errorMessage = 'Location permission denied or error';
            let status = 'error';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied by user';
                status = 'denied';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                status = 'unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                status = 'timeout';
                break;
              default:
                errorMessage = `Location error: ${error.message}`;
                break;
            }
            
            console.warn(errorMessage);
            this.locationPermissionRequested = true;
            localStorage.setItem('locationPermissionRequested', 'true');
            localStorage.setItem('locationPermissionStatus', status);
            localStorage.setItem('locationPermissionError', errorMessage);
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });
    } catch (error) {
      console.error('Error requesting location permission:', error);
      this.locationPermissionRequested = true;
      localStorage.setItem('locationPermissionRequested', 'true');
      localStorage.setItem('locationPermissionStatus', 'error');
      return false;
    }
  }

  // Reverse geocode coordinates to get address
  private async reverseGeocode(locationData: LocationData): Promise<void> {
    if (!locationData.latitude || !locationData.longitude) return;

    try {
      // Using a free geocoding service (you might want to use a more reliable one)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${locationData.latitude}&longitude=${locationData.longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        locationData.address = data.locality || data.city || '';
        locationData.city = data.city || data.locality || '';
        locationData.state = data.principalSubdivision || '';
        locationData.country = data.countryName || '';
      }
    } catch (error) {
      console.warn('Could not reverse geocode location:', error);
    }
  }

  // Update visitor location
  async updateLocation(locationData: LocationData): Promise<boolean> {
    try {
      const response = await api.post('/visitor/location', locationData);
      return response.data.success;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  }

  // Update visitor contact information
  async updateContact(contactData: ContactData): Promise<boolean> {
    try {
      const response = await api.post('/visitor/contact', contactData);
      this.phoneNumberCollected = true;
      localStorage.setItem('phoneNumberCollected', 'true');
      return response.data.success;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  }

  // Handle cookie consent
  async handleCookieConsent(consent: boolean): Promise<void> {
    try {
      // Store consent in localStorage with timestamp
      localStorage.setItem('cookieConsent', consent.toString());
      localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
      
      // Also set a cookie for server-side access (expires in 1 year)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      document.cookie = `cookieConsent=${consent}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
      
      // Send consent to backend - create the visit record
      try {
        const response = await api.post('/visitor/track', { 
          consent,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          language: navigator.language,
          path: window.location.pathname,
          referrer: document.referrer || 'direct'
        });
        
        // Store visit ID if successful
        if (response.data && response.data.visitId) {
          localStorage.setItem('visitorSessionId', response.data.visitId);
        }
      } catch (error) {
        console.error('Error sending consent to backend:', error);
        // Continue even if backend fails
      }
      
      if (consent) {
        // Initialize tracking if consent is given
        await this.initialize();
      } else {
        // Clear any existing tracking data if consent is declined
        localStorage.removeItem('visitorSessionId');
        localStorage.removeItem('locationPermissionRequested');
        localStorage.removeItem('phoneNumberCollected');
        localStorage.removeItem('lastLocationUpdate');
      }
    } catch (error) {
      console.error('Error handling cookie consent:', error);
    }
  }

  // Show phone number collection modal
  async showPhoneNumberModal(): Promise<ContactData | null> {
    // This method is now handled by the PhoneNumberModal component
    // The actual modal logic is in the VisitorTrackingManager
    return Promise.resolve(null);
  }

  // Initialize visitor tracking
  async initialize(): Promise<void> {
    try {
      // Fast path: if local cookie consent isn't granted, skip initialization
      const localCookieConsent = localStorage.getItem('cookieConsent') === 'true';
      if (!localCookieConsent) {
        return;
      }

      const session = await this.getSession();
      
      if (!session.hasSession || !session.cookieConsent) {
        return;
      }

      // Restore state from localStorage
      const locationPermissionRequested = localStorage.getItem('locationPermissionRequested') === 'true';
      const phoneNumberCollected = localStorage.getItem('phoneNumberCollected') === 'true';
      const locationPermissionStatus = localStorage.getItem('locationPermissionStatus');
      const lastLocationUpdate = localStorage.getItem('lastLocationUpdate');
      
      this.locationPermissionRequested = locationPermissionRequested;
      this.phoneNumberCollected = phoneNumberCollected;

      // Check if we need to update location (if it's been more than 1 hour)
      const shouldUpdateLocation = !lastLocationUpdate || 
        (Date.now() - parseInt(lastLocationUpdate)) > 3600000; // 1 hour

      // Only request location permission if not already requested and no error stored
      if (!locationPermissionRequested && 
          locationPermissionStatus !== 'denied' && 
          locationPermissionStatus !== 'error' &&
          locationPermissionStatus !== 'unsupported') {
        setTimeout(() => {
          this.requestLocationPermission();
        }, 2000);
      } else if (locationPermissionStatus === 'granted' && shouldUpdateLocation) {
        // If permission was granted before, try to get location again
        setTimeout(() => {
          this.requestLocationPermission();
        }, 1000);
      }

      // Show phone number modal after some time if not collected
      if (!phoneNumberCollected) {
        setTimeout(async () => {
          if (!this.phoneNumberCollected) {
            const contactData = await this.showPhoneNumberModal();
            if (contactData) {
              await this.updateContact(contactData);
              localStorage.setItem('phoneNumberCollected', 'true');
            }
          }
        }, 10000); // Show after 10 seconds
      }

    } catch (error) {
      console.error('Error initializing visitor tracking:', error);
    }
  }

  // Check if location permission was already requested
  isLocationPermissionRequested(): boolean {
    return this.locationPermissionRequested;
  }

  // Check if phone number was already collected
  isPhoneNumberCollected(): boolean {
    return this.phoneNumberCollected;
  }
}

export const visitorTracking = new VisitorTrackingService();