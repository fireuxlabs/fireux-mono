#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: read-only audit of canonical App media objects and stored URLs for an explicit registry scope.
// Concurrent edit — 2026-07-20 22:12 CEST — Repo Efficiency Pass 4 of 6: resolve exact registry targets and audit canonical media efficiently.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

import { APP_REGISTRY } from './_lib/app-registry.mjs'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const EXPECTED_MEDIA = [
  {
    kind: 'thumbnail',
    objectName: 'thumbnail',
    field: 'thumbnail_url',
  },
  {
    kind: 'logo',
    objectName: 'logo',
    field: 'logo_url',
  },
  {
    kind: 'wordmarkLight',
    objectName: 'wordmark-light',
    field: 'wordmark_light_url',
  },
  {
    kind: 'wordmarkDark',
    objectName: 'wordmark-dark',
    field: 'wordmark_dark_url',
  },
  {
    kind: 'cover',
    objectName: 'cover',
    field: 'cover_url',
  },
]

const LEGACY_MEDIA_FIELDS = [
  'thumbnail_url',
  'logo_url',
  'wordmark_light_url',
  'wordmark_dark_url',
  'cover_url',
  'avatar_url',
  'wordmark_url',
]

const ALLOWED_ARGS = new Set([
  'all',
  'app',
  'ecosystem',
  'help',
  'out',
  'service-account',
  'targets',
])

function repoRoot() {
  return process.cwd()
}

function tryReadText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function extractFirst(text, regex) {
  const match = text.match(regex)
  return match?.[1] ?? null
}

function ecosystemKeyFromPackage(packageName) {
  return packageName.startsWith('fireux-')
    ? packageName.slice('fireux-'.length)
    : packageName
}

function discoverEcosystemFirebaseConfigs() {
  const base = path.join(repoRoot(), 'packages', 'ecosystem')
  let dirs = []
  try {
    dirs = fs
      .readdirSync(base, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  } catch {
    return []
  }

  const results = []
  for (const packageName of dirs) {
    const filePath = path.join(
      base,
      packageName,
      'src',
      'config',
      'firebase',
      'ecosystem.config.ts'
    )
    const source = tryReadText(filePath)
    if (!source) continue

    const ecosystemId =
      extractFirst(source, /\bid\s*:\s*'([^']+)'/) ??
      extractFirst(source, /\bid\s*:\s*"([^"]+)"/)
    const projectId =
      extractFirst(source, /\bprojectId\s*:\s*'([^']+)'/) ??
      extractFirst(source, /\bprojectId\s*:\s*"([^"]+)"/)
    const storageBucket =
      extractFirst(source, /\bstorageBucket\s*:\s*'([^']+)'/) ??
      extractFirst(source, /\bstorageBucket\s*:\s*"([^"]+)"/)
    const databaseId =
      extractFirst(source, /\bdatabaseId\s*:\s*'([^']+)'/) ??
      extractFirst(source, /\bdatabaseId\s*:\s*"([^"]+)"/)
    const name =
      extractFirst(source, /\bname\s*:\s*'([^']+)'/) ??
      extractFirst(source, /\bname\s*:\s*"([^"]+)"/)

    if (!ecosystemId || !projectId || !storageBucket) continue

    results.push({
      ecosystemKey: ecosystemKeyFromPackage(packageName),
      ecosystemId,
      ecosystemName: name || ecosystemId,
      projectId,
      configDatabaseId: databaseId || '',
      storageBucket,
      sourceFile: path.relative(repoRoot(), filePath),
    })
  }

  return results
}

function textArg(args, key) {
  const value = args[key]
  if (value === undefined) return ''
  if (value === true) {
    throw new Error(`--${key} requires a value.`)
  }
  return String(value).trim()
}

function booleanFlag(args, key) {
  const value = args[key]
  if (value === undefined) return false
  if (value !== true) {
    throw new Error(`--${key} is a flag and does not accept a value.`)
  }
  return true
}

