// packages/core/fireux-core/src/runtime/server/api/app/env-check.ts
import { defineEventHandler } from 'h3'

/** Typed shape consumed by the client */
interface EnvVarEntry {
  key: string
  present: boolean
  value?: string
}
interface AdminAuthStatus {
  json: boolean
  splitKeys: {
    FIREBASE_PROJECT_ID: boolean
    FIREBASE_CLIENT_EMAIL: boolean
    FIREBASE_PRIVATE_KEY: boolean
  }
  configured: boolean
}
interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  server: {
    adminAuth: AdminAuthStatus
    optional: EnvVarEntry[]
  }
  missingRequired: string[]
  summary: {
    required: string
    optionalClient: string
    optionalServer: string
  }
  warnings: string[]
  notes: string[]
}

/**
 * NOTE:
 * - `role` is enforced via Nuxt config (createFireuxConfig), not env; we do NOT check it here.
 * - This route only validates process.env presence/shape.
 */
export default defineEventHandler<EnvCheckResponse>(() => {
  const env = process.env as Record<string, string | undefined>

  const requiredClient = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'APP_ID',
  ]

  const optionalClient = [
    'FIREBASE_MEASUREMENT_ID',
    'FIREBASE_RECAPTCHA_V3_KEY',
    'APP_NAME',
    'APP_SHORT_NAME',
    'APP_PRIMARY_COLOR',
    'APP_NEUTRAL_COLOR',
    'APP_ICON',
    'APP_DOMAIN',
    'GOOGLE_PLACES_API_KEY',
  ]

  const optionalServer = [
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  // Admin auth detection (either JSON blob or split keys)
  const serverAuthJson = !!env.FIREBASE_SERVICE_ACCOUNT
  const serverAuthSplit =
    !!env.FIREBASE_PROJECT_ID &&
    !!env.FIREBASE_CLIENT_EMAIL &&
    !!env.FIREBASE_PRIVATE_KEY
  const serverAuthConfigured = serverAuthJson || serverAuthSplit

  // Compute presence
  const missingRequired = requiredClient.filter((k) => !env[k])
  const presentOptionalClient = optionalClient.filter((k) => !!env[k])
  const presentOptionalServer = optionalServer.filter((k) => !!env[k])

  // Build warnings
  const warnings: string[] = []
  if (!serverAuthConfigured) {
    warnings.push(
      'Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT or split keys). SSR/admin features will be limited.'
    )
  }
  if (env.STRIPE_SECRET_KEY && !env.STRIPE_WEBHOOK_SECRET) {
    warnings.push(
      'STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing. Webhook validation will be disabled.'
    )
  }

  // Helpers to render masked entries
  const mask = (k: string): EnvVarEntry => ({
    key: k,
    present: !!env[k],
    value: env[k] ? '***' : undefined,
  })

  return {
    isValid: missingRequired.length === 0,

    required: requiredClient.map(mask),
    optionalClient: optionalClient.map(mask),

    server: {
      adminAuth: {
        json: serverAuthJson,
        splitKeys: {
          FIREBASE_PROJECT_ID: !!env.FIREBASE_PROJECT_ID,
          FIREBASE_CLIENT_EMAIL: !!env.FIREBASE_CLIENT_EMAIL,
          FIREBASE_PRIVATE_KEY: !!env.FIREBASE_PRIVATE_KEY,
        },
        configured: serverAuthConfigured,
      },
      optional: optionalServer.map(mask),
    },

    missingRequired,

    summary: {
      required: `${requiredClient.length - missingRequired.length}/${
        requiredClient.length
      }`,
      optionalClient: `${presentOptionalClient.length}/${optionalClient.length}`,
      optionalServer: `${presentOptionalServer.length}/${optionalServer.length}`,
    },

    warnings,

    notes: [
      "Role is enforced by Nuxt config (createFireuxConfig) and isn't checked here.",
      'Fail fast: no fallbacks are applied. Supply all required env vars before boot.',
    ],
  }
})
