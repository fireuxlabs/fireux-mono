// FireUX Configuration Template for all FireUX apps
// This ensures consistent configuration across all tenants
// ✅ PROVEN PATTERN - Based on working misebox-app configuration

export interface TenantConfig {
  modules?: string[] // Array of modules to include, e.g., ['fireux-jobs', 'fireux-misebox']
  ecosystem?: string // Business ecosystem (e.g., 'misebox', 'cleanbox')
  appName?: string // Allow environment variables which can be undefined
  appShortName?: string // Allow environment variables which can be undefined
  primaryColor?: string // Allow environment variables which can be undefined
  neutralColor?: string // Optional neutral color for theming
  // Optional extended fields; if omitted we derive from env or sensible defaults
  appId?: string
  projectName?: string
  domain?: string
  appIcon?: string
}

export const createFireuxConfig = (config: TenantConfig) => {
  // Resolve app settings with fallbacks from env or sensible defaults
  const ecosystem = config.ecosystem || process.env.APP_ECOSYSTEM || 'fireux'
  const appName = config.appName || process.env.APP_NAME || 'FireUX'
  const appShortName =
    config.appShortName || process.env.APP_SHORT_NAME || appName
  const appPrimaryColor =
    config.primaryColor || process.env.APP_PRIMARY_COLOR || '#111827'
  const appNeutralColor =
    config.neutralColor || process.env.APP_NEUTRAL_COLOR || '#9CA3AF'
  const projectName =
    config.projectName || process.env.PROJECT_NAME || appName || 'FireUX'
  const appId =
    config.appId ||
    process.env.APP_ID ||
    `${
      String(ecosystem)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '') || 'fireux'
    }-app`
  const appIcon = config.appIcon || process.env.APP_ICON || '/icon.png'
  const domain = config.domain || process.env.APP_DOMAIN || 'localhost'
  const nodeEnv = process.env.NODE_ENV || 'development'

  // Build modules array with core and optional modules
  const modules = [
    'fireux-core',
    // Include additional modules if specified
    ...(config.modules || []),
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

  // Ensure all required arrays are properly initialized
  const baseConfig = {
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

    // Ensure components array is initialized
    components: [],

    // Ensure plugins array is initialized
    plugins: [],

    // Ensure css array is initialized
    css: [],

    // Simple: just pass ecosystem in runtimeConfig
    runtimeConfig: {
      public: {
        ecosystem,
        modules: config.modules || [],
        devMode: nodeEnv !== 'production',
        // Public Firebase client config (safe to expose)
        firebaseConfig: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        },
        // Provide appSettings for runtime composables like useFireUXConfig
        appSettings: {
          projectName,
          appName,
          appId,
          nodeEnv,
          appShortName,
          appPrimaryColor,
          appNeutralColor,
          appIcon,
          domain,
        },
      },
    },

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

    // Ensure typescript config has properly initialized arrays
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {},
        },
      },
    },
  }

  return baseConfig as any
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
