// FireUX Configuration Template for all FireUX apps
// This ensures consistent configuration across all tenants
// ✅ PROVEN PATTERN - Based on working misebox-app configuration

export interface TenantConfig {
  tenantModule?: string // Optional - some apps like FireUX don't need a tenant module
  appName?: string // Allow environment variables which can be undefined
  appShortName?: string // Allow environment variables which can be undefined
  primaryColor?: string // Allow environment variables which can be undefined
  neutralColor?: string // Optional neutral color for theming
}

// Direct configuration object for import
export const createFireuxConfig = (config: TenantConfig) => {
  // Build modules array conditionally
  const modules = [
    'fireux-core',
    // Only include jobs module if explicitly specified or if tenant module needs it
    ...(config.tenantModule === 'fireux-jobs' ? ['fireux-jobs'] : []),
    // Include tenant module if specified
    ...(config.tenantModule && config.tenantModule !== 'fireux-jobs'
      ? [config.tenantModule]
      : []),
    '@nuxt/content',
    '@nuxt/ui',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
      },
    ],
    [
      'nuxt-vuefire',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        },
        auth: {
          enabled: true,
          ssr: true,
        },
        admin: {
          serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        },
      },
    ],
  ]

  return {
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

    // App configuration for UI theming - using environment variables with defaults
    appConfig: {
      ui: {
        colors: {
          primary: 'yellow', // Will be enhanced later with color mapping
          neutral: 'gray', // Will be enhanced later with color mapping
        },
      },
    },

    modules,

    nitro: {
      preset: 'firebase',
      firebase: {
        gen: 2,
      },
    },
  } as any
}

// String template generator for backward compatibility
export const createFireuxConfigString = (options: {
  tenantModule: string
  appName: string
  appShortName: string
  primaryColor: string
  neutralColor?: string
  port?: number
}) => {
  return `import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core/config/fireux-config'

export default defineNuxtConfig(createFireuxConfig({
  tenantModule: '${options.tenantModule}',
  appName: '${options.appName}',
  appShortName: '${options.appShortName}',
  primaryColor: '${options.primaryColor}',${
    options.neutralColor
      ? `
  neutralColor: '${options.neutralColor}',`
      : ''
  }
}))`
}
