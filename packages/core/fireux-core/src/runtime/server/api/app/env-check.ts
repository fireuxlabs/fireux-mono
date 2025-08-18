import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  // Check for required environment variables
  const requiredEnvVars = [
    'NUXT_PUBLIC_FIREBASE_API_KEY',
    'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NUXT_PUBLIC_FIREBASE_APP_ID',
    'NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  ]

  const optionalEnvVars = [
    'APP_NAME',
    'APP_SHORT_NAME',
    'APP_ID',
    'APP_PRIMARY_COLOR',
    'APP_NEUTRAL_COLOR',
    'APP_ICON',
    'APP_DOMAIN',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
  ]

  const missingVars = requiredEnvVars.filter((key) => !process.env[key])
  const presentOptionalVars = optionalEnvVars.filter((key) => process.env[key])

  return {
    isValid: missingVars.length === 0,
    required: requiredEnvVars.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    optional: optionalEnvVars.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    missingRequired: missingVars,
    summary: {
      required: `${requiredEnvVars.length - missingVars.length}/${requiredEnvVars.length}`,
      optional: `${presentOptionalVars.length}/${optionalEnvVars.length}`,
    },
  }
})
