#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import admin from 'firebase-admin'

function parseArgs() {
  const args = {}
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.split('=')
    const key = k.replace(/^--/, '')
    args[key] = v ?? true
  }
  return args
}

async function main() {
  const args = parseArgs()
  const projectId = args.project
  const keyPath = args.key || args.keyfile || args.keyFile
  const collection = args.collection
  const creatorId = args.creatorId || args.creator_id || ''
  const commit = !!args.commit

  if (!projectId) {
    console.error('Missing --project=PROJECT_ID')
    process.exit(2)
  }
  if (!keyPath) {
    console.error('Missing --key=path/to/service-account.json')
    process.exit(2)
  }
  if (!collection) {
    console.error('Missing --collection=COLLECTION_NAME')
    process.exit(2)
  }

  const absoluteKey = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath)
  if (!fs.existsSync(absoluteKey)) {
    console.error('Service account key file not found:', absoluteKey)
    process.exit(2)
  }

  admin.initializeApp({
    credential: admin.credential.cert(require(absoluteKey)),
    projectId,
  })

  const db = admin.firestore()
  console.log(`[backfill] Scanning collection: ${collection}`)

  const colRef = db.collection(collection)
  const docRefs = await colRef.listDocuments()
  console.log(`[backfill] Found ${docRefs.length} documents (iterating)`)

  let processed = 0
  let updated = 0

  for (const docRef of docRefs) {
    processed++
    const snap = await docRef.get()
    if (!snap.exists) continue
    const data = snap.data() || {}
    if (data.creator_id) continue

    console.log(`[backfill] Missing creator_id in ${collection}/${docRef.id}`)
    if (commit) {
      await docRef.update({ creator_id: creatorId })
      updated++
    }
  }

  console.log(`[backfill] done processed=${processed} updated=${updated} commit=${commit}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
