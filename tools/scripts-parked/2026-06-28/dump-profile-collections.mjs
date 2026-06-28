#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-28
// usage_note: parked one-off profile collection dump; restore only if reused.
/*
  Dump profile collections to JSON.
  Parked usage:
    node tools/scripts-parked/2026-06-28/dump-profile-collections.mjs --project <projectId> --out <dir>
*/
import fs from 'node:fs/promises'
import path from 'node:path'
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    const value = process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
      ? process.argv[++i]
      : 'true'
    args.set(key, value)
  }
}

const projectId = args.get('project')
const outDir = args.get('out') || 'temp/profile-dumps'

if (!projectId) {
  console.error('Missing --project <projectId>')
  process.exit(1)
}

const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const credential = credentialPath ? cert(credentialPath) : applicationDefault()

initializeApp({ credential, projectId })
const db = getFirestore()

const collections = ['agents', 'chefs', 'professionals', 'suppliers']

const isPlainObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value)

const serialize = (value) => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (Array.isArray(value)) {
    return value.map((entry) => serialize(entry))
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serialize(entry)])
    )
  }
  return value
}

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true })
}

const dumpCollection = async (name) => {
  const snapshot = await db.collection(name).get()
  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...serialize(doc.data()),
  }))
  const filePath = path.join(outDir, `${name}.json`)
  await fs.writeFile(filePath, JSON.stringify(docs, null, 2))
  return { name, count: docs.length, filePath }
}

const run = async () => {
  await ensureDir(outDir)
  const results = []
  for (const name of collections) {
    results.push(await dumpCollection(name))
  }
  console.log('Dump complete:')
  for (const result of results) {
    console.log(`- ${result.name}: ${result.count} docs -> ${result.filePath}`)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
