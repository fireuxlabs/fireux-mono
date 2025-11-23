#!/usr/bin/env tsx
/**
 * Migrate Chefs: camelCase → snake_case for bio fields
 *
 * What it does (per doc):
 * - If `bioShort` exists → writes `bio_short` and deletes `bioShort`
 * - If `bioLong` exists  → writes `bio_long`  and deletes `bioLong`
 * - If `id` missing      → sets `id = <doc.id>`
 * - Always sets `updated_at = serverTimestamp()` (unless --no-touch)
 *
 * Safe: leaves every other field unchanged.
 *
 * Usage:
 *   tsx scripts/migrate-chefs-bio-casing.ts \
 *     --project misebox-78f9c \
 *     --sa ./packages/ecosystem/fireux-misebox/config/service-account.json \
 *     [--appId misebox-app] [--mirror] [--dry] [--no-touch]
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'

// --- args ---
type Flags = {
  project: string
  sa: string
  appId?: string
  mirror?: boolean
  dry?: boolean
  noTouch?: boolean
}
function parseFlags(): Flags {
  const a = process.argv.slice(2)
  const get = (k: string) => {
    const i = a.indexOf(`--${k}`)
    return i >= 0 ? a[i + 1] : undefined
  }
  return {
    project: get('project') ?? '',
    sa: get('sa') ?? '',
    appId: get('appId'),
    mirror: a.includes('--mirror'),
    dry: a.includes('--dry'),
    noTouch: a.includes('--no-touch'),
  }
}

// --- core transform for a single doc ---
function buildMutation(data: any, id: string, touchUpdatedAt: boolean) {
  const updates: Record<string, any> = {}
  const deletes: Record<string, any> = {}

  // id (UI parity)
  if (typeof data.id !== 'string' || data.id.trim() === '') {
    updates.id = id
  }

  // bioShort → bio_short
  if ('bioShort' in data) {
    // only write if source is a non-empty string
    if (typeof data.bioShort === 'string' && data.bioShort.length > 0) {
      updates.bio_short = data.bioShort
    } else {
      // if empty/invalid, still delete camel to keep schema clean
    }
    deletes.bioShort = FieldValue.delete()
  }

  // bioLong → bio_long
  if ('bioLong' in data) {
    if (typeof data.bioLong === 'string' && data.bioLong.length > 0) {
      updates.bio_long = data.bioLong
    }
    deletes.bioLong = FieldValue.delete()
  }

  if (touchUpdatedAt) {
    updates.updated_at = FieldValue.serverTimestamp()
  }

  // nothing to do?
  const hasOps = Object.keys(updates).length + Object.keys(deletes).length > 0
  return hasOps ? { ...updates, ...deletes } : null
}

async function migrateCollection(
  db: FirebaseFirestore.Firestore,
  path: string,
  dry: boolean,
  touchUpdatedAt: boolean
) {
  const snap = await db.collection(path).get()
  let processed = 0
  let updated = 0
  let skipped = 0

  const batchSize = 400
  let batch = db.batch()
  let ops = 0

  for (const doc of snap.docs) {
    processed++
    const data = doc.data()
    const payload = buildMutation(data, doc.id, touchUpdatedAt)

    if (!payload) {
      skipped++
      continue
    }

    if (dry) {
      console.log(`DRY ${path}/${doc.id}`, payload)
      updated++
      continue
    }

    batch.update(doc.ref, payload)
    ops++
    updated++

    if (ops >= batchSize) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (!dry && ops > 0) {
    await batch.commit()
  }

  return { processed, updated, skipped }
}

async function main() {
  const { project, sa, appId, mirror, dry, noTouch } = parseFlags()
  if (!project || !sa) {
    console.log(
      'Usage: tsx scripts/migrate-chefs-bio-casing.ts --project <projectId> --sa <serviceAccountPath> [--appId <appId>] [--mirror] [--dry] [--no-touch]'
    )
    process.exit(1)
  }

  console.log(`\n👨‍🍳 Chefs bio casing migration → ${project}`)
  console.log(`🔐 SA: ${sa}`)
  if (dry) console.log('🧪 DRY RUN (no writes)')

  const serviceAccount = JSON.parse(readFileSync(sa, 'utf8'))
  const app = initializeApp({ credential: cert(serviceAccount), projectId: project }, project)
  const db = getFirestore(app)

  // Global chefs
  const globalRes = await migrateCollection(db, 'chefs', dry ?? false, !noTouch)
  console.log(
    `\n🌐 chefs → processed=${globalRes.processed} updated=${globalRes.updated} skipped=${globalRes.skipped}`
  )

  // Optional mirror
  if (mirror) {
    if (!appId) {
      console.log('⚠️  --mirror set but no --appId provided. Skipping mirror.')
    } else {
      const p = `apps/${appId}/chefs`
      const mirrorRes = await migrateCollection(db, p, dry ?? false, !noTouch)
      console.log(
        `🏷️  ${p} → processed=${mirrorRes.processed} updated=${mirrorRes.updated} skipped=${mirrorRes.skipped}`
      )
    }
  }

  console.log('\n✅ Done.')
}

main().catch((e) => {
  console.error('💥 Unhandled error:', e)
  process.exit(1)
})
