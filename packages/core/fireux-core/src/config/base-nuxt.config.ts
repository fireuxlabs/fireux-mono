// Base Nuxt configuration shared across all FireUX apps
export const createBaseNuxtConfig = (appConfig: {
  appName: string
  appShortName: string
  primaryColor: string
  modules: string[]
  port: number
}) => ({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  imports: {
    dirs: ['composables/**', 'models/**', 'utils/**'],
  },
  css: [
    // Assets are now automatically included by fireux-core module
  ],
  
  // Server-side rendering configuration
  ssr: true,
  
  modules: [
    'fireux-core',
    'fireux-jobs',
    ...appConfig.modules,
    '@nuxt/content',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        manifest: {
          name: process.env.APP_NAME || appConfig.appName,
          short_name: process.env.APP_SHORT_NAME || appConfig.appShortName,
          start_url: '/',
          display: 'standalone',
          theme_color: process.env.APP_PRIMARY_COLOR
            ? `#${process.env.APP_PRIMARY_COLOR}`
            : appConfig.primaryColor,
          background_color: '#ffffff',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        client: {
          installPrompt: true,
        },
        devOptions: {
          enabled: true,
          suppressWarnings: true,
          navigateFallback: '/',
          navigateFallbackAllowlist: [/^\/$/],
          type: 'module',
        },
      },
    ],
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    'nuxt-vuefire',
    '@pinia/nuxt',
  ],
  
  runtimeConfig: {
    // Server-side runtime config
    firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n'
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
      appName: appConfig.appName,
      appShortName: appConfig.appShortName,
      primaryColor: appConfig.primaryColor,
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
  
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
  
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
  },
})
