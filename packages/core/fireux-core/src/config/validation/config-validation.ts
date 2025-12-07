import { DEFAULT_COMPATIBILITY_DATE } from '../fireux/tenant-context'

// FireUX Configuration Validation Utility
// This utility helps validate tenant configurations and provides helpful error messages.
// It mirrors the current TenantConfig shape (modules[], includeCore?, role required).

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

import { DEFAULT_COMPATIBILITY_DATE } from '../fireux/tenant-context'

// Use a distinct name to avoid clashes with factory's TenantConfig
export interface ValidationTenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  modules?: string[]
  includeCore?: boolean
  primaryColor: string
  neutralColor?: string
  secondaryColor?: string
  compatibilityDate?: string
  environmentVariables: Record<string, string>
}

/**
 * Validates a complete tenant configuration
 */
export function validateTenantConfig(
  config: ValidationTenantConfig
): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  }

  // Validate required identifiers
  validateAppConfig(config, result)

  // Validate environment variables
  validateEnvironmentVariables(config.environmentVariables, result)

  // Validate color configuration (primary required)
  validateColorConfig(config.primaryColor, result)
  if (config.neutralColor) {
    validateColorConfig(config.neutralColor, result, 'Neutral color', false)
  }
  if (config.secondaryColor) {
    validateColorConfig(config.secondaryColor, result, 'Secondary color', false)
  }

  // Validate module configuration
  validateModules(config.modules, config.includeCore, result)

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Validates app-level configuration
 */
function validateAppConfig(
  config: ValidationTenantConfig,
  result: ConfigValidationResult
) {
  if (!config.ecosystem || config.ecosystem.trim().length === 0) {
    result.errors.push('ecosystem is required')
  }

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

  if (!config.role || (config.role !== 'global' && config.role !== 'tenant')) {
    result.errors.push('role must be global or tenant')
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
    'NUXT_FIREBASE_API_KEY',
    'NUXT_FIREBASE_AUTH_DOMAIN',
    'NUXT_FIREBASE_PROJECT_ID',
    'NUXT_FIREBASE_STORAGE_BUCKET',
    'NUXT_FIREBASE_MESSAGING_SENDER_ID',
    'NUXT_FIREBASE_APP_ID',
  ]

  const optionalVars = [
    'NUXT_FIREBASE_MEASUREMENT_ID',
    'NUXT_FIREBASE_RECAPTCHA_V3_KEY',
  ]

  // Check required server-side variables
  requiredVars.forEach((varName) => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      result.errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Optional variables for advanced features
  optionalVars.forEach((varName) => {
    if (!envVars[varName]) {
      result.warnings.push(`Optional env not set: ${varName}`)
    }
  })

  // Check for service account
  if (!envVars['FIREBASE_SERVICE_ACCOUNT']) {
    result.warnings.push(
      'FIREBASE_SERVICE_ACCOUNT not set - Firebase admin features may not work'
    )
    result.suggestions.push(
      'Set FIREBASE_SERVICE_ACCOUNT to the JSON content or mount config/service-account.json and read it in server code'
    )
  }

  // Validate Firebase project ID format
  const projectId = envVars['NUXT_FIREBASE_PROJECT_ID']
  if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
    result.warnings.push(
      'FIREBASE_PROJECT_ID should only contain lowercase letters, numbers, and hyphens'
    )
  }
}

/**
 * Validates color configuration
 */
function validateColorConfig(
  color: string,
  result: ConfigValidationResult,
  label = 'Primary color',
  required = true
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

  if (!color || color.trim() === '') {
    if (required) {
      result.errors.push(`${label} is required`)
    }
    return
  }

  if (!validNuxtColors.includes(color)) {
    result.warnings.push(`${label} "${color}" is not a standard NuxtUI color`)
    result.suggestions.push(
      `Consider using one of: ${validNuxtColors.slice(0, 10).join(', ')}, etc.`
    )
  }
}

/**
 * Validates module configuration
 */
function validateModules(
  modules: string[] | undefined,
  includeCore: boolean | undefined,
  result: ConfigValidationResult
) {
  if (includeCore === false) {
    result.warnings.push(
      'includeCore is false; ensure your modules add required runtime pieces'
    )
  }

  if (!modules || modules.length === 0) {
    result.warnings.push('modules is empty; only core modules will load')
    return
  }

  const trimmed = modules.map((id) => id?.trim()).filter(Boolean) as string[]
  if (trimmed.length !== modules.length) {
    result.warnings.push(
      'Some modules were empty strings after trimming; remove blanks'
    )
  }

  for (const mod of trimmed) {
    if (!mod.startsWith('fireux-')) {
      result.warnings.push(`Module "${mod}" is not namespaced fireux-*`)
      result.suggestions.push(
        'Use fireux-* naming for custom modules to avoid collisions'
      )
    }
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
export function generateNuxtConfig(config: ValidationTenantConfig): string {
  const modules = config.modules ?? ['fireux-products']
  const modulesArray = modules.map((m) => `'${m}'`).join(', ')
  const includeCore = config.includeCore !== false
  const compatibility = config.compatibilityDate ?? DEFAULT_COMPATIBILITY_DATE
  const neutralLine = config.neutralColor
    ? `    neutralColor: '${config.neutralColor}',\n`
    : ''
  const secondaryLine = config.secondaryColor
    ? `    secondaryColor: '${config.secondaryColor}',\n`
    : ''

  return `import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(
  createFireuxConfig({
    ecosystem: '${config.ecosystem}',
    appName: '${config.appName}',
    appShortName: '${config.appShortName}',
    role: '${config.role}',
    modules: [${modulesArray}],
    includeCore: ${includeCore},
    primaryColor: '${config.primaryColor}',
${neutralLine}${secondaryLine}    compatibilityDate: '${compatibility}',
  })
)
`
}

/**
 * Generates standard .env template
 */
export function generateEnvFile(config: ValidationTenantConfig): string {
  const colorHex = getColorHex(config.primaryColor)

  return `# Firebase Configuration (Server-side)
NUXT_FIREBASE_API_KEY=your_api_key_here
NUXT_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_FIREBASE_PROJECT_ID=your_project_id
NUXT_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NUXT_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NUXT_FIREBASE_RECAPTCHA_V3_KEY=
FIREBASE_SERVICE_ACCOUNT=

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
export function generateAppConfig(config: ValidationTenantConfig): string {
  return `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${config.primaryColor}',
      neutral: '${config.neutralColor ?? 'zinc'}',
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
