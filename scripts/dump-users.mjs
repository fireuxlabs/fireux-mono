#!/usr/bin/env node
/*
  Dump a Firestore collection (defaults to /users) to a JSON file.

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path)
    - Or Google ADC (gcloud): application-default login

  Usage:
    node scripts/dump-users.mjs --out <path> [--collection users] [--page-size 500] [--max 0]

  Options:
    --out <path>          Output JSON path (default: temp/dumps/users-<YYYY-MM-DD>.json)
    --collection <name>   Firestore collection name (default: users)
    --page-size <n>       Page size for pagination (default: 500)
    --max <n>             Max docs to export (0 = no limit)
    --help, -h            Print help
*/

import { createRequire } from 'node:module'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

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
  console.log('\nDump a Firestore collection to JSON')
  console.log('\nUsage:')
  console.log(
    '  node scripts/dump-users.mjs --out <path> [--collection users] [--page-size 500] [--max 0]'
  )
  console.log('\nOptions:')
  console.log(
    '  --out <path>          Output JSON path (default: temp/dumps/users-<YYYY-MM-DD>.json)'
  )
  console.log('  --collection <name>   Collection name (default: users)')
  console.log('  --page-size <n>       Page size for pagination (default: 500)')
  console.log('  --max <n>             Max docs to export (0 = no limit)')
  console.log('  --help, -h            Print help')
  console.log('')
  process.exit(exitCode)
}

if (args.has('--help') || args.has('-h')) usage(0)

const collectionName = (getArgValue('--collection') ?? 'users').trim()

const pageSizeRaw = getArgValue('--page-size')
const pageSize = Math.max(1, Number(pageSizeRaw ?? 500) || 500)

const maxRaw = getArgValue('--max')
const maxDocs = Math.max(0, Number(maxRaw ?? 0) || 0)

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

const defaultOut = resolve(
  process.cwd(),
  'temp',
  'dumps',
  `${collectionName}-${todayIsoDate()}.json`
)

const outArg = getArgValue('--out')
const outPath = outArg
  ? isAbsolute(outArg)
    ? outArg
    : resolve(process.cwd(), outArg)
  : defaultOut

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

async function main() {
  if (!collectionName) throw new Error('Missing --collection name')

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

  const exported = []
  let lastDoc = null
  let fetched = 0

  for (;;) {
    let query = db
      .collection(collectionName)
      .orderBy(FieldPath.documentId())
      .limit(pageSize)

    if (lastDoc) query = query.startAfter(lastDoc)

    const snapshot = await query.get()
    if (snapshot.empty) break

    for (const docSnap of snapshot.docs) {
      exported.push({ id: docSnap.id, ...docSnap.data() })
      fetched += 1
      lastDoc = docSnap

      if (maxDocs > 0 && fetched >= maxDocs) break
    }

    if (maxDocs > 0 && fetched >= maxDocs) break
  }

  const payload = {
    ok: true,
    generatedAt: new Date().toISOString(),
    collection: collectionName,
    count: exported.length,
    docs: exported,
  }

  await fs.mkdir(resolve(outPath, '..'), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')

  console.log('✅ Dump complete')
  console.log(`- Collection: ${collectionName}`)
  console.log(`- Count: ${exported.length}`)
  console.log(`- Output: ${outPath}`)
  if (serviceAccount?.project_id) console.log(`- Project: ${serviceAccount.project_id}`)
}

main().catch((error) => {
  console.error('❌ Dump failed')
  console.error(error)
  process.exit(1)
})
