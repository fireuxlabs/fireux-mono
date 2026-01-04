#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

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

function discoverEcosystemFirebaseConfigs() {
  const base = path.join(repoRoot(), 'packages', 'ecosystem')
  let dirs = []
  try {
    dirs = fs
      .readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  } catch {
    return []
  }

  const results = []
  for (const dir of dirs) {
    const filePath = path.join(
      base,
      dir,
      'src',
      'config',
      'firebase',
      'ecosystem.config.ts'
    )
    const text = tryReadText(filePath)
    if (!text) continue

    const serviceAccountPath = path.join(path.dirname(filePath), 'service-account.json')

    const id =
      extractFirst(text, /\bid\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bid\s*:\s*"([^"]+)"/)
    const projectId =
      extractFirst(text, /\bprojectId\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bprojectId\s*:\s*"([^"]+)"/)
    const storageBucket =
      extractFirst(text, /\bstorageBucket\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bstorageBucket\s*:\s*"([^"]+)"/)
    const name =
      extractFirst(text, /\bname\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bname\s*:\s*"([^"]+)"/)

    if (!id || !projectId || !storageBucket) continue

    results.push({
      ecosystemId: id,
      ecosystemName: name || id,
      projectId,
      storageBucket,
      serviceAccountPath: fs.existsSync(serviceAccountPath)
        ? serviceAccountPath
        : null,
      sourceFile: path.relative(repoRoot(), filePath),
    })
  }

  return results
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue

    const [rawKey, rawValue] = token.split('=')
    const key = rawKey.slice(2)

    if (rawValue !== undefined) {
      args[key] = rawValue
      continue
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = next
    i += 1
  }

  return args
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

function resolveServiceAccount(args) {
  if (args['service-account']) {
    const filePath = path.resolve(String(args['service-account']))
    return readJsonFile(filePath)
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
    const filePath = path.resolve(String(process.env.FIREBASE_SERVICE_ACCOUNT_FILE))
    return readJsonFile(filePath)
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is set but not valid JSON')
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    }
  }

  throw new Error(
    'Missing Firebase Admin credentials. Provide --service-account path/to/service-account.json or set FIREBASE_SERVICE_ACCOUNT(_FILE) or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
  )
}

function normaliseKeySegment(value) {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
}

function resolveServiceAccountForProject(args, projectId, ecosystemId) {
  // First: if the caller passed an explicit service account file, always use it.
  if (args['service-account']) return resolveServiceAccount(args)

  const candidates = []
  if (ecosystemId) candidates.push(normaliseKeySegment(ecosystemId))
  if (projectId) candidates.push(normaliseKeySegment(projectId))

  for (const segment of candidates) {
    const fileKey = `FIREBASE_SERVICE_ACCOUNT_FILE__${segment}`
    const jsonKey = `FIREBASE_SERVICE_ACCOUNT__${segment}`

    if (process.env[fileKey]) {
      const filePath = path.resolve(String(process.env[fileKey]))
      return readJsonFile(filePath)
    }
    if (process.env[jsonKey]) {
      try {
        return JSON.parse(String(process.env[jsonKey]))
      } catch {
        throw new Error(`${jsonKey} is set but not valid JSON`)
      }
    }
  }

  return resolveServiceAccount(args)
}

function resolveServiceAccountForTarget(args, target) {
  // Canon convention in this repo: service account json next to ecosystem.config.ts
  if (!args['service-account'] && target?.serviceAccountPath) {
    return readJsonFile(target.serviceAccountPath)
  }

  return resolveServiceAccountForProject(args, target?.projectId, target?.ecosystemId)
}

function defaultBucketFromProjectId(projectId) {
  if (!projectId) return ''
  return `${projectId}.appspot.com`
}

