import React, { useState, useEffect } from 'react';
import { useVisitorTracking } from '../contexts/VisitorTrackingContext';
import LocationPermissionPrompt from './LocationPermissionPrompt';
import PhoneNumberModal from './PhoneNumberModal';
import type { ContactData } from '../lib/visitorTracking';

interface VisitorTrackingManagerProps {
  // Trigger phone collection after this many minutes on site (default: 5)
  phoneTriggerMinutes?: number;
  // Show phone modal on specific pages
  phoneTriggerPages?: string[];
}

const VisitorTrackingManager: React.FC<VisitorTrackingManagerProps> = ({
  phoneTriggerMinutes = 5,
  phoneTriggerPages = ['/contact', '/enquiry']
}) => {
  const {
    session,
    isLocationPermissionRequested,
    isPhoneNumberCollected,
    requestLocationPermission,
    updateContact
  } = useVisitorTracking();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [timeOnSite, setTimeOnSite] = useState(0);

  // Track time on site
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnSite(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Check if we should show location prompt - show immediately on first visit
  useEffect(() => {
    if (!session?.cookieConsent || isLocationPermissionRequested || showLocationPrompt) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLocationPrompt(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    session?.cookieConsent,
    isLocationPermissionRequested,
    showLocationPrompt
  ]);

  // Check if we should show phone modal
  useEffect(() => {
    if (!session?.cookieConsent || isPhoneNumberCollected || showPhoneModal) {
      return;
    }

    const currentPath = window.location.pathname;
    const shouldShowByTime = timeOnSite >= phoneTriggerMinutes;
    const shouldShowByPage = phoneTriggerPages.includes(currentPath);

    if (shouldShowByTime || shouldShowByPage) {
      // Add a delay and only show if location prompt is not showing
      const timer = setTimeout(() => {
        if (!showLocationPrompt) {
          setShowPhoneModal(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [
    session?.cookieConsent,
    isPhoneNumberCollected,
    timeOnSite,
    phoneTriggerMinutes,
    phoneTriggerPages,
    showPhoneModal,
    showLocationPrompt
  ]);

  const handleLocationAllow = async (): Promise<boolean> => {
    try {
      const success = await requestLocationPermission();
      return success;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const handleLocationDeny = () => {
    // Location was denied, maybe show phone modal after a delay
    if (!isPhoneNumberCollected && !showPhoneModal) {
      setTimeout(() => {
        setShowPhoneModal(true);
      }, 5000);
    }
  };

  const handlePhoneSubmit = async (contactData: ContactData) => {
    try {
      await updateContact(contactData);
      setShowPhoneModal(false);
    } catch (error) {
      console.error('Error submitting contact data:', error);
    }
  };

  const handlePhoneClose = () => {
    setShowPhoneModal(false);
  };

  return (
    <>
      <LocationPermissionPrompt
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
      />
      
      <PhoneNumberModal
        isOpen={showPhoneModal}
        onClose={handlePhoneClose}
        onSubmit={handlePhoneSubmit}
        title="Stay Connected with Mahakal Aqua"
        description="Get updates about our water purification services and special offers. We'll only contact you for important service updates."
      />
    </>
  );
};

export default VisitorTrackingManager;