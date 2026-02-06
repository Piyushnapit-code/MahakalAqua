import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CookiePreferences } from '../types';
import { storage } from '../lib/utils';
import config from '../config/env';

interface CookieConsentContextType {
  hasConsent: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updatePreferences: (preferences: CookiePreferences) => void;
  showPreferences: () => void;
  hideBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  preferences: false,
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);

  // Check for existing consent on mount
  useEffect(() => {
    const savedConsent = storage.get<boolean>('cookieConsent');
    const savedPreferences = storage.get<CookiePreferences>('cookiePreferences');

    if (savedConsent && savedPreferences) {
      setHasConsent(true);
      setPreferences(savedPreferences);
      setShowBanner(false);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Apply preferences (enable/disable tracking scripts)
  const applyPreferences = useCallback((prefs: CookiePreferences) => {
    // Analytics (Google Analytics, etc.)
    if (prefs.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }

    // Marketing (Facebook Pixel, Google Ads, etc.)
    if (prefs.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }

    // Preferences (theme, language, etc.)
    if (prefs.preferences) {
      enablePreferenceCookies();
    } else {
      disablePreferenceCookies();
    }
  }, []);

  useEffect(() => {
    if (hasConsent) {
      applyPreferences(preferences);
    }
  }, [hasConsent, preferences, applyPreferences]);

  

  const enableAnalytics = () => {
    // Enable Google Analytics
    if (config.googleAnalytics) {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', config.googleAnalytics);
      
      // Make gtag available globally
      (window as any).gtag = gtag;
    }
  };

  const disableAnalytics = () => {
    // Disable Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', config.googleAnalytics, {
        send_page_view: false,
      });
    }
  };

  const enableMarketing = () => {
    // Enable marketing cookies/scripts
    console.log('Marketing cookies enabled');
  };

  const disableMarketing = () => {
    // Disable marketing cookies/scripts
    console.log('Marketing cookies disabled');
  };

  const enablePreferenceCookies = () => {
    // Enable preference cookies
    console.log('Preference cookies enabled');
  };

  const disablePreferenceCookies = () => {
    // Disable preference cookies (but keep necessary ones)
    console.log('Preference cookies disabled');
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    setPreferences(allAccepted);
    setHasConsent(true);
    setShowBanner(false);
    
    // Save to storage
    storage.set('cookieConsent', true);
    storage.set('cookiePreferences', allAccepted);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    setPreferences(onlyNecessary);
    setHasConsent(true);
    setShowBanner(false);
    
    // Save to storage
    storage.set('cookieConsent', true);
    storage.set('cookiePreferences', onlyNecessary);
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    // Ensure necessary cookies are always enabled
    const updatedPreferences = {
      ...newPreferences,
      necessary: true,
    };
    
    setPreferences(updatedPreferences);
    setHasConsent(true);
    setShowBanner(false);
    
    // Save to storage
    storage.set('cookieConsent', true);
    storage.set('cookiePreferences', updatedPreferences);
  };

  const showPreferences = () => {
    setShowBanner(true);
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  const value: CookieConsentContextType = {
    hasConsent,
    preferences,
    showBanner,
    acceptAll,
    rejectAll,
    updatePreferences,
    showPreferences,
    hideBanner,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}