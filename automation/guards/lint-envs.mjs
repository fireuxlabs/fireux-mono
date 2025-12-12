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

const brandNamespaces = new Map([
  ['projects/fireux/fireux-app', 'fireux'],
  ['projects/fireux/tennant', 'fireux'],
  ['projects/misebox/misebox-app', 'misebox'],
  ['projects/misebox/niederhorn', 'misebox'],
  ['projects/cleanbox/cleanbox-app', 'cleanbox'],
  ['projects/cleanbox/richies-reinigung', 'cleanbox'],
])

const required = [
  'APP_ID',
  'APP_NAME',
  'APP_SHORT_NAME',
  'APP_PRIMARY_COLOR',
  'APP_NEUTRAL_COLOR',
  'NUXT_FIREBASE_API_KEY',
  'NUXT_FIREBASE_AUTH_DOMAIN',
  'NUXT_FIREBASE_PROJECT_ID',
  'NUXT_FIREBASE_STORAGE_BUCKET',
  'NUXT_FIREBASE_MESSAGING_SENDER_ID',
  'NUXT_FIREBASE_APP_ID',
]

const firebaseKeys = new Set([
  'NUXT_FIREBASE_API_KEY',
  'NUXT_FIREBASE_AUTH_DOMAIN',
  'NUXT_FIREBASE_PROJECT_ID',
  'NUXT_FIREBASE_STORAGE_BUCKET',
  'NUXT_FIREBASE_MESSAGING_SENDER_ID',
  'NUXT_FIREBASE_APP_ID',
  'NUXT_FIREBASE_MEASUREMENT_ID',
])

const permissive = !!process.env.ALLOW_INCOMPLETE_ENVS
// In permissive mode we only require the key to exist (allow empty) for secrets that
// cannot be committed. Keep structural items (APP_* + project identifiers) strict.
const allowEmptyIfPermissive = new Set([
  'NUXT_FIREBASE_API_KEY',
  'NUXT_FIREBASE_MESSAGING_SENDER_ID',
  'NUXT_FIREBASE_APP_ID',
  'NUXT_FIREBASE_MEASUREMENT_ID',
])

const repoRoot = process.cwd()
let failures = 0

function hasManagedFirebaseConfig(namespace) {
  const pkgName =
    namespace === 'fireux' ? 'fireux-fireux' : `fireux-${namespace}`
  const managedConfigPath = join(
    repoRoot,
    'packages',
    'ecosystem',
    pkgName,
    'src',
    'config',
    'firebase-project.ts'
  )
  return existsSync(managedConfigPath)
}

function getManagedServiceAccountPath(namespace) {
  const pkgName =
    namespace === 'fireux' ? 'fireux-fireux' : `fireux-${namespace}`
  return join(
    repoRoot,
    'packages',
    'ecosystem',
    pkgName,
    'config',
    'service-account.json'
  )
}

function parseEnv(str) {
  const map = new Map()
  for (const line of str.split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m) map.set(m[1], m[2])
  }
  return map
}

