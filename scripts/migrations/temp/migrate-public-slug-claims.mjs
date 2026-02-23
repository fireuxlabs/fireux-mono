#!/usr/bin/env node
/*
  TEMP migration: backfill canonical public slug claims.

  Usage:
    node scripts/migrations/temp/migrate-public-slug-claims.mjs --project <projectId> --stack <fireux|misebox|cleanbox> [--entity user,place] [--commit]

  Notes:
    - Dry-run by default.
    - Writes claims to `slug_claims/{entity}:{slug}`.
    - Temporary script: keep out of runtime and main migration runner.
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../../_lib/args.mjs'

const CANONICAL_SLUG_CLAIMS_COLLECTION = 'slug_claims'

const APP_IDS_BY_STACK = {
  fireux: ['fireux-app'],
  misebox: ['misebox-app'],
  cleanbox: ['cleanbox-app'],
}

const TARGETS = [
  {
    entityKey: 'user',
    ownerCollection: 'users',
    collectionPathTemplate: 'users',
    slugField: 'handle',
    normalizedField: 'handle_normalized',
    legacyClaimCollection: 'handles',
    legacyClaimOwnerField: 'uid',
    stacks: ['fireux', 'misebox', 'cleanbox'],
  },
  {
    entityKey: 'place',
    ownerCollection: 'places',
    collectionPathTemplate: 'places',
    slugField: 'slug',
    stacks: ['fireux', 'misebox', 'cleanbox'],
  },
  {
    entityKey: 'ingredient',
    ownerCollection: 'ingredients',
    collectionPathTemplate: 'ingredients',
    slugField: 'slug',
    stacks: ['fireux', 'misebox', 'cleanbox'],
  },
  {
    entityKey: 'blog',
    ownerCollection: 'blogs',
    collectionPathTemplate: 'blogs',
    slugField: 'slug',
    fallbackToDocId: true,
    stacks: ['fireux', 'misebox', 'cleanbox'],
  },
  {
    entityKey: 'product',
    ownerCollection: 'products',
    collectionPathTemplate: 'apps/{appId}/products',
    slugField: 'slug',
    appScoped: true,
    stacks: ['fireux', 'misebox', 'cleanbox'],
  },
]

function listTargets({ stack, entityKeys = null }) {
  const keys = Array.isArray(entityKeys) && entityKeys.length ? new Set(entityKeys) : null
  const appIds = APP_IDS_BY_STACK[stack] || []
  const rows = []

  for (const target of TARGETS) {
    if (!target.stacks.includes(stack)) continue
    if (keys && !keys.has(target.entityKey)) continue

    if (target.appScoped) {
      for (const appId of appIds) {
        rows.push({
          ...target,
          appId,
          collectionPath: target.collectionPathTemplate.replace('{appId}', appId),
        })
      }
      continue
    }

    rows.push({
      ...target,
      appId: null,
      collectionPath: target.collectionPathTemplate,
    })
  }

  return rows
}

function buildClaimDocId(entityKey, slug) {
  return `${String(entityKey || '').trim()}:${String(slug || '').trim().toLowerCase()}`
}

function toCanonicalSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const stack = typeof args.stack === 'string' ? String(args.stack).trim().toLowerCase() : ''
const commit = Boolean(args.commit)
const syncLegacyHandles = Boolean(args['sync-legacy-handles'])
const pageSize = Math.min(Math.max(Number(args.pageSize || 250), 1), 500)
const limit = args.limit ? Math.max(Number(args.limit), 1) : null
const entityKeys =
  typeof args.entity === 'string'
    ? String(args.entity)
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    : null

if (help) {
  console.log('\nTEMP Firestore migration: canonical public slug claims\n')
  console.log('Usage:')
  console.log('  node scripts/migrations/temp/migrate-public-slug-claims.mjs --project <projectId> --stack <fireux|misebox|cleanbox> [--entity user,place] [--commit]')
  console.log('\nFlags:')
  console.log('  --commit               Apply writes (default dry-run)')
  console.log('  --entity <csv>         Filter entities (user,place,ingredient,blog,product)')
  console.log('  --sync-legacy-handles  Also backfill users -> handles/{handle}')
  console.log('  --pageSize <n>         Page size (default 250, max 500)')
  console.log('  --limit <n>            Stop after N owner docs')
  process.exit(0)
}

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

if (!['fireux', 'misebox', 'cleanbox'].includes(stack)) {
  console.error('Missing/invalid --stack. Use one of: fireux, misebox, cleanbox.')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

const targets = listTargets({ stack, entityKeys })
if (!targets.length) {
  console.error('No targets matched.', { stack, entityKeys })
  process.exit(2)
}

console.log('[migrate-temp] public-slug-claims start', {
  projectId,
  stack,
  commit,
  syncLegacyHandles,
  pageSize,
  limit,
  targets: targets.map((t) => ({
    entity: t.entityKey,
    collectionPath: t.collectionPath,
    appId: t.appId || null,
    slugField: t.slugField,
  })),
})

let totalProcessed = 0
let totalUpdated = 0
let totalSkipped = 0
let totalConflicts = 0

for (const target of targets) {
  let processed = 0
  let updated = 0
  let skipped = 0
  let conflicts = 0
  let lastDoc = null

  while (true) {
    if (limit && totalProcessed >= limit) break

    let q = db.collection(target.collectionPath).orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && totalProcessed >= limit) break

      totalProcessed += 1
      processed += 1

      const data = docSnap.data() || {}
      const rawSlug = target.fallbackToDocId
        ? String(data[target.slugField] || docSnap.id || '')
        : String(data[target.slugField] || '')
      const slug = toCanonicalSlug(rawSlug)

      if (!slug) {
        skipped += 1
        totalSkipped += 1
        continue
      }

      const claimRef = db
        .collection(CANONICAL_SLUG_CLAIMS_COLLECTION)
        .doc(buildClaimDocId(target.entityKey, slug))
      const claimSnap = await claimRef.get()
      const existing = claimSnap.exists ? (claimSnap.data() || {}) : {}
      const existingOwnerId = String(existing.owner_id || '').trim()
      const existingEntityKey = String(existing.entity_key || '').trim()

      if (claimSnap.exists && (existingOwnerId !== docSnap.id || existingEntityKey !== target.entityKey)) {
        conflicts += 1
        totalConflicts += 1
        console.warn('[conflict]', {
          claim: claimRef.path,
          entityKey: target.entityKey,
          slug,
          ownerId: docSnap.id,
          existingOwnerId,
          existingEntityKey,
        })
        continue
      }

      const ownerPatch = {}
      if (target.normalizedField) {
        const currentNormalized = String(data[target.normalizedField] || '').trim()
        if (currentNormalized !== slug) {
          ownerPatch[target.normalizedField] = slug
        }
      }

      const shouldWrite =
        Object.keys(ownerPatch).length > 0 ||
        !claimSnap.exists ||
        (syncLegacyHandles && target.legacyClaimCollection)

      if (!shouldWrite) {
        skipped += 1
        totalSkipped += 1
        continue
      }

      const claimPatch = {
        entity_key: target.entityKey,
        slug,
        owner_id: docSnap.id,
        owner_collection: target.ownerCollection,
        owner_collection_path: target.collectionPath,
        owner_field: target.slugField,
        app_id: target.appId || '',
        stack,
        migrated_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      }
      if (!claimSnap.exists) {
        claimPatch.created_at = FieldValue.serverTimestamp()
      }

      if (!commit) {
        console.log('[dry-run]', {
          owner: docSnap.ref.path,
          slug,
          claim: claimRef.path,
          ownerPatch,
          syncLegacyHandle: Boolean(syncLegacyHandles && target.legacyClaimCollection),
        })
        updated += 1
        totalUpdated += 1
        continue
      }

      batch.set(claimRef, claimPatch, { merge: true })
      batchOps += 1

      if (Object.keys(ownerPatch).length > 0) {
        batch.set(docSnap.ref, ownerPatch, { merge: true })
        batchOps += 1
      }

      if (syncLegacyHandles && target.legacyClaimCollection) {
        const legacyRef = db.collection(target.legacyClaimCollection).doc(slug)
        const legacyPatch = {
          [target.legacyClaimOwnerField || 'owner_id']: docSnap.id,
          updated_at: FieldValue.serverTimestamp(),
        }
        if (!claimSnap.exists) legacyPatch.created_at = FieldValue.serverTimestamp()
        batch.set(legacyRef, legacyPatch, { merge: true })
        batchOps += 1
      }

      if (batchOps >= 350) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }

      updated += 1
      totalUpdated += 1
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
    if (snap.size < pageSize) break
  }

  console.log('[migrate-temp] target done', {
    entity: target.entityKey,
    collectionPath: target.collectionPath,
    appId: target.appId || null,
    processed,
    updated,
    skipped,
    conflicts,
    commit,
  })

  if (limit && totalProcessed >= limit) break
}

console.log('[migrate-temp] public-slug-claims done', {
  projectId,
  stack,
  commit,
  processed: totalProcessed,
  updated: totalUpdated,
  skipped: totalSkipped,
  conflicts: totalConflicts,
})

