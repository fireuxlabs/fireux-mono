#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ACTOR = 'codex-ensure-default-ecosystems'

const GLOBAL_APPS = [
  {
    ecosystemId: 'fireux',
    appId: 'fireux-app',
    team: 'fireux',
    fallbackName: 'FireUX',
    fallbackSourceUrl: 'http://fireux.app',
    serviceAccountPath: 'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json',
  },
  {
    ecosystemId: 'misebox',
    appId: 'misebox-app',
    team: 'fireux',
    fallbackName: 'Misebox',
    fallbackSourceUrl: 'https://misebox.app',
    serviceAccountPath: 'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json',
  },
  {
    ecosystemId: 'cleanbox',
    appId: 'cleanbox-app',
    team: 'fireux',
    fallbackName: 'Cleanbox',
    fallbackSourceUrl: 'https://cleanbox.web.app',
    serviceAccountPath: 'packages/ecosystem/fireux-cleanbox/src/config/firebase/service-account.json',
  },
  {
    ecosystemId: 'granite',
    appId: 'granite-app',
    team: 'fireux',
    fallbackName: 'Granite',
    fallbackSourceUrl: 'https://granite-ecosystem.web.app',
    serviceAccountPath: 'packages/ecosystem/fireux-granite/src/config/firebase/service-account.json',
  },
  {
    ecosystemId: 'bringli',
    appId: 'bringli-app',
    team: 'fireux',
    fallbackName: 'Bringli',
    fallbackSourceUrl: 'https://bringli-b0517.web.app',
    serviceAccountPath: 'packages/ecosystem/fireux-bringli/src/config/firebase/service-account.json',
  },
]

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

function firstString(record, keys) {
  for (const key of keys) {
    const value = normalizeString(record?.[key])
    if (value) return value
  }
  return ''
}

function readNestedString(record, pathGroups) {
  for (const path of pathGroups) {
    let current = record

    for (const segment of path) {
      if (!current || typeof current !== 'object' || Array.isArray(current)) {
        current = ''
        break
      }

      current = current[segment]
    }

    const value = normalizeString(current)
    if (value) return value
  }

  return ''
}

async function loadServiceAccount(pathLike) {
  const resolved = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(raw)
  return {
    resolvedPath: resolved,
    projectId: normalizeString(parsed.project_id),
    credential: cert(parsed),
  }
}

async function resolveEcosystemDocRef(defaultDb, ecosystemId) {
  const bySlug = await defaultDb
    .collection('ecosystems')
    .where('slug', '==', ecosystemId)
    .limit(5)
    .get()

  if (!bySlug.empty) {
    const exact = bySlug.docs.find((docSnap) => docSnap.id === ecosystemId)
    return exact ? exact.ref : bySlug.docs[0].ref
  }

  const plainRef = defaultDb.collection('ecosystems').doc(ecosystemId)
  const plainSnap = await plainRef.get()
  if (plainSnap.exists) return plainRef

  const legacyRef = defaultDb.collection('ecosystems').doc(`fireux-${ecosystemId}`)
  const legacySnap = await legacyRef.get()
  if (legacySnap.exists) return legacyRef

  return plainRef
}

