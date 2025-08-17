import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  // Check for required environment variables
  const requiredEnvVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
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

  return {
    isValid: missingVars.length === 0,
    required: requiredEnvVars.map((key) => ({
      key,
      present: !!process.env[key],
      value: process.env[key] ? '***' : undefined,
    })),
    missingRequired: missingVars,
    summary: {
      required: `${requiredEnvVars.length - missingVars.length}/${requiredEnvVars.length}`,
    },
  }
})
