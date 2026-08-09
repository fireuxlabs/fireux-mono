#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-08
// usage_note: read-only audit of canonical App media objects and stored URLs for an explicit registry scope.
// Concurrent edit — 2026-07-20 22:12 CEST — Repo Efficiency Pass 4 of 6: resolve exact registry targets and audit canonical media efficiently.

import fs from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'

import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import sharp from 'sharp'

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
    dimensions: { requiredWidth: 1200, requiredHeight: 630 },
  },
  {
    kind: 'logo',
    objectName: 'logo',
    field: 'logo_url',
    dimensions: { requiredWidth: 512, requiredHeight: 512 },
  },
  {
    kind: 'wordmarkLight',
    objectName: 'wordmark-light',
    field: 'wordmark_light_url',
    dimensions: { minWidth: 256, minHeight: 64, minAspect: 3 },
  },
  {
    kind: 'wordmarkDark',
    objectName: 'wordmark-dark',
    field: 'wordmark_dark_url',
    dimensions: { minWidth: 256, minHeight: 64, minAspect: 3 },
  },
  {
    kind: 'cover',
    objectName: 'cover',
    field: 'cover_url',
    dimensions: {
      minWidth: 1280,
      minHeight: 720,
      aspectRatio: 16 / 9,
      aspectTolerance: 0.01,
    },
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

function localAssetPathFor(target, objectName) {
  return path.resolve(
    repoRoot(),
    target.workspace,
    'public',
    'img',
    'app',
    `${objectName}.png`
  )
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function validateDimensions(metadata, constraints) {
  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  if (metadata.format !== 'png') {
    return `Must be PNG (got ${metadata.format || 'unknown'})`
  }
  if (constraints.requiredWidth && constraints.requiredHeight) {
    return width === constraints.requiredWidth &&
      height === constraints.requiredHeight
      ? ''
      : `Must be exactly ${constraints.requiredWidth}x${constraints.requiredHeight} (got ${width}x${height})`
  }
  if (constraints.minWidth && width < constraints.minWidth) {
    return `Must be at least ${constraints.minWidth}px wide (got ${width}px)`
  }
  if (constraints.minHeight && height < constraints.minHeight) {
    return `Must be at least ${constraints.minHeight}px tall (got ${height}px)`
  }

  const aspect = height > 0 ? width / height : 0
  if (
    constraints.aspectRatio &&
    Math.abs(aspect - constraints.aspectRatio) >
      (constraints.aspectTolerance ?? 0)
  ) {
    return `Must use ${constraints.aspectRatio.toFixed(2)}:1 aspect (got ${width}x${height})`
  }
  if (constraints.minAspect && aspect < constraints.minAspect) {
    return `Must use aspect at least ${constraints.minAspect}:1 (got ${width}x${height})`
  }
  return ''
}

async function inspectImage(buffer, constraints) {
  try {
    const metadata = await sharp(buffer).metadata()
    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      format: metadata.format ?? '',
      issue: validateDimensions(metadata, constraints),
    }
  } catch (error) {
    return {
      width: 0,
      height: 0,
      format: '',
      issue:
        error instanceof Error && error.message.trim()
          ? `Unreadable image: ${error.message.trim()}`
          : 'Unreadable image',
    }
  }
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
  const storageFilesByName = new Map(
    storageResult[0].map((file) => [file.name, file])
  )
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
    const localAssetPath = localAssetPathFor(target, expected.objectName)
    const localExists = fs.existsSync(localAssetPath)
    const localBuffer = localExists ? fs.readFileSync(localAssetPath) : null
    const localImage = localBuffer
      ? await inspectImage(localBuffer, expected.dimensions)
      : null
    const storageBuffer = storageExists
      ? (await storageFilesByName.get(objectPath).download())[0]
      : null
    const storageImage = storageBuffer
      ? await inspectImage(storageBuffer, expected.dimensions)
      : null
    const sourceMatchesStorage = Boolean(
      localBuffer &&
        storageBuffer &&
        sha256(localBuffer) === sha256(storageBuffer)
    )
    let checkStatus = 'ok'
    const checkIssues = []

    if (!localExists) {
      checkStatus = 'error'
      checkIssues.push('Missing App-owned source asset')
    } else if (localImage?.issue) {
      checkStatus = 'error'
      checkIssues.push(`Invalid App-owned source asset: ${localImage.issue}`)
    }
    if (!storageExists) {
      checkStatus = 'error'
      checkIssues.push('Missing storage object')
    } else if (storageImage?.issue) {
      checkStatus = 'error'
      checkIssues.push(`Invalid storage object: ${storageImage.issue}`)
    }
    if (localBuffer && storageBuffer && !sourceMatchesStorage) {
      checkStatus = 'error'
      checkIssues.push(
        'Storage object does not match the App-owned source asset'
      )
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
      localAssetPath: path.relative(repoRoot(), localAssetPath),
      localExists,
      localImage,
      storageObjectPath: objectPath,
      storageExists,
      storageImage,
      sourceMatchesStorage,
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
fields and unexpected objects. Every stored object must be a valid canonical
PNG and byte-for-byte match its App-owned public/img/app source. The audit never
mutates Firestore or Storage.

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
      blockedEcosystems: 0,
    },
  }

  for (const target of targets) {
    let adminApp = null
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
      blocker: null,
    }

    try {
      const auth = await resolveFirebaseAdminCredential({
        args,
        scope: target.ecosystemId || target.projectId,
        projectId: target.projectId,
      })

      adminApp = initializeApp(
        {
          credential: auth.credential,
          projectId: target.projectId,
          storageBucket: target.storageBucket,
        },
        `audit-app-media:${target.ecosystemKey}`
      )
      const bucket = getStorage(adminApp).bucket(target.storageBucket)

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
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : 'Ecosystem App media audit failed.'
      const code = /bucket does not exist/i.test(message)
        ? 'STORAGE_BUCKET_REQUIRED'
        : 'ECOSYSTEM_AUDIT_FAILED'
      ecosystemResult.blocker = { code, message }

      for (const appTarget of target.apps) {
        if (ecosystemResult.apps[appTarget.appKey]) continue
        ecosystemResult.apps[appTarget.appKey] = {
          appKey: appTarget.appKey,
          id: appTarget.appId,
          databaseId: appTarget.databaseId,
          workspace: appTarget.workspace,
          documentExists: null,
          ok: false,
          status: 'error',
          issues: [`Ecosystem media audit blocked: ${message}`],
          checks: [],
          listedObjects: [],
          unexpectedObjects: [],
          legacyFields: [],
        }
        ecosystemResult.totals.error += 1
      }
    } finally {
      if (adminApp) await deleteApp(adminApp)
    }

    report.ecosystems[target.ecosystemKey] = ecosystemResult
    report.totals.apps += ecosystemResult.appCount
    report.totals.ok += ecosystemResult.totals.ok
    report.totals.warn += ecosystemResult.totals.warn
    report.totals.error += ecosystemResult.totals.error
    if (ecosystemResult.blocker) report.totals.blockedEcosystems += 1
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
  console.log(`Blocked ecosystems: ${report.totals.blockedEcosystems}`)
  if (
    report.totals.warn > 0 ||
    report.totals.error > 0 ||
    report.totals.blockedEcosystems > 0
  ) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
