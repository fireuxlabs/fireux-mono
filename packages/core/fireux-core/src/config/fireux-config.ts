// FireUX Configuration Template for all FireUX apps
// This ensures consistent configuration across all tenants
// ✅ PROVEN PATTERN - Based on working misebox-app configuration

export interface TenantConfig {
  modules?: string[] // Array of modules to include, e.g., ['fireux-jobs', 'fireux-misebox']
  appName?: string // Allow environment variables which can be undefined
  appShortName?: string // Allow environment variables which can be undefined
  primaryColor?: string // Allow environment variables which can be undefined
  neutralColor?: string // Optional neutral color for theming
}

// Direct configuration object for import
export const createFireuxConfig = (config: TenantConfig) => {
  // Build modules array with core and optional modules
  const modules = [
    'fireux-core',
    // Include additional modules if specified
    ...(config.modules || []),
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

    modules,

    nitro: {
      preset: 'firebase',
      firebase: {
        gen: 2,
      },
      ignore: [
        // Exclude development pages from production builds
        ...(process.env.NODE_ENV === 'production' ? ['**/pages/dev/**'] : []),
        // Exclude documentation files (already established pattern)
        '**/*.doc.*',
      ],
    },
  } as any
}

// String template generator for backward compatibility
export const createFireuxConfigString = (options: {
  modules?: string[]
  appName: string
  appShortName: string
  primaryColor: string
  neutralColor?: string
  port?: number
}) => {
  const modulesString = options.modules
    ? `
  modules: [${options.modules.map((m) => "'" + m + "'").join(', ')}],`
    : ''

  return `import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core/config/fireux-config'

export default defineNuxtConfig(createFireuxConfig({${modulesString}
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