function assertKnownArgs(args) {
  const unknown = Object.keys(args).filter((key) => !ALLOWED_ARGS.has(key))
  if (unknown.length) {
    throw new Error(
      `Unknown option(s): ${unknown.map((key) => `--${key}`).join(', ')}`
    )
  }
}

function registryAppEntries() {
  return Object.entries(APP_REGISTRY)
    .map(([appKey, value]) => ({
      appKey,
      appId: String(value.appId || '').trim(),
      ecosystemKey: String(value.ecosystem || '').trim(),
      databaseId: String(value.databaseId || '').trim(),
      workspace: String(value.workspace || '').trim(),
    }))
    .sort((left, right) => left.appKey.localeCompare(right.appKey))
}

function buildTargetPlan({ configs, requestedApp, requestedEcosystem }) {
  const apps = registryAppEntries()
  const appKeys = apps.map((entry) => entry.appKey)
  const ecosystemKeys = [
    ...new Set(apps.map((entry) => entry.ecosystemKey)),
  ].sort()

  if (requestedApp && !appKeys.includes(requestedApp)) {
    throw new Error(
      `Unknown registry app key ${requestedApp}. Expected one of: ${appKeys.join(', ')}`
    )
  }
  if (requestedEcosystem && !ecosystemKeys.includes(requestedEcosystem)) {
    throw new Error(
      `Unknown registry ecosystem key ${requestedEcosystem}. Expected one of: ${ecosystemKeys.join(', ')}`
    )
  }

  const selectedApps = apps.filter(
    (entry) =>
      (!requestedEcosystem || entry.ecosystemKey === requestedEcosystem) &&
      (!requestedApp || entry.appKey === requestedApp)
  )

  if (!selectedApps.length) {
    throw new Error(
      `Registry app ${requestedApp} does not belong to ecosystem ${requestedEcosystem}.`
    )
  }

  const configByKey = new Map()
  for (const config of configs) {
    if (configByKey.has(config.ecosystemKey)) {
      throw new Error(
        `Multiple ecosystem Firebase configs resolve to ${config.ecosystemKey}.`
      )
    }
    configByKey.set(config.ecosystemKey, config)
  }

  const targetsByKey = new Map()
  for (const app of selectedApps) {
    if (!app.appId || !app.databaseId || !app.workspace) {
      throw new Error(
        `APP_REGISTRY.${app.appKey} must define appId, databaseId, and workspace.`
      )
    }

    const config = configByKey.get(app.ecosystemKey)
    if (!config) {
      throw new Error(
        `Missing ecosystem Firebase config for registry ecosystem ${app.ecosystemKey}.`
      )
    }

    if (!targetsByKey.has(app.ecosystemKey)) {
      targetsByKey.set(app.ecosystemKey, {
        ...config,
        apps: [],
      })
    }
    targetsByKey.get(app.ecosystemKey).apps.push(app)
  }

  return [...targetsByKey.values()]
    .sort((left, right) => left.ecosystemKey.localeCompare(right.ecosystemKey))
    .map((target) => ({
      ...target,
      apps: target.apps.sort((left, right) =>
        left.appKey.localeCompare(right.appKey)
      ),
    }))
}

function objectPathFor(appId, objectName) {
  return `apps/${appId}/media/${objectName}`
}

function parseFirebaseStorageDownloadUrl(value) {
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'firebasestorage.googleapis.com'
    ) {
      return null
    }

    const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/)
    if (!match || url.searchParams.get('alt') !== 'media') return null

    return {
      bucket: decodeURIComponent(match[1]),
      objectPath: decodeURIComponent(match[2]),
    }
  } catch {
    return null
  }
}

