import React, { useState, useEffect } from 'react';
import { visitorTracking } from '../lib/visitorTracking';

interface CookieConsentBannerProps {
  onConsentChange?: (consent: boolean) => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const checkConsent = async () => {
      try {
        // Prefer localStorage to avoid re-asking if already accepted
        const localConsent = localStorage.getItem('cookieConsent');

        if (localConsent === 'true') {
          // Already accepted locally; do not show banner again
          setShowBanner(false);
          return;
        }

        if (localConsent === null) {
          // No local consent stored; optionally confirm with backend
          const session = await visitorTracking.getSession();
          if (!session.cookieConsent) {
            setShowBanner(true);
          }
          return;
        }

        // localConsent === 'false' → allow banner to show to let user change mind
        setShowBanner(true);
      } catch (error) {
        console.error('Error checking cookie consent:', error);
        // On errors, only show if there's no record of acceptance
        const localConsent = localStorage.getItem('cookieConsent');
        setShowBanner(localConsent === null || localConsent === 'false');
      }
    };

    checkConsent();
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await visitorTracking.handleCookieConsent(true);
      setShowBanner(false);
      onConsentChange?.(true);
    } catch (error) {
      console.error('Error accepting cookies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await visitorTracking.handleCookieConsent(false);
      setShowBanner(false);
      onConsentChange?.(false);
    } catch (error) {
      console.error('Error declining cookies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
          <p className="text-sm text-gray-300">
            We use cookies and collect location data to improve your experience and provide better services. 
            This helps us understand visitor patterns and contact you if needed for support.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Decline'}
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Accept All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;