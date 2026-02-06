/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_COMPANY_NAME: string
  readonly VITE_COMPANY_PHONE: string
  readonly VITE_COMPANY_EMAIL: string
  readonly VITE_COMPANY_ADDRESS: string
  readonly VITE_FACEBOOK_URL: string
  readonly VITE_TWITTER_URL: string
  readonly VITE_INSTAGRAM_URL: string
  readonly VITE_YOUTUBE_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_COOKIE_CONSENT: string
  readonly VITE_ENABLE_DARK_MODE: string
  readonly VITE_GA_TRACKING_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}