import { defineEventHandler } from 'h3'

/**
 * NOTE:
 * - `role` is enforced in Nuxt config, not via env, so we do NOT check it here.
 * - This route only validates process.env presence/shape.
 */
export default defineEventHandler((_event) => {
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

  const serverAuthJson = !!process.env.FIREBASE_SERVICE_ACCOUNT
  const serverAuthSplit =
    !!process.env.FIREBASE_PROJECT_ID &&
    !!process.env.FIREBASE_CLIENT_EMAIL &&
    !!process.env.FIREBASE_PRIVATE_KEY

  const serverAuthConfigured = serverAuthJson || serverAuthSplit

  const optionalServer = [
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  const missingRequired = requiredClient.filter((k) => !process.env[k])
  const presentOptionalClient = optionalClient.filter((k) => !!process.env[k])
  const presentOptionalServer = optionalServer.filter((k) => !!process.env[k])

  const warnings: string[] = []

  if (!serverAuthConfigured) {
    warnings.push(
      'Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT or split keys). SSR/admin features will be limited.'
    )
  }

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push(
      'STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing. Webhook validation will be disabled.'
    )
  }

  return {
    isValid: missingRequired.length === 0,
    required: requiredClient.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    optionalClient: optionalClient.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    server: {
      adminAuth: {
        json: !!process.env.FIREBASE_SERVICE_ACCOUNT,
        splitKeys: {
          FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
          FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
          FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        },
        configured: serverAuthConfigured,
      },
      optional: optionalServer.map((key) => ({
        key,
        present: !!process.env[key],
        value: process.env[key] ? '***' : undefined,
      })),
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