function urlIncludesEncodedPath(url, objectPath) {
  if (!url) return false
  try {
    const encoded = encodeURIComponent(objectPath)
    return url.includes(encoded)
  } catch {
    return false
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    console.log(`Usage: pnpm audit:app-media [--service-account ./service-account.json] [--bucket <bucket>] [--out <path>] [--list]

Reads apps from Firestore collection 'apps' and checks Firebase Storage objects for:
- apps/{appId}/media/thumbnail
- apps/{appId}/media/logo
- apps/{appId}/media/wordmark-light
- apps/{appId}/media/wordmark-dark

Also validates Firestore URL fields match the expected object path.

Env options (alternatives to --service-account):
- FIREBASE_SERVICE_ACCOUNT (JSON)
- FIREBASE_SERVICE_ACCOUNT_FILE (path)
- FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY

Options:
- --bucket: storage bucket name (default: <projectId>.appspot.com)
- --out: output JSON path (default: temp/app-media-audit.json)
- --list: list all objects under apps/{appId}/media/ (can be slow)
`) 
    process.exit(0)
  }

  const discovered = discoverEcosystemFirebaseConfigs()

  const requestedEcosystem = args.ecosystem ? String(args.ecosystem) : null
  const targets = requestedEcosystem
    ? discovered.filter((e) => e.ecosystemId === requestedEcosystem)
    : discovered

  if (!targets.length) {
    const hint = requestedEcosystem
      ? `No ecosystem config found for --ecosystem ${requestedEcosystem}.`
      : 'No ecosystem firebase configs found.'
    throw new Error(
      `${hint} Expected files like packages/ecosystem/<pkg>/src/config/firebase/ecosystem.config.ts`
    )
  }

  const report = {
    generatedAt: new Date().toISOString(),
    targets: targets.map((t) => ({
      ecosystemId: t.ecosystemId,
      ecosystemName: t.ecosystemName,
      projectId: t.projectId,
      bucket: t.storageBucket,
      sourceFile: t.sourceFile,
    })),
    ecosystems: {},
    totals: {
      ecosystems: targets.length,
      apps: 0,
      ok: 0,
      warn: 0,
      error: 0,
    },
  }

  const expectedKinds = [
    {
      kind: 'thumbnail',
      objectPath: (id) => `apps/${id}/media/thumbnail`,
      field: 'thumbnail_url',
    },
    {
      kind: 'logo',
      objectPath: (id) => `apps/${id}/media/logo`,
      field: 'logo_url',
    },
    {
      kind: 'wordmarkLight',
      objectPath: (id) => `apps/${id}/media/wordmark-light`,
      field: 'wordmark_light_url',
    },
    {
      kind: 'wordmarkDark',
      objectPath: (id) => `apps/${id}/media/wordmark-dark`,
      field: 'wordmark_dark_url',
    },
  ]

  for (const target of targets) {
    const serviceAccount = resolveServiceAccountForTarget(args, target)

    const app = initializeApp(
      {
        credential: cert(serviceAccount),
        storageBucket: target.storageBucket,
      },
      `audit:${target.projectId}`
    )

    const db = getFirestore(app)
    const bucket = getStorage(app).bucket(target.storageBucket)

    const appsSnap = await db.collection('apps').get()

    const eco = {
      ecosystemId: target.ecosystemId,
      ecosystemName: target.ecosystemName,
      projectId: target.projectId,
      bucket: target.storageBucket,
      serviceAccount: target.serviceAccountPath
        ? path.relative(repoRoot(), target.serviceAccountPath)
        : 'env/args',
      appCount: appsSnap.size,
      apps: {},
      totals: {
        ok: 0,
        warn: 0,
        error: 0,
      },
    }

    for (const doc of appsSnap.docs) {
      const id = doc.id
      const data = doc.data() || {}

      const entry = {
        id,
        ok: true,
        checks: [],
        listedObjects: undefined,
        legacy: {
          wordmark_url:
            typeof data.wordmark_url === 'string' ? data.wordmark_url : undefined,
        },
      }

      for (const spec of expectedKinds) {
        const objectPath = spec.objectPath(id)
        const file = bucket.file(objectPath)
        const [exists] = await file.exists()

        const value = typeof data[spec.field] === 'string' ? data[spec.field] : ''

        const hasField = Boolean(value)
        const urlMatches = hasField
          ? urlIncludesEncodedPath(value, objectPath)
          : false

        const check = {
          kind: spec.kind,
          firestoreField: spec.field,
          firestoreHasUrl: hasField,
          firestoreUrl: hasField ? value : '',
          storageObjectPath: objectPath,
          storageExists: Boolean(exists),
          urlMatchesExpectedObject: urlMatches,
          status: 'ok',
          issues: [],
        }

        if (!exists) {
          check.status = 'error'
          check.issues.push('Missing storage object')
        }

        if (!hasField) {
          check.status = check.status === 'error' ? 'error' : 'warn'
          check.issues.push('Missing Firestore URL field')
        }

        if (hasField && !urlMatches) {
          check.status = check.status === 'error' ? 'error' : 'warn'
          check.issues.push('Firestore URL does not match expected object path')
        }

        if (check.status !== 'ok') entry.ok = false
        entry.checks.push(check)
      }

      if (args.list) {
        const [files] = await bucket.getFiles({ prefix: `apps/${id}/media/` })
        entry.listedObjects = files.map((f) => f.name).sort()
      }

      if (entry.ok) eco.totals.ok += 1
      else {
        const hasError = entry.checks.some((c) => c.status === 'error')
        if (hasError) eco.totals.error += 1
        else eco.totals.warn += 1
      }

      eco.apps[id] = entry
    }

    report.ecosystems[target.ecosystemId] = eco
    report.totals.apps += eco.appCount
    report.totals.ok += eco.totals.ok
    report.totals.warn += eco.totals.warn
    report.totals.error += eco.totals.error
  }

  const outPath = path.resolve(String(args.out || 'temp/app-media-audit.json'))
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')

  console.log(`Wrote: ${outPath}`)
  console.log(`Ecosystems: ${report.totals.ecosystems}`)
  console.log(`Apps: ${report.totals.apps}`)
  console.log(`OK: ${report.totals.ok}  WARN: ${report.totals.warn}  ERROR: ${report.totals.error}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
