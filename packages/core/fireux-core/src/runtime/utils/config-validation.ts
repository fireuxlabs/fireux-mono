// FireUX Configuration Validation Utility
// This utility helps validate tenant configurations and provides helpful error messages

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface TenantConfig {
  appName: string
  appShortName: string
  primaryColor: string
  tenantModule: string
  environmentVariables: Record<string, string>
}

/**
 * Validates a complete tenant configuration
 */
export function validateTenantConfig(
  config: TenantConfig
): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  }

  // Validate app configuration
  validateAppConfig(config, result)

  // Validate environment variables
  validateEnvironmentVariables(config.environmentVariables, result)

  // Validate color configuration
  validateColorConfig(config.primaryColor, result)

  // Validate module configuration
  validateModuleConfig(config.tenantModule, result)

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Validates app-level configuration
 */
function validateAppConfig(
  config: TenantConfig,
  result: ConfigValidationResult
) {
  if (!config.appName || config.appName.trim().length === 0) {
    result.errors.push('APP_NAME is required')
  }

  if (!config.appShortName || config.appShortName.trim().length === 0) {
    result.errors.push('APP_SHORT_NAME is required')
  } else if (config.appShortName.length > 4) {
    result.warnings.push(
      'APP_SHORT_NAME should be 4 characters or less for optimal display'
    )
  }

  if (config.appName && config.appName.length > 50) {
    result.warnings.push(
      'APP_NAME is quite long - consider shortening for better UX'
    )
  }
}

/**
 * Validates environment variables
 */
function validateEnvironmentVariables(
  envVars: Record<string, string>,
  result: ConfigValidationResult
) {
  const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
  ]

  const requiredClientVars = [
    'NUXT_PUBLIC_FIREBASE_API_KEY',
    'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NUXT_PUBLIC_FIREBASE_APP_ID',
  ]

  // Check required server-side variables
  requiredVars.forEach((varName) => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      result.errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Check required client-side variables
  requiredClientVars.forEach((varName) => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      result.errors.push(
        `Missing required client-side environment variable: ${varName}`
      )
      result.suggestions.push(
        `Add ${varName} with the same value as ${varName.replace('NUXT_PUBLIC_', '')}`
      )
    }
  })

  // Check for service account
  if (!envVars['GOOGLE_APPLICATION_CREDENTIALS']) {
    result.warnings.push(
      'GOOGLE_APPLICATION_CREDENTIALS not set - Firebase admin features may not work'
    )
    result.suggestions.push(
      'Create config/service-account.json and set GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json'
    )
  }

  // Validate Firebase project ID format
  const projectId = envVars['FIREBASE_PROJECT_ID']
  if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
    result.warnings.push(
      'FIREBASE_PROJECT_ID should only contain lowercase letters, numbers, and hyphens'
    )
  }

  // Check for matching client/server variables
  requiredVars.forEach((serverVar) => {
    const clientVar = `NUXT_PUBLIC_${serverVar}`
    if (
      envVars[serverVar] &&
      envVars[clientVar] &&
      envVars[serverVar] !== envVars[clientVar]
    ) {
      result.warnings.push(
        `${serverVar} and ${clientVar} have different values - they should match`
      )
    }
  })
}

/**
 * Validates color configuration
 */
function validateColorConfig(
  primaryColor: string,
  result: ConfigValidationResult
) {
  const validNuxtColors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
  ]

  if (!primaryColor || primaryColor.trim() === '') {
    result.errors.push('Primary color is required')
  } else if (!validNuxtColors.includes(primaryColor)) {
    result.warnings.push(
      `Primary color "${primaryColor}" is not a standard NuxtUI color`
    )
    result.suggestions.push(
      `Consider using one of: ${validNuxtColors.slice(0, 10).join(', ')}, etc.`
    )
  }
}

/**
 * Validates module configuration
 */
