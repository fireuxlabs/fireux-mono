#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const apps = [
  'projects/fireux/fireux-app',
  'projects/misebox/misebox-app',
  'projects/cleanbox/cleanbox-app',
  'projects/cleanbox/richies-reinigung',
  'projects/misebox/niederhorn',
]

const required = [
  'APP_ID',
  'APP_NAME',
  'APP_SHORT_NAME',
  'APP_PRIMARY_COLOR',
  'APP_NEUTRAL_COLOR',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
]

let failures = 0

function parseEnv(str) {
  const map = new Map()
  for (const line of str.split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m) map.set(m[1], m[2])
  }
  return map
}

for (const app of apps) {
  const envPath = join(process.cwd(), app, '.env')
  if (!existsSync(envPath)) {
    console.warn(`⚠️  ${app}: missing .env`)
    failures++
    continue
  }
  const data = readFileSync(envPath, 'utf8')
  const env = parseEnv(data)
  const missing = required.filter((k) => !env.has(k) || env.get(k) === '')

  const hasInlineSA = env.has('FIREBASE_SERVICE_ACCOUNT')
  const hasPathSA = env.has('GOOGLE_APPLICATION_CREDENTIALS')
  const saOk = hasInlineSA || hasPathSA

  if (missing.length || !saOk) {
    console.error(
      `❌ ${app}: missing ${missing.join(', ') || '—'}${
        !saOk ? (missing.length ? ' and' : '') + ' SERVICE_ACCOUNT' : ''
      }`
    )
    failures++
  } else {
    console.log(`✅ ${app}: env looks OK`)
  }
}

if (failures) {
  console.error(`\nEnv lint failed in ${failures} app(s).`)
  process.exit(1)
} else {
  console.log(`\nEnv lint passed.`)
}
