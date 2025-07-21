// Shared Nuxt configuration template for all FireUX apps
// This ensures consistent configuration across all tenants
export const createStandardNuxtConfig = (options: {
  tenantModule: string
  appName: string
  appShortName: string
  primaryColor: string
  port?: number
}) => {
  return `import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  imports: {
    dirs: ['composables/**', 'models/**', 'utils/**'],
  },
  
  // Explicitly configure SSR for consistency
  ssr: true,
  
  modules: [
    'fireux-core',
    'fireux-jobs',
    '${options.tenantModule}',
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-vuefire',
  ],
  
  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
    },
  },
  
  vuefire: {
    auth: {
      enabled: true,
    },
    config: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
    },
  },
  
  runtimeConfig: {
    // Server-side runtime config
    firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
      /\\\\n/g,
      '\\n'
    ),
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    
    // Client-side runtime config (exposed to frontend)
    public: {
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      appName: '${options.appName}',
      appShortName: '${options.appShortName}',
      primaryColor: '${options.primaryColor}',
    },
  },
})`
}