function validateStoredUrl(value, bucket, objectPath) {
  const hasUrl = typeof value === 'string' && Boolean(value.trim())
  if (!hasUrl) {
    return {
      hasUrl: false,
      matchesTarget: false,
      issue: 'Missing Firestore URL field',
    }
  }

  if (value !== value.trim()) {
    return {
      hasUrl: true,
      matchesTarget: false,
      issue: 'Firestore URL contains surrounding whitespace',
    }
  }

  const parsed = parseFirebaseStorageDownloadUrl(value)
  if (!parsed) {
    return {
      hasUrl: true,
      matchesTarget: false,
      issue: 'Firestore URL is not a canonical Firebase Storage download URL',
    }
  }

  if (parsed.bucket !== bucket) {
    return {
      hasUrl: true,
      matchesTarget: false,
      issue: `Firestore URL points to bucket ${parsed.bucket}, expected ${bucket}`,
    }
  }

  if (parsed.objectPath !== objectPath) {
    return {
      hasUrl: true,
      matchesTarget: false,
      issue: `Firestore URL points to ${parsed.objectPath}, expected ${objectPath}`,
    }
  }

  return { hasUrl: true, matchesTarget: true, issue: '' }
}

function recordObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function elevateStatus(current, next) {
  const rank = { ok: 0, warn: 1, error: 2 }
  return rank[next] > rank[current] ? next : current
}

async function auditRegistryApp({ adminApp, bucket, target }) {
  const database = getFirestore(adminApp, target.databaseId)
  const prefix = `apps/${target.appId}/media/`
  const [document, storageResult] = await Promise.all([
    database.collection('apps').doc(target.appId).get(),
    bucket.getFiles({ prefix }),
  ])

  const listedObjects = storageResult[0].map((file) => file.name).sort()
  const listedObjectSet = new Set(listedObjects)
  const expectedObjectSet = new Set(
    EXPECTED_MEDIA.map((media) => objectPathFor(target.appId, media.objectName))
  )
  const unexpectedObjects = listedObjects.filter(
    (objectPath) => !expectedObjectSet.has(objectPath)
  )

  const data = document.exists ? document.data() || {} : {}
  const media = recordObject(data.media)
  const legacyFields = LEGACY_MEDIA_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(data, field)
  )

  let status = document.exists ? 'ok' : 'error'
  const issues = document.exists ? [] : ['Missing canonical App document']
  const checks = []

  for (const expected of EXPECTED_MEDIA) {
    const objectPath = objectPathFor(target.appId, expected.objectName)
    const storageExists = listedObjectSet.has(objectPath)
    const storedValue =
      typeof media[expected.field] === 'string' ? media[expected.field] : ''
    const url = validateStoredUrl(storedValue, target.storageBucket, objectPath)
    let checkStatus = 'ok'
    const checkIssues = []

    if (!storageExists) {
      checkStatus = 'error'
      checkIssues.push('Missing storage object')
    }
    if (!url.hasUrl) {
      checkStatus = elevateStatus(
        checkStatus,
        document.exists ? 'warn' : 'error'
      )
      checkIssues.push(url.issue)
    } else if (!url.matchesTarget) {
      checkStatus = elevateStatus(checkStatus, 'warn')
      checkIssues.push(url.issue)
    }

    status = elevateStatus(status, checkStatus)
    checks.push({
      kind: expected.kind,
      firestoreField: `media.${expected.field}`,
      firestoreHasUrl: url.hasUrl,
      firestoreUrl: url.hasUrl ? storedValue : '',
      storageObjectPath: objectPath,
      storageExists,
      urlMatchesExpectedTarget: url.matchesTarget,
      status: checkStatus,
      issues: checkIssues,
    })
  }

  if (unexpectedObjects.length) {
    status = elevateStatus(status, 'warn')
    issues.push('Unexpected objects exist under the canonical media prefix')
  }
  if (legacyFields.length) {
    status = elevateStatus(status, 'warn')
    issues.push('Legacy root media fields remain on the App document')
  }

  return {
    appKey: target.appKey,
    id: target.appId,
    databaseId: target.databaseId,
    workspace: target.workspace,
    documentExists: document.exists,
    ok: status === 'ok',
    status,
    issues,
    checks,
    listedObjects,
    unexpectedObjects,
    legacyFields,
  }
}

