// Helper function to safely access environment variables - requires all values
const getEnvVar = (key: string): string => {
  // In Vite, import.meta.env variables are injected at build/dev time
  // Access them directly as static strings for proper tree-shaking
  const value = import.meta.env[key as any];
  
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  
  console.error(`Missing required environment variable: ${key}`);
  throw new Error(`Environment variable ${key} is not set or is empty`);
};

// Environment configuration - All values REQUIRED from environment variables
export const config = {
  // API Configuration (REQUIRED)
  apiUrl: getEnvVar('VITE_API_URL'),
  
  // Company Information (REQUIRED)
  company: {
    name: getEnvVar('VITE_COMPANY_NAME'),
    phone: getEnvVar('VITE_COMPANY_PHONE'),
    email: getEnvVar('VITE_COMPANY_EMAIL'),
    address: getEnvVar('VITE_COMPANY_ADDRESS'),
  },
  
  // Social Media Links (REQUIRED)
  social: {
    facebook: getEnvVar('VITE_FACEBOOK_URL'),
    twitter: getEnvVar('VITE_TWITTER_URL'),
    instagram: getEnvVar('VITE_INSTAGRAM_URL'),
    youtube: getEnvVar('VITE_YOUTUBE_URL'),
  },
  
  // Features (REQUIRED - must be true/false in .env)
  features: {
    analytics: getEnvVar('VITE_ENABLE_ANALYTICS') === 'true',
    cookieConsent: getEnvVar('VITE_ENABLE_COOKIE_CONSENT') === 'true',
    darkMode: getEnvVar('VITE_ENABLE_DARK_MODE') === 'true',
  },
  
  // External Services (REQUIRED)
  googleAnalytics: getEnvVar('VITE_GA_TRACKING_ID'),
};

// No warnings - app will fail if env vars are missing, which is the desired behavior
export default config;
