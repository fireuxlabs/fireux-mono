#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

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

    const id =
      extractFirst(text, /\bid\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bid\s*:\s*"([^"]+)"/)
    const projectId =
      extractFirst(text, /\bprojectId\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bprojectId\s*:\s*"([^"]+)"/)
    const storageBucket =
      extractFirst(text, /\bstorageBucket\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bstorageBucket\s*:\s*"([^"]+)"/)
    const databaseId =
      extractFirst(text, /\bdatabaseId\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bdatabaseId\s*:\s*"([^"]+)"/)
    const name =
      extractFirst(text, /\bname\s*:\s*'([^']+)'/) ??
      extractFirst(text, /\bname\s*:\s*"([^"]+)"/)

    if (!id || !projectId || !storageBucket) continue

    results.push({
      ecosystemId: id,
      ecosystemName: name || id,
      projectId,
      databaseId: databaseId || '',
      storageBucket,
      sourceFile: path.relative(repoRoot(), filePath),
    })
  }

  return results
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
- apps/{appId}/media/cover

Also validates Firestore URL fields match the expected object path.

Credential sources, in precedence order:
${firebaseAdminCredentialHelp().map((line) => `- ${line}`).join('\n')}

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
      databaseId: t.databaseId || '(default)',
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
    {
      kind: 'cover',
      objectPath: (id) => `apps/${id}/media/cover`,
      field: 'cover_url',
    },
  ]

  for (const target of targets) {
    const auth = await resolveFirebaseAdminCredential({
      args,
      scope: target.ecosystemId || target.projectId,
      projectId: target.projectId,
    })

    const app = initializeApp(
      {
        credential: auth.credential,
        projectId: target.projectId,
        storageBucket: target.storageBucket,
      },
      `audit:${target.projectId}`
    )

    const db = target.databaseId ? getFirestore(app, target.databaseId) : getFirestore(app)
    const bucket = getStorage(app).bucket(target.storageBucket)

    const appsSnap = await db.collection('apps').get()

    const eco = {
      ecosystemId: target.ecosystemId,
      ecosystemName: target.ecosystemName,
      projectId: target.projectId,
      databaseId: target.databaseId || '(default)',
      bucket: target.storageBucket,
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
      const media = data.media && typeof data.media === 'object' && !Array.isArray(data.media)
        ? data.media
        : {}

      const entry = {
        id,
        databaseId:
          typeof data.database_id === 'string' && data.database_id.trim()
            ? data.database_id.trim()
            : '',
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

        const value =
          typeof media[spec.field] === 'string'
            ? media[spec.field]
            : typeof data[spec.field] === 'string'
              ? data[spec.field]
              : ''

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
