import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { visitorTracking } from '../lib/visitorTracking';
import type { LocationData, ContactData, VisitorSession } from '../lib/visitorTracking';

interface VisitorTrackingContextType {
  session: VisitorSession | null;
  isLocationPermissionRequested: boolean;
  isPhoneNumberCollected: boolean;
  requestLocationPermission: () => Promise<boolean>;
  showPhoneNumberModal: () => Promise<ContactData | null>;
  updateLocation: (locationData: LocationData) => Promise<boolean>;
  updateContact: (contactData: ContactData) => Promise<boolean>;
}

const VisitorTrackingContext = createContext<VisitorTrackingContextType | undefined>(undefined);

interface VisitorTrackingProviderProps {
  children: ReactNode;
}

export const VisitorTrackingProvider: React.FC<VisitorTrackingProviderProps> = ({ children }) => {
  const [session, setSession] = useState<VisitorSession | null>(null);
  const [isLocationPermissionRequested, setIsLocationPermissionRequested] = useState(false);
  const [isPhoneNumberCollected, setIsPhoneNumberCollected] = useState(false);

  useEffect(() => {
    // Initialize visitor tracking when component mounts
    const initializeTracking = async () => {
      try {
        // Get current session
        const currentSession = await visitorTracking.getSession();
        setSession(currentSession);

        // Initialize tracking if session exists and cookies are accepted
        if (currentSession.hasSession && currentSession.cookieConsent) {
          await visitorTracking.initialize();
          setIsLocationPermissionRequested(visitorTracking.isLocationPermissionRequested());
          setIsPhoneNumberCollected(visitorTracking.isPhoneNumberCollected());
        }
      } catch (error) {
        console.error('Error initializing visitor tracking:', error);
      }
    };

    initializeTracking();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const success = await visitorTracking.requestLocationPermission();
      setIsLocationPermissionRequested(true);
      return success;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const showPhoneNumberModal = async (): Promise<ContactData | null> => {
    try {
      const contactData = await visitorTracking.showPhoneNumberModal();
      if (contactData) {
        setIsPhoneNumberCollected(true);
      }
      return contactData;
    } catch (error) {
      console.error('Error showing phone number modal:', error);
      return null;
    }
  };

  const updateLocation = async (locationData: LocationData): Promise<boolean> => {
    try {
      return await visitorTracking.updateLocation(locationData);
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  };

  const updateContact = async (contactData: ContactData): Promise<boolean> => {
    try {
      const success = await visitorTracking.updateContact(contactData);
      if (success) {
        setIsPhoneNumberCollected(true);
      }
      return success;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  };

  const value: VisitorTrackingContextType = {
    session,
    isLocationPermissionRequested,
    isPhoneNumberCollected,
    requestLocationPermission,
    showPhoneNumberModal,
    updateLocation,
    updateContact,
  };

  return (
    <VisitorTrackingContext.Provider value={value}>
      {children}
    </VisitorTrackingContext.Provider>
  );
};

export const useVisitorTracking = (): VisitorTrackingContextType => {
  const context = useContext(VisitorTrackingContext);
  if (context === undefined) {
    throw new Error('useVisitorTracking must be used within a VisitorTrackingProvider');
  }
  return context;
};

export default VisitorTrackingContext;