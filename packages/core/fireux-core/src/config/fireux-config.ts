// FireUX Configuration Template for all FireUX apps
// This ensures consistent configuration across all tenants
// ✅ PROVEN PATTERN - Based on working misebox-app configuration

export interface TenantConfig {
  tenantModule: string
  appName: string
  appShortName: string
  primaryColor: string
  secondaryColor?: string // Optional secondary color for theming
}

// Direct configuration object for import
export const createFireuxConfig = (config: TenantConfig) =>
  ({
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
      config.tenantModule,
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
    ] as any,

    nitro: {
      preset: 'firebase',
      firebase: {
        gen: 2,
      },
    },
  }) as any

// String template generator for backward compatibility
export const createFireuxConfigString = (options: {
  tenantModule: string
  appName: string
  appShortName: string
  primaryColor: string
  secondaryColor?: string
  port?: number
}) => {
  return `import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core/config/fireux-config'

export default defineNuxtConfig(createFireuxConfig({
  tenantModule: '${options.tenantModule}',
  appName: '${options.appName}',
  appShortName: '${options.appShortName}',
  primaryColor: '${options.primaryColor}',${
    options.secondaryColor
      ? `
  secondaryColor: '${options.secondaryColor}',`
      : ''
  }
}))`
}
