const required = ['APP_DOMAIN', 'NUXT_FIREBASE_APP_ID']
const optional = ['NUXT_FIREBASE_MEASUREMENT_ID', 'DEVELOPER_PIN']

const missing = required.filter((name) => {
  const value = process.env[name]
  return typeof value !== 'string' || !value.trim()
})

if (missing.length > 0) {
  console.error('[check-env] Missing required environment variable(s):')
  for (const name of missing) console.error(`- ${name}`)
  process.exit(1)
}

console.log('[check-env] Required environment variables are set.')
for (const name of optional) {
  const value = process.env[name]
  if (typeof value === 'string' && value.trim()) {
    console.log(`[check-env] Optional set: ${name}`)
  } else {
    console.log(`[check-env] Optional missing: ${name}`)
  }
}
