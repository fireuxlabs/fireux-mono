#!/usr/bin/env node
/*
  Migrate BuenoHost property root documents to the property identity/manual shape.

  Usage:
    node scripts/migrations/migrate-buenohost-property-shape.mjs
    node scripts/migrations/migrate-buenohost-property-shape.mjs --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, deleteApp, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from '../_lib/args.mjs'
import {
  buenoHostManualSectionTitles,
  buenoHostPropertyShape,
} from './_buenohost-property-shape-data.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const PROJECT_ID = 'fireux-2005'
const DATABASE_ID = 'buenohost'
const ACTOR = 'system:migrate-buenohost-property-shape'
const APP_ID = 'buenohost'
const LEGACY_SUBCOLLECTIONS = ['guest_guides', 'guest_messages', 'maintainers']

async function loadServiceAccount(pathLike) {
  const raw = await readFile(resolve(REPO_ROOT, pathLike), 'utf8')
  return cert(JSON.parse(raw))
}

function stamp(now) {
  return {
    at: now,
    by: ACTOR,
    app_id: APP_ID,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const serviceAccountPath = String(args['service-account'] || SERVICE_ACCOUNT_PATH)
  const projectId = String(args.project || PROJECT_ID)
  const databaseId = String(args.database || DATABASE_ID)
  const property = buenoHostPropertyShape

  const app = initializeApp({
    credential: await loadServiceAccount(serviceAccountPath),
    projectId,
  })
  const db = getFirestore(app, databaseId)
  const now = Timestamp.now()
  const updated = stamp(now)
  const ref = db.collection('properties').doc(property.id)

  const rootPatch = {
    id: property.id,
    portfolio_id: property.portfolio_id,
    identity: property.identity,
    status: 'active',
    created: updated,
    updated,
  }

  const sectionWrites = Object.entries(property.manual).map(([id, fields], index) => {
    const [title, icon] = buenoHostManualSectionTitles[id] || [id, 'i-lucide-info']
    return {
      id,
      fields,
      ref: ref.collection('manual_sections').doc(id),
      patch: {
        id,
        title,
        icon,
        fields,
        sort_order: (index + 1) * 10,
        updated,
      },
    }
  })

  console.log('[migrate] BuenoHost property shape', {
    projectId,
    databaseId,
    commit,
    propertyPath: ref.path,
    manualSections: sectionWrites.length,
  })

  if (!commit) {
    console.log('[dry-run] set', ref.path, rootPatch)
    for (const write of sectionWrites) {
      console.log('[dry-run] set', `${ref.path}.manual.${write.id}`, write.fields)
      console.log('[dry-run] set', write.ref.path, write.patch)
    }
  } else {
    await ref.set(rootPatch)
    for (const write of sectionWrites) {
      await ref.set({ manual: { [write.id]: write.fields } }, { merge: true })
      await write.ref.set(write.patch, { merge: true })
    }
    for (const subcollectionId of LEGACY_SUBCOLLECTIONS) {
      const docs = await ref.collection(subcollectionId).listDocuments()
      for (const doc of docs) await db.recursiveDelete(doc)
    }
  }

  await deleteApp(app)
  console.log('[migrate] complete', { commit, writes: sectionWrites.length * 2 + 1 })
}

main().catch((error) => {
  console.error('[migrate] failed')
  console.error(error)
  process.exit(1)
})