function printUsage() {
  console.log(`Usage:
  pnpm audit:app-media -- (--ecosystem <registry-key> | --all) [--app <registry-key>] [--out <path>]
  pnpm audit:app-media -- (--ecosystem <registry-key> | --all) [--app <registry-key>] --targets

Checks each selected registry App in its canonical database against:
- apps/{appId}/media/thumbnail
- apps/{appId}/media/logo
- apps/{appId}/media/wordmark-light
- apps/{appId}/media/wordmark-dark
- apps/{appId}/media/cover

Only nested media.* fields are canonical. The audit also reports legacy root
fields and unexpected objects, but never mutates Firestore or Storage.

Options:
- --ecosystem: APP_REGISTRY ecosystem key, for example misebox or fireux
- --app: APP_REGISTRY app key, for example la-tap-berne or find-my-seo
- --all: explicitly audit every registry ecosystem
- --targets: print the deterministic resolved target plan without credentials or network access
- --out: output JSON path (default: temp/app-media-audit.json)

Credential sources, in precedence order:
${firebaseAdminCredentialHelp()
  .map((line) => `- ${line}`)
  .join('\n')}
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  assertKnownArgs(args)

  if (booleanFlag(args, 'help')) {
    printUsage()
    return
  }

  const requestedEcosystem = textArg(args, 'ecosystem')
  const requestedApp = textArg(args, 'app')
  const out = textArg(args, 'out')
  textArg(args, 'service-account')
  const all = booleanFlag(args, 'all')
  const targetsOnly = booleanFlag(args, 'targets')

  if (Boolean(requestedEcosystem) === all) {
    throw new Error(
      'Provide exactly one of --ecosystem <registry-key> or --all.'
    )
  }

  const targets = buildTargetPlan({
    configs: discoverEcosystemFirebaseConfigs(),
    requestedApp,
    requestedEcosystem,
  })

  if (targetsOnly) {
    console.log(JSON.stringify({ targets }, null, 2))
    return
  }

  const report = {
    generatedAt: new Date().toISOString(),
    targets,
    ecosystems: {},
    totals: {
      ecosystems: targets.length,
      apps: 0,
      ok: 0,
      warn: 0,
      error: 0,
    },
  }

  for (const target of targets) {
    const auth = await resolveFirebaseAdminCredential({
      args,
      scope: target.ecosystemId || target.projectId,
      projectId: target.projectId,
    })

    const adminApp = initializeApp(
      {
        credential: auth.credential,
        projectId: target.projectId,
        storageBucket: target.storageBucket,
      },
      `audit-app-media:${target.ecosystemKey}`
    )

    try {
      const bucket = getStorage(adminApp).bucket(target.storageBucket)
      const ecosystemResult = {
        ecosystemKey: target.ecosystemKey,
        ecosystemId: target.ecosystemId,
        ecosystemName: target.ecosystemName,
        projectId: target.projectId,
        configDatabaseId: target.configDatabaseId || '(default)',
        bucket: target.storageBucket,
        sourceFile: target.sourceFile,
        appCount: target.apps.length,
        apps: {},
        totals: { ok: 0, warn: 0, error: 0 },
      }

      for (const appTarget of target.apps) {
        const result = await auditRegistryApp({
          adminApp,
          bucket,
          target: {
            ...appTarget,
            storageBucket: target.storageBucket,
          },
        })
        ecosystemResult.apps[appTarget.appKey] = result
        ecosystemResult.totals[result.status] += 1
      }

      report.ecosystems[target.ecosystemKey] = ecosystemResult
      report.totals.apps += ecosystemResult.appCount
      report.totals.ok += ecosystemResult.totals.ok
      report.totals.warn += ecosystemResult.totals.warn
      report.totals.error += ecosystemResult.totals.error
    } finally {
      await deleteApp(adminApp)
    }
  }

  const outPath = path.resolve(out || 'temp/app-media-audit.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`Wrote: ${outPath}`)
  console.log(`Ecosystems: ${report.totals.ecosystems}`)
  console.log(`Apps: ${report.totals.apps}`)
  console.log(
    `OK: ${report.totals.ok}  WARN: ${report.totals.warn}  ERROR: ${report.totals.error}`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
