#!/usr/bin/env node
const req = (k) => {
  const v = process.env[k]
  if (!v || !String(v).trim()) throw new Error(`Missing ${k}`)
}
const maybe = (k) => process.env[k]?.trim()

try {
  ;[
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'APP_ID',
    'APP_NAME',
    'APP_SHORT_NAME',
    'APP_PRIMARY_COLOR',
  ].forEach(req)

  if (!maybe('FIREBASE_SERVICE_ACCOUNT') && !maybe('GOOGLE_APPLICATION_CREDENTIALS')) {
    console.warn('⚠️  Neither FIREBASE_SERVICE_ACCOUNT nor GOOGLE_APPLICATION_CREDENTIALS set.')
  }

  const hexes = ['APP_PRIMARY_COLOR', 'APP_NEUTRAL_COLOR']
  hexes.forEach((k) => {
    const v = maybe(k)
    if (v?.startsWith('"#')) {
      console.warn(`ℹ️  ${k} appears quoted ("#..."), prefer unquoted like #EAB308`)
    }
  })

  console.log('✅ .env looks good')
  process.exit(0)
} catch (e) {
  console.error('❌', e.message)
  process.exit(1)
}
