#!/usr/bin/env node
/**
 * Deletes non-canonical app media objects listed in temp/app-media-trash.json.
 *
 * Safety:
 * - Dry-run by default (prints what would be deleted)
 * - Refuses to delete any object whose path is still referenced by Firestore app url fields
 *   unless --force is provided.
 *
 * Usage:
 *   pnpm delete:app-media-trash -- --ecosystem fireux            (dry-run)
 *   pnpm delete:app-media-trash -- --ecosystem fireux --apply    (delete)
 *   pnpm delete:app-media-trash -- --all --apply                (delete all ecosystems)
 *   pnpm delete:app-media-trash -- --ecosystem fireux --apply --force
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import admin from 'firebase-admin'

const workspaceRoot = process.cwd()
const trashPath = path.join(workspaceRoot, 'temp', 'app-media-trash.json')

if (!fs.existsSync(trashPath)) {
  console.error(`Missing ${trashPath}. Run pnpm list:app-media-trash first.`)
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(trashPath, 'utf8'))

const argv = process.argv.slice(2)
const hasFlag = (f) => argv.includes(f)
const flagValue = (name) => {
  const idx = argv.indexOf(name)
  if (idx === -1) return null
  return argv[idx + 1] ?? null
}

const targetEco = flagValue('--ecosystem')
const targetApp = flagValue('--app')
const apply = hasFlag('--apply')
const force = hasFlag('--force')
const all = hasFlag('--all')

if (!all && !targetEco) {
  console.error('Provide --ecosystem <id> or --all')
  process.exit(1)
}

function decodeObjectPathFromUrl(url) {
  try {
    const u = new URL(url)
    const match = u.pathname.match(/\/o\/(.+)$/)
    if (!match) return null
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

async function referencedTrashPathsForAppDoc(firestore, appId) {
  const snap = await firestore.collection('apps').doc(appId).get()
  const doc = snap.exists ? snap.data() : null
  if (!doc) return new Set()

  const fields = [
    'avatar_url',
    'logo_url',
    'wordmark_url',
    'wordmark_light_url',
    'wordmark_dark_url',
  ]

  const referenced = new Set()
  for (const f of fields) {
    const raw = doc[f]
    if (typeof raw !== 'string' || !raw) continue
    const obj = decodeObjectPathFromUrl(raw)
    if (obj) referenced.add(obj)
  }

  return referenced
}

async function deleteObjects(bucket, names) {
  // Delete sequentially to keep logs readable and avoid hammering.
  for (const name of names) {
    await bucket.file(name).delete({ ignoreNotFound: true })
  }
}

async function main() {
  const ecosystems = data.ecosystems ?? {}
  const ecoIds = all ? Object.keys(ecosystems) : [targetEco]

  let planned = 0
  let deleted = 0
  let skippedReferenced = 0

  for (const ecoId of ecoIds) {
    const eco = ecosystems[ecoId]
    if (!eco) {
      console.warn(`[skip] unknown ecosystem: ${ecoId}`)
      continue
    }

    const projectId = eco.projectId
    const bucketName = eco.bucket
    const saRel = eco.serviceAccountPath

    if (!projectId || !bucketName || !saRel) {
      console.warn(`[skip] ${ecoId}: missing projectId/bucket/serviceAccountPath in temp/app-media-trash.json`)
      continue
    }

    const saPath = path.join(workspaceRoot, saRel)
    if (!fs.existsSync(saPath)) {
      console.warn(`[skip] ${ecoId}: missing service account at ${saRel}`)
      continue
    }

    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(JSON.parse(fs.readFileSync(saPath, 'utf8'))),
        projectId,
        storageBucket: bucketName,
      },
      `delete-trash-${ecoId}`
    )

    const bucket = app.storage().bucket()
    const firestore = app.firestore()

    const apps = eco.apps ?? {}
    const appIds = targetApp ? [targetApp] : Object.keys(apps)

    console.log(`\n== ${ecoId} (${projectId}) bucket=${bucketName}`)

    for (const appId of appIds) {
      const entry = apps[appId]
      if (!entry) {
        console.warn(`- [skip] ${appId}: not present in temp/app-media-trash.json`)
        continue
      }

      const trash = Array.isArray(entry.trash) ? entry.trash : []
      if (!trash.length) {
        console.log(`- ${appId}: nothing to delete`)
        continue
      }

      const referenced = await referencedTrashPathsForAppDoc(firestore, appId)

      const toDelete = []
      const blocked = []
      for (const obj of trash) {
        if (!force && referenced.has(obj)) blocked.push(obj)
        else toDelete.push(obj)
      }

      planned += toDelete.length
      skippedReferenced += blocked.length

      console.log(`- ${appId}: will delete=${toDelete.length} blocked=${blocked.length}${apply ? '' : ' (dry-run)'}`)
      if (blocked.length) {
        console.log(`  blocked (still referenced by Firestore app URLs):`)
        for (const b of blocked) console.log(`  - ${b}`)
      }
      if (toDelete.length) {
        console.log(`  ${apply ? 'deleting' : 'would delete'}:`)
        for (const d of toDelete) console.log(`  - ${d}`)
      }

      if (apply && toDelete.length) {
        await deleteObjects(bucket, toDelete)
        deleted += toDelete.length
      }
    }
  }

  console.log(`\nSummary: planned=${planned} deleted=${deleted} blockedReferenced=${skippedReferenced} mode=${apply ? 'APPLY' : 'DRY-RUN'}${force ? ' force=true' : ''}`)
  if (!apply) {
    console.log('Re-run with --apply to actually delete.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