function buildEcosystemPayload({
  projectId,
  ecosystemId,
  appId,
  team,
  fallbackName,
  fallbackSourceUrl,
  targetDocId,
  existing,
  appData,
  appIds,
}) {
  const existingCreated = asTimestamp(existing?.created?.at)
  const now = Timestamp.now()

  const sourceUrl =
    firstString(appData, ['source_url', 'site_url', 'app_url', 'url']) ||
    readNestedString(appData, [['social_links', 'website']]) ||
    normalizeString(existing?.source_url) ||
    fallbackSourceUrl

  const imageUrl =
    firstString(appData, ['image_url', 'logo_url', 'icon_url']) ||
    readNestedString(appData, [
      ['media', 'logo_url'],
      ['media', 'thumbnail_url'],
      ['media', 'cover_url'],
      ['media', 'wordmark_light_url'],
      ['media', 'wordmark_dark_url'],
    ]) ||
    normalizeString(existing?.image_url)

  const description =
    firstString(appData, ['description', 'summary', 'tagline']) ||
    normalizeString(existing?.description)

  const name =
    firstString(appData, ['app_name', 'name', 'app_short_name']) ||
    normalizeString(existing?.name) ||
    fallbackName

  const status = normalizeString(existing?.status) || 'active'
  const existingApps = Array.isArray(existing?.apps)
    ? existing.apps.map((entry) => normalizeString(entry)).filter(Boolean)
    : []
  const apps = Array.from(new Set([...appIds, ...existingApps])).filter(Boolean)

  return {
    id: targetDocId,
    project_id: projectId,
    name,
    slug: ecosystemId,
    description,
    image_url: imageUrl,
    source_url: sourceUrl,
    team: normalizeString(existing?.team) || team,
    status,
    apps,
    created: {
      at: existingCreated || now,
      by: normalizeString(existing?.created?.by) || ACTOR,
      app_id: normalizeString(existing?.created?.app_id) || appId,
    },
    updated: {
      at: now,
      by: ACTOR,
    },
  }
}

async function ensureGlobalDefaultDocs(seed, commit) {
  const serviceAccount = await loadServiceAccount(seed.serviceAccountPath)
  const adminApp = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    `ensure-default-ecosystem-${seed.ecosystemId}-${Date.now()}`
  )

  const defaultDb = getFirestore(adminApp)
  const ecosystemDb = getFirestore(adminApp, seed.ecosystemId)

  const projectRef = defaultDb.collection('project').doc(serviceAccount.projectId)
  const projectSnap = await projectRef.get()
  const currentProject = projectSnap.exists ? projectSnap.data() || {} : {}

  const appRef = ecosystemDb.collection('apps').doc(seed.appId)
  const appSnap = await appRef.get()
  const appData = appSnap.exists ? appSnap.data() || {} : {}

  const appIdsSnap = await ecosystemDb.collection('apps').get()
  const appIds = appIdsSnap.docs.map((docSnap) => docSnap.id)

  const ecosystemRef = await resolveEcosystemDocRef(defaultDb, seed.ecosystemId)
  const ecosystemSnap = await ecosystemRef.get()
  const currentEcosystem = ecosystemSnap.exists ? ecosystemSnap.data() || {} : {}

  const projectPatch = {
    main_app_id: normalizeString(currentProject.main_app_id) || seed.appId,
    main_ecosystem_id: normalizeString(currentProject.main_ecosystem_id) || seed.ecosystemId,
  }

  const ecosystemPayload = buildEcosystemPayload({
    projectId: serviceAccount.projectId,
    ecosystemId: seed.ecosystemId,
    appId: seed.appId,
    team: seed.team,
    fallbackName: seed.fallbackName,
    fallbackSourceUrl: seed.fallbackSourceUrl,
    targetDocId: ecosystemRef.id,
    existing: currentEcosystem,
    appData,
    appIds,
  })

  if (commit) {
    await projectRef.set(projectPatch, { merge: true })
    await ecosystemRef.set(ecosystemPayload, { merge: true })
  }

  return {
    ecosystemId: seed.ecosystemId,
    firebaseProjectId: serviceAccount.projectId,
    committed: commit,
    projectPath: projectRef.path,
    ecosystemPath: ecosystemRef.path,
    projectPatch,
    ecosystemPayload,
    appCount: appIds.length,
    ecosystemDocExisted: ecosystemSnap.exists,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const only = normalizeString(args.only).toLowerCase()
  const seeds = only
    ? GLOBAL_APPS.filter((seed) => seed.ecosystemId === only || seed.appId === only)
    : GLOBAL_APPS

  if (!seeds.length) {
    throw new Error(`No matching global app for --only=${only}`)
  }

  const results = []
  for (const seed of seeds) {
    results.push(await ensureGlobalDefaultDocs(seed, commit))
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        commit,
        count: results.length,
        results,
      },
      null,
      2
    )
  )
}

await main()
