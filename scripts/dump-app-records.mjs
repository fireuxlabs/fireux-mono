#!/usr/bin/env node
/*
  Dump each app's main Firestore record:
    - apps/{appId} (document)

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path)
    - Or Google ADC (gcloud): application-default login

  Usage:
    node scripts/dump-app-records.mjs --out-dir <dir> [--max-apps 0]

  Options:
    --out-dir <dir>      Output directory (default: temp/dumps/apps-<YYYY-MM-DD>)
    --max-apps <n>       Max apps to export (0 = no limit)
    --help, -h           Print help
*/

import { createRequire } from 'node:module'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve, join } from 'node:path'

const requireFromCwd = createRequire(resolve(process.cwd(), 'package.json'))

async function loadFirebaseAdmin() {
  const adminApp = await import(requireFromCwd.resolve('firebase-admin/app'))
  const adminFirestore = await import(
    requireFromCwd.resolve('firebase-admin/firestore')
  )

  return {
    applicationDefault: adminApp.applicationDefault,
    cert: adminApp.cert,
    getApps: adminApp.getApps,
    initializeApp: adminApp.initializeApp,
    FieldPath: adminFirestore.FieldPath,
    getFirestore: adminFirestore.getFirestore,
  }
}

const argv = process.argv.slice(2)
const args = new Set(argv)

function getArgValue(flag) {
  const idx = argv.indexOf(flag)
  if (idx === -1) return undefined
  const next = argv[idx + 1]
  if (!next || next.startsWith('--')) return undefined
  return next
}

function usage(exitCode = 0) {
  console.log('\nDump app documents (apps/{appId}) to JSON')
  console.log('\nUsage:')
  console.log('  node scripts/dump-app-records.mjs --out-dir <dir> [--max-apps 0]')
  console.log('\nOptions:')
  console.log(
    '  --out-dir <dir>      Output directory (default: temp/dumps/apps-<YYYY-MM-DD>)'
  )
  console.log('  --max-apps <n>       Max apps to export (0 = no limit)')
  console.log('  --help, -h           Print help')
  console.log('')
  process.exit(exitCode)
}

if (args.has('--help') || args.has('-h')) usage(0)

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

const outDirArg = getArgValue('--out-dir')
const outDir = outDirArg
  ? isAbsolute(outDirArg)
    ? outDirArg
    : resolve(process.cwd(), outDirArg)
  : resolve(process.cwd(), 'temp', 'dumps', `apps-${todayIsoDate()}`)

const maxAppsRaw = getArgValue('--max-apps')
const maxApps = Math.max(0, Number(maxAppsRaw ?? 0) || 0)

async function loadServiceAccount() {
  const fromEnvJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
  if (fromEnvJson) {
    try {
      return JSON.parse(fromEnvJson)
    } catch (error) {
      throw new Error(
        `Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${error?.message ?? String(error)}`
      )
    }
  }

  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  if (gac) {
    const path = isAbsolute(gac) ? gac : resolve(process.cwd(), gac)
    try {
      const raw = await fs.readFile(path, 'utf8')
      return JSON.parse(raw)
    } catch (error) {
      throw new Error(
        `Unable to read GOOGLE_APPLICATION_CREDENTIALS at "${path}": ${error?.message ?? String(error)}`
      )
    }
  }

  return null
}

function safeFileSegment(value) {
  return String(value)
    .trim()
    .replaceAll('/', '_')
    .replaceAll('..', '_')
    .replaceAll(' ', '_')
}

async function writeJson(path, data) {
  await fs.mkdir(resolve(path, '..'), { recursive: true })
  await fs.writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

async function listApps(db, FieldPath) {
  const snapshot = await db
    .collection('apps')
    .orderBy(FieldPath.documentId())
    .get()

  return snapshot.docs.map((d) => ({ id: d.id, ref: d.ref, data: d.data() }))
}

async function main() {
  const { applicationDefault, cert, getApps, initializeApp, FieldPath, getFirestore } =
    await loadFirebaseAdmin()

  const existingApps = getApps()
  const hasApp = Array.isArray(existingApps) && existingApps.length > 0

  const serviceAccount = await loadServiceAccount()

  if (!hasApp) {
    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    })
  }

  const db = getFirestore()

  await fs.mkdir(outDir, { recursive: true })

  const apps = await listApps(db, FieldPath)
  const selectedApps = maxApps > 0 ? apps.slice(0, maxApps) : apps

  const index = {
    ok: true,
    generatedAt: new Date().toISOString(),
    project: serviceAccount?.project_id ?? null,
    outDir,
    appCount: selectedApps.length,
    apps: [],
  }

  for (const app of selectedApps) {
    const appId = app.id
    const fileName = `${safeFileSegment(appId)}.app.json`
    const filePath = join(outDir, fileName)

    await writeJson(filePath, {
      ok: true,
      generatedAt: new Date().toISOString(),
      appId,
      app: { id: appId, ...app.data },
    })

    index.apps.push({ appId, file: fileName })
  }

  await writeJson(join(outDir, 'index.json'), index)

  console.log('✅ App record dump complete')
  console.log(`- Output dir: ${outDir}`)
  console.log(`- Apps dumped: ${index.appCount}`)
  if (index.project) console.log(`- Project: ${index.project}`)
  for (const entry of index.apps) {
    console.log(`  - ${entry.appId}`)
  }
}

main().catch((error) => {
  console.error('❌ Dump failed')
  console.error(error)
  process.exit(1)
})