function validateModuleConfig(
  tenantModule: string,
  result: ConfigValidationResult
) {
  const validModules = ['fireux-misebox', 'fireux-cleanbox', 'fireux-places']

  if (!tenantModule || tenantModule.trim() === '') {
    result.errors.push('Tenant module is required')
  } else if (
    !validModules.includes(tenantModule) &&
    !tenantModule.startsWith('fireux-')
  ) {
    result.warnings.push(
      `Module "${tenantModule}" is not a known FireUX module`
    )
    result.suggestions.push(
      'Ensure your custom module follows the fireux-* naming convention'
    )
  }
}

/**
 * Gets NuxtUI color hex values
 */
export const NUXT_UI_COLORS = {
  red: 'EF4444',
  orange: 'F97316',
  amber: 'F59E0B',
  yellow: 'EAB308',
  lime: '84CC16',
  green: '22C55E',
  emerald: '10B981',
  teal: '14B8A6',
  cyan: '06B6D4',
  sky: '0EA5E9',
  blue: '3B82F6',
  indigo: '6366F1',
  violet: '8B5CF6',
  purple: 'A855F7',
  fuchsia: 'D946EF',
  pink: 'EC4899',
  rose: 'F43F5E',
  slate: '64748B',
  gray: '6B7280',
  zinc: '71717A',
  neutral: '737373',
  stone: '78716C',
}

/**
 * Converts NuxtUI color name to hex
 */
export function getColorHex(colorName: string): string {
  return NUXT_UI_COLORS[colorName as keyof typeof NUXT_UI_COLORS] || '000000'
}

/**
 * Generates standard nuxt.config.ts template
 */
export function generateNuxtConfig(config: TenantConfig): string {
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
    '${config.tenantModule}',
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
      ssr: true,
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
    admin: {
      serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
  },
})`
}

/**
 * Generates standard .env template
 */
export function generateEnvFile(config: TenantConfig): string {
  const colorHex = getColorHex(config.primaryColor)

  return `# Firebase Configuration (Server-side)
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# Firebase Configuration (Client-side - CRITICAL!)
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
PROJECT_NAME=${config.appName}
DOMAIN=http://localhost:3010
PIN=1234
APP_ID=${config.appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}
APP_NAME=${config.appName}
APP_SHORT_NAME=${config.appShortName}
APP_PRIMARY_COLOR=${colorHex}
APP_NEUTRAL_COLOR=64748B
APP_ICON=your_icon_name
AUTHOR_NAME=Your Team Name

# Optional API Keys
OPENAI_API_KEY_NAME=OPENAI_API_KEY
OPENAI_API_KEY=

# Optional Stripe Configuration
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=`
}

/**
 * Generates app.config.ts template
 */
export function generateAppConfig(config: TenantConfig): string {
  return `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${config.primaryColor}',
      neutral: 'zinc',
    },
  },
})`
}

/**
 * Comprehensive configuration validation for runtime
 */
export function validateRuntimeConfig(): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    result.warnings.push(
      'Runtime validation should be performed in browser context'
    )
    return result
  }

  // Validate client-side Firebase config
  const requiredClientVars = [
    'NUXT_PUBLIC_FIREBASE_API_KEY',
    'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
  ]

  requiredClientVars.forEach((varName) => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      try {
        // Use proper type assertion for Nuxt's global object
        const nuxtApp = (window as any).$nuxt
        const configKey = varName
          .replace('NUXT_PUBLIC_', '')
          .toLowerCase()
          .replace(/_/g, '')
        const value = nuxtApp?.$config?.public?.[configKey]

        if (!value) {
          result.errors.push(`Missing runtime config: ${varName}`)
        }
      } catch (error) {
        // Log error details for debugging
        console.warn('Config validation error:', error)
        result.warnings.push(`Could not validate client config for: ${varName}`)
      }
    }
  })

  result.isValid = result.errors.length === 0
  return result
}
