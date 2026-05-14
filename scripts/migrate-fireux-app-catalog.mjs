#!/usr/bin/env node
/*
  Seed/normalize the FireUX control-plane apps collection.

  What it does:
  - upserts every repo app from scripts/_lib/app-registry.mjs into:
      apps/<appId>
    in the FireUX runtime database
  - marks FireUX-native apps with:
      fireux_size = "big"
    and all other repo apps with:
      fireux_size = "small"
  - preserves richer existing Firestore fields when present

  Usage:
    node scripts/migrate-fireux-app-catalog.mjs
    node scripts/migrate-fireux-app-catalog.mjs --commit
    node scripts/migrate-fireux-app-catalog.mjs --app fireux-app --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { APP_REGISTRY } from './_lib/app-registry.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const DATABASE_ID = 'fireux'
const MIGRATION_APP_ID = 'fireux-app'
const MIGRATION_ACTOR = 'system:migrate-fireux-app-catalog'

const ECOSYSTEM_PROJECT_IDS = {
  fireux: 'fireux-2005',
  misebox: 'misebox-78f9c',
  cleanbox: 'cleanbox-f15bc',
  bringli: 'bringli-b0517',
  granite: 'granite-ecosystem',
}

const APP_OVERRIDES = {
  'fireux-app': {
    name: 'FireUX',
    shortName: 'FireUX',
    siteUrl: 'https://fireux.app',
    tagline: 'Control plane for the FireUX ecosystem.',
    description: 'Core FireUX control-plane app and shared operator surface.',
  },
  'fireux-tenant': {
    name: 'FireUX Tenant',
    shortName: 'Tenant',
    siteUrl: 'https://tennant.web.app',
    tagline: 'Tenant surface inside the FireUX ecosystem.',
    description: 'Tenant child app running inside the FireUX ecosystem.',
  },
  'find-my-seo-app': {
    name: 'Find My SEO',
    shortName: 'FindMySEO',
    siteUrl: 'https://stitch-seo.web.app',
    tagline: 'Standalone FireUX-hosted SEO product.',
    description:
      'Standalone FireUX-hosted product app inside the fireux ecosystem.',
  },
  sproochli: {
    name: 'Sproochli',
    shortName: 'Sproochli',
    siteUrl: 'https://sproochli.web.app',
    tagline: 'Multilingual guest guides, read-only menus, and information pages.',
    description:
      'Standalone FireUX app for Sproochli BNB guides, read-only menus, and practical translated information pages.',
  },
  'misebox-app': {
    name: 'Misebox',
    shortName: 'Misebox',
    siteUrl: 'https://misebox.app',
  },
  'cleanbox-app': {
    name: 'Cleanbox',
    shortName: 'Cleanbox',
    siteUrl: 'https://cleanbox.web.app',
  },
  'bringli-app': {
    name: 'Bringli',
    shortName: 'Bringli',
    siteUrl: 'https://bringli.web.app',
  },
  'granite-app': {
    name: 'Granite',
    shortName: 'Granite',
    siteUrl: 'https://granite-os.web.app',
  },
  niederhorn: {
    name: 'Niederhorn',
    shortName: 'Niederhorn',
  },
  'la-tap-berne': {
    name: 'La Tap Berne',
    shortName: 'La Tap Berne',
  },
  'richies-reinigung': {
    name: 'Richies',
    shortName: 'Richies',
  },
}

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

function asTimestamp(value) {
  if (value instanceof Timestamp) return value
  if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Timestamp(value.seconds, value.nanoseconds)
  }
  if (value && typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
    return new Timestamp(value._seconds, value._nanoseconds)
  }
  return null
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function uniqueStrings(values) {
  return [
    ...new Set(values.map((value) => normalizeString(value)).filter(Boolean)),
  ]
}

function resolveMediaDefaults(siteUrl) {
  const base = normalizeString(siteUrl).replace(/\/+$/, '')
  if (!base) return {}

  return {
    thumbnail_url: `${base}/img/app/thumbnail.png`,
    logo_url: `${base}/img/app/logo.png`,
    wordmark_light_url: `${base}/img/app/wordmark-light.png`,
    wordmark_dark_url: `${base}/img/app/wordmark-dark.png`,
    cover_url: `${base}/img/app/cover.png`,
  }
}

function buildAppSeed(entry) {
  const overrides = APP_OVERRIDES[entry.appId] ?? {}
  const ecosystem = normalizeString(entry.ecosystem)
  const role = normalizeString(entry.role)
  const size = ecosystem === 'fireux' ? 'big' : 'small'

  return {
    key: normalizeString(entry.key),
    appId: normalizeString(entry.appId),
    ecosystem,
    role,
    launchOrder: Number(entry.launchOrder || 0),
    workspace: normalizeString(entry.workspace),
    databaseId: normalizeString(entry.databaseId || DATABASE_ID),
    consoleFamilies: Array.isArray(entry.consoleFamilies)
      ? uniqueStrings(entry.consoleFamilies)
      : [],
    projectId: normalizeString(ECOSYSTEM_PROJECT_IDS[ecosystem]),
    name: normalizeString(overrides.name || entry.name || entry.appId),
    shortName: normalizeString(
      overrides.shortName || overrides.name || entry.name || entry.appId
    ),
    siteUrl: normalizeString(overrides.siteUrl),
    tagline: normalizeString(overrides.tagline),
    description: normalizeString(overrides.description),
    size,
  }
}

function buildPatch(seed, existing = {}) {
  const now = Timestamp.now()
  const existingCreated = asTimestamp(existing?.created?.at)
  const existingCreatedBy = normalizeString(existing?.created?.by)
  const existingCreatedAppId = normalizeString(existing?.created?.app_id)

  const patch = {
    id: seed.appId,
    slug: seed.appId,
    status: normalizeString(existing.status) || 'active',
    project_id: seed.projectId,
    ecosystem_id: seed.ecosystem,
    database_id: seed.databaseId,
    app_name: seed.name,
    app_short_name: seed.shortName,
    role: seed.role,
    ecosystem: seed.ecosystem,
    fireux_size: seed.size,
    fireux_native: seed.size === 'big',
    fireux_repo: {
      key: seed.key,
      workspace: seed.workspace,
      launch_order: seed.launchOrder,
      console_families: seed.consoleFamilies,
      database_id: seed.databaseId,
    },
    created: {
      at: existingCreated || now,
      by: existingCreatedBy || MIGRATION_ACTOR,
      app_id: existingCreatedAppId || MIGRATION_APP_ID,
    },
    updated: {
      at: now,
      by: MIGRATION_ACTOR,
    },
  }

  if (seed.siteUrl) {
    const existingSocialLinks = asObject(existing.social_links)
    patch.social_links = {
      ...existingSocialLinks,
      website: seed.siteUrl,
    }
  }

  const existingDerived = asObject(existing.derived)
  patch.derived = {
    ...existingDerived,
    user_count:
      typeof existingDerived.user_count === 'number' ? existingDerived.user_count : 0,
  }

  if (seed.siteUrl) {
    const existingMedia = asObject(existing.media)
    patch.media = {
      ...resolveMediaDefaults(seed.siteUrl),
      ...existingMedia,
    }
  }

  if (seed.size === 'big') {
    patch.team = normalizeString(existing.team) || 'fireux'
    patch.tagline = normalizeString(existing.tagline) || seed.tagline
    patch.description = normalizeString(existing.description) || seed.description
    patch.short_bio = normalizeString(existing.short_bio) || seed.tagline
    patch.long_bio = normalizeString(existing.long_bio) || seed.description
    patch.join_requests = Array.isArray(existing.join_requests)
      ? existing.join_requests
      : []
    patch.admin_ids = Array.isArray(existing.admin_ids) ? existing.admin_ids : []
    patch.moderation_state = normalizeString(existing.moderation_state)
    patch.ban_reasons = Array.isArray(existing.ban_reasons)
      ? existing.ban_reasons
      : []
  }

  return patch
}

async function loadServiceAccount(pathLike) {
  const resolved = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolved}`)
  }
  return {
    resolvedPath: resolved,
    projectId: normalizeString(parsed.project_id),
    credential: cert(parsed),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const appFilter = normalizeString(args.app)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : SERVICE_ACCOUNT_PATH
  const databaseId =
    typeof args.database === 'string'
      ? normalizeString(args.database)
      : DATABASE_ID

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const adminApp = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    `migrate-fireux-app-catalog-${Date.now()}`
  )
  const db = getFirestore(adminApp, databaseId)
  const defaultDb = getFirestore(adminApp)

  const appEntries = Object.values(APP_REGISTRY)
    .map((entry) => buildAppSeed(entry))
    .filter((entry) => (appFilter ? entry.appId === appFilter : true))
    .sort((a, b) => a.launchOrder - b.launchOrder)

  console.log('[migrate] fireux app catalog start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId,
    commit,
    appFilter: appFilter || null,
    apps: appEntries.map((entry) => ({
      id: entry.appId,
      ecosystem: entry.ecosystem,
      role: entry.role,
      database_id: entry.databaseId,
      fireux_size: entry.size,
    })),
  })

  const stats = {
    scanned: 0,
    created: 0,
    updated: 0,
    appDatabaseCreated: 0,
    appDatabaseUpdated: 0,
  }

  for (const seed of appEntries) {
    const ref = db.collection('apps').doc(seed.appId)
    const snap = await ref.get()
    const existing = snap.exists ? snap.data() || {} : {}
    const patch = buildPatch(seed, existing)
    const shouldWriteAppDatabase =
      seed.role === 'standalone' &&
      seed.databaseId &&
      seed.databaseId !== databaseId

    stats.scanned += 1
    if (snap.exists) stats.updated += 1
    else stats.created += 1

    if (!commit) {
      console.log('[dry-run] set', ref.path, patch)
      if (seed.ecosystem === 'fireux') {
        console.log('[dry-run] arrayUnion ecosystem/fireux-fireux.apps', seed.appId)
      }
      if (shouldWriteAppDatabase) {
        console.log(
          '[dry-run] set app database',
          `${seed.databaseId}/apps/${seed.appId}`,
          patch
        )
      }
      continue
    }

    await ref.set(patch, { merge: true })

    if (seed.ecosystem === 'fireux') {
      const defaultEcosystemRef = defaultDb.collection('ecosystem').doc('fireux-fireux')
      await defaultEcosystemRef.set(
        {
          apps: FieldValue.arrayUnion(seed.appId),
          updated: {
            at: Timestamp.now(),
            by: MIGRATION_ACTOR,
          },
        },
        { merge: true }
      )
    }

    if (shouldWriteAppDatabase) {
      const appDb = getFirestore(adminApp, seed.databaseId)
      const appDbRef = appDb.collection('apps').doc(seed.appId)
      const appDbSnap = await appDbRef.get()
      const canonicalSnap = await ref.get()
      const canonicalPatch = canonicalSnap.exists ? canonicalSnap.data() || patch : patch
      await appDbRef.set(canonicalPatch, { merge: true })
      if (appDbSnap.exists) stats.appDatabaseUpdated += 1
      else stats.appDatabaseCreated += 1
    }
  }

  console.log('[migrate] fireux app catalog complete', stats)
}

main().catch((error) => {
  console.error('[migrate] fireux app catalog failed')
  console.error(error)
  process.exit(1)
})
