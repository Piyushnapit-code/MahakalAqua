import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Cookie, Shield, CheckCircle, Info } from 'lucide-react';
import { visitorTracking } from '../lib/visitorTracking';

interface ConsentFlowManagerProps {
  onComplete?: () => void;
}

type ConsentStep = 'cookie' | 'location' | 'completed';

const ConsentFlowManager: React.FC<ConsentFlowManagerProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<ConsentStep>('cookie');
  const [showFlow, setShowFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    try {
      // Prefer local state to avoid unnecessary prompts
      const localCookieConsent = localStorage.getItem('cookieConsent') === 'true';
      const locationPermissionRequested = localStorage.getItem('locationPermissionRequested') === 'true';
      const locationPermissionStatus = localStorage.getItem('locationPermissionStatus');

      // If user already accepted cookies and handled location (requested or finalized), skip flow entirely
      if (
        localCookieConsent &&
        (locationPermissionRequested ||
          locationPermissionStatus === 'granted' ||
          locationPermissionStatus === 'denied' ||
          locationPermissionStatus === 'unsupported' ||
          locationPermissionStatus === 'timeout')
      ) {
        setCurrentStep('completed');
        setShowFlow(false);
        return;
      }

      // If no cookie consent locally, show cookie step (don't block on backend)
      if (!localCookieConsent) {
        setCurrentStep('cookie');
        setShowFlow(true);
        return;
      }

      // Cookie consent exists but location not yet requested → show location step
      if (localCookieConsent && !locationPermissionRequested) {
        setCookieConsent(true);
        // Only show if previous status isn't a hard-stop
        if (
          locationPermissionStatus !== 'denied' &&
          locationPermissionStatus !== 'unsupported' &&
          locationPermissionStatus !== 'error'
        ) {
          setCurrentStep('location');
          setShowFlow(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
      // On error, show the flow to be safe
      setShowFlow(true);
    }
  };

  const handleCookieConsent = async (consent: boolean) => {
    setIsLoading(true);
    try {
      await visitorTracking.handleCookieConsent(consent);
      setCookieConsent(consent);
      
      if (consent) {
        // If cookies accepted, move to location permission
        setCurrentStep('location');
      } else {
        // If cookies declined, complete the flow
        setCurrentStep('completed');
        setTimeout(() => {
          setShowFlow(false);
          onComplete?.();
        }, 1500);
      }
    } catch (error) {
      console.error('Error handling cookie consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationPermission = async (grant: boolean) => {
    setIsLoading(true);
    try {
      if (grant) {
        const success = await visitorTracking.requestLocationPermission();
        setLocationPermission(success);
      } else {
        // Mark as requested even if declined
        localStorage.setItem('locationPermissionRequested', 'true');
        setLocationPermission(false);
      }
      
      setCurrentStep('completed');
      setTimeout(() => {
        setShowFlow(false);
        onComplete?.();
      }, 1500);
    } catch (error) {
      console.error('Error handling location permission:', error);
      setLocationPermission(false);
      setCurrentStep('completed');
      setTimeout(() => {
        setShowFlow(false);
        onComplete?.();
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipLocation = () => {
    localStorage.setItem('locationPermissionRequested', 'true');
    setLocationPermission(false);
    setCurrentStep('completed');
    setTimeout(() => {
      setShowFlow(false);
      onComplete?.();
    }, 1500);
  };

  if (!showFlow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
        >
          {/* Cookie Consent Step */}
          {currentStep === 'cookie' && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to MahakalAqua
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We use cookies to enhance your experience and provide personalized services. 
                Your privacy is important to us.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">What we collect:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Essential cookies for site functionality</li>
                      <li>Analytics to improve our services</li>
                      <li>Preferences to remember your settings</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCookieConsent(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleCookieConsent(true)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Accept All'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Location Permission Step */}
          {currentStep === 'location' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Location Permission
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Allow us to access your location to provide better local services and 
                personalized recommendations.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium mb-1">Why we need this:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Show nearby service centers</li>
                      <li>Provide accurate delivery estimates</li>
                      <li>Offer location-based support</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSkipLocation}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleLocationPermission(true)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Allow Location'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Completion Step */}
          {currentStep === 'completed' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                All Set!
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Thank you for your preferences. You can change these settings anytime in your account.
              </p>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>✓ Cookie preferences: {cookieConsent ? 'Accepted' : 'Declined'}</p>
                <p>✓ Location access: {locationPermission ? 'Granted' : 'Skipped'}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConsentFlowManager;