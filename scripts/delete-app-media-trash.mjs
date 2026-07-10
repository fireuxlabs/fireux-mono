#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
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
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const workspaceRoot = process.cwd()
const trashPath = path.join(workspaceRoot, 'temp', 'app-media-trash.json')
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  printUsage()
  process.exit(0)
}

if (!fs.existsSync(trashPath)) {
  console.error(`Missing ${trashPath}. Run pnpm list:app-media-trash first.`)
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(trashPath, 'utf8'))

const targetEco = String(args.ecosystem || '').trim()
const targetApp = String(args.app || '').trim()
const apply = args.apply === true
const force = args.force === true
const all = args.all === true

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

    if (!projectId || !bucketName) {
      console.warn(`[skip] ${ecoId}: missing projectId/bucket in temp/app-media-trash.json`)
      continue
    }

    const auth = await resolveFirebaseAdminCredential({
      args,
      scope: ecoId || projectId,
      projectId,
    })

    const app = admin.initializeApp(
      {
        credential: auth.credential,
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

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/delete-app-media-trash.mjs (--ecosystem <id> | --all) [--app <appId>] [--apply] [--force] [--service-account <path>]',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
