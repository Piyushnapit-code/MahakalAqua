import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Cookie, Shield, BarChart3, Target, User } from 'lucide-react';
import { useCookieConsent } from '../../contexts/CookieConsentContext';
import type { CookiePreferences } from '../../types';

export default function CookieConsent() {
  const {
    showBanner,
    preferences,
    acceptAll,
    rejectAll,
    updatePreferences,
    hideBanner
  } = useCookieConsent();

  const [showPreferences, setShowPreferences] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences);

  const handleSavePreferences = () => {
    updatePreferences(tempPreferences);
    setShowPreferences(false);
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. Cannot be disabled.',
      icon: Shield,
      required: true
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      icon: BarChart3,
      required: false
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Marketing Cookies',
      description: 'Used to track visitors and display relevant ads.',
      icon: Target,
      required: false
    },
    {
      key: 'preferences' as keyof CookiePreferences,
      title: 'Preference Cookies',
      description: 'Remember your settings and preferences.',
      icon: User,
      required: false
    }
  ];

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 pointer-events-auto"
          onClick={() => !showPreferences && hideBanner()}
        />

        {/* Cookie Banner */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-lg shadow-strong border pointer-events-auto"
        >
          {!showPreferences ? (
            // Main Banner
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <Cookie className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We use cookies
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, 
                    and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  </p>
                </div>
                <button
                  onClick={hideBanner}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="btn-primary btn-sm flex-1"
                >
                  Accept All
                </button>
                <button
                  onClick={rejectAll}
                  className="btn-ghost btn-sm flex-1"
                >
                  Reject All
                </button>
                <button
                  onClick={() => {
                    setTempPreferences(preferences);
                    setShowPreferences(true);
                  }}
                  className="btn-outline btn-sm flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Learn more in our{' '}
                  <a href="/privacy-policy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/cookie-policy" className="text-primary-600 hover:underline">
                    Cookie Policy
                  </a>
                </p>
              </div>
            </div>
          ) : (
            // Preferences Panel
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {cookieTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.key} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {type.title}
                          </h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempPreferences[type.key]}
                              disabled={type.required}
                              onChange={(e) => {
                                if (!type.required) {
                                  setTempPreferences(prev => ({
                                    ...prev,
                                    [type.key]: e.target.checked
                                  }));
                                }
                              }}
                              className="sr-only"
                            />
                            <div className={`
                              w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                              ${tempPreferences[type.key] 
                                ? 'bg-primary-600' 
                                : 'bg-gray-200'
                              }
                              ${type.required ? 'opacity-50 cursor-not-allowed' : ''}
                            `}>
                              <div className={`
                                w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                                ${tempPreferences[type.key] ? 'translate-x-5' : 'translate-x-0'}
                              `} />
                            </div>
                          </label>
                        </div>
                        <p className="text-xs text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSavePreferences}
                  className="btn-primary btn-sm flex-1"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => {
                    setTempPreferences({
                      necessary: true,
                      analytics: true,
                      marketing: true,
                      preferences: true
                    });
                  }}
                  className="btn-outline btn-sm flex-1"
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}