for (const app of apps) {
  const namespace = brandNamespaces.get(app) || 'fireux'
  const envPath = join(repoRoot, app, '.env')
  if (!existsSync(envPath)) {
    console.warn(`⚠️  ${app}: missing .env`)
    failures++
    continue
  }
  const data = readFileSync(envPath, 'utf8')
  const env = parseEnv(data)
  const ecosystemManagedFirebase = hasManagedFirebaseConfig(namespace)
  const missing = required.filter((k) => {
    if (ecosystemManagedFirebase && firebaseKeys.has(k)) return false
    const has = env.has(k)
    if (!has) return true
    const val = env.get(k)
    if (val === '' && permissive && allowEmptyIfPermissive.has(k)) return false
    return val === ''
  })

  const hasInlineSA = env.has('FIREBASE_SERVICE_ACCOUNT')
  const hasPathSA = env.has('GOOGLE_APPLICATION_CREDENTIALS')
  const managedSAPath = getManagedServiceAccountPath(namespace)
  const hasManagedSA = ecosystemManagedFirebase && existsSync(managedSAPath)
  const saOk = hasInlineSA || hasPathSA || hasManagedSA
  const candidateDirs = []

  if (namespace === 'fireux') {
    candidateDirs.push(
      join(
        repoRoot,
        'packages',
        'core',
        'fireux-core',
        'src',
        'runtime',
        'public',
        'img',
        'core',
        'brand'
      ),
      join(
        repoRoot,
        'packages',
        'core',
        'fireux-core',
        'src',
        'runtime',
        'public',
        'img',
        'brand',
        'fireux'
      )
    )
  } else {
    candidateDirs.push(
      join(
        repoRoot,
        'packages',
        'ecosystem',
        `fireux-${namespace}`,
        'src',
        'runtime',
        'public',
        'img',
        'brand',
        namespace
      ),
      join(
        repoRoot,
        'packages',
        'ecosystem',
        `fireux-${namespace}`,
        'src',
        'runtime',
        'public',
        'img',
        'ecosystem'
      ),
      join(
        repoRoot,
        'packages',
        'ecosystem',
        `fireux-${namespace}`,
        'src',
        'runtime',
        'public',
        'img',
        'brand'
      )
    )
  }

  candidateDirs.push(
    join(repoRoot, app, 'public', 'img', 'brand', namespace),
    join(repoRoot, app, 'public', 'img', 'brand'),
    join(repoRoot, app, 'public', 'img', 'app'),
    join(repoRoot, app, 'public', 'img', 'ecosystem'),
    join(repoRoot, app, 'public', 'img')
  )

  candidateDirs.push(
    join(
      repoRoot,
      'packages',
      'core',
      'fireux-core',
      'src',
      'runtime',
      'public',
      'img',
      'brand',
      namespace
    ),
    join(
      repoRoot,
      'packages',
      'core',
      'fireux-core',
      'src',
      'runtime',
      'public',
      'img',
      'brand'
    )
  )

  const seen = new Set()
  const brandDir = candidateDirs.find((dir) => {
    if (seen.has(dir)) return false
    seen.add(dir)
    return existsSync(dir)
  })
  const brandIssues = []
  if (!brandDir) {
    brandIssues.push('brand directory (shared packages)')
  } else {
    const resolveFile = (candidates) =>
      candidates.some((file) => existsSync(join(brandDir, file)))

    const brandChecks =
      namespace === 'fireux'
        ? [
            {
              label: 'logo asset (logo.png)',
              candidates: ['logo.png'],
            },
            {
              label: 'wordmark light (wordmark-light.png)',
              candidates: ['wordmark-light.png'],
            },
            {
              label: 'wordmark dark (wordmark-dark.png)',
              candidates: ['wordmark-dark.png'],
            },
          ]
        : [
            {
              label: 'avatar asset (avatar.png)',
              candidates: ['avatar.png'],
            },
            {
              label: 'logo asset (logo.svg|logo.png)',
              candidates: ['logo.svg', 'logo.png'],
            },
            {
              label: 'wordmark asset (wordmark.svg|wordmark.png)',
              candidates: ['wordmark.svg', 'wordmark.png'],
            },
          ]

    for (const check of brandChecks) {
      if (!resolveFile(check.candidates)) {
        brandIssues.push(check.label)
      }
    }
  }

  if (missing.length || !saOk || brandIssues.length) {
    let msg = `❌ ${app}: missing ${missing.join(', ') || '—'}`
    if (!saOk) msg += ' SERVICE_ACCOUNT'
    if (brandIssues.length) msg += ` | brand: ${brandIssues.join(', ')}`
    console.error(msg)
    failures++
  } else {
    console.log(`✅ ${app}: env looks OK${permissive ? ' (permissive)' : ''}`)
  }
}

if (failures) {
  console.error(`\nEnv lint failed in ${failures} app(s).`)
  process.exit(1)
} else {
  console.log(`\nEnv lint passed.`)
}
