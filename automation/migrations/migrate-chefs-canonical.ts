#!/usr/bin/env tsx

/**
 * Migrate Chefs to Canonical Model
 *
 * Normalizes existing Chef docs to the slim canonical shape:
 *   - id: string (document id)
 *   - name: string (prefers `name`, falls back to `chef_name`)
 *   - avatar: string | null (prefers `avatar`, falls back to `avatarUrl`)
 *   - created_at: Timestamp | string | null (preserved if present; set if missing)
 *   - updated_at: serverTimestamp() (always updated on write)
 *   - Optional canonical fields preserved if present: title, bioShort, bioLong, specialties, available, gallery
 *
 * Additionally cleans legacy/alias fields:
 *   - Drops: uid, chef_name, avatarUrl, bio_short, bio_long
 *   - Promotes: bio_short -> bioShort, bio_long -> bioLong
 *
 * Also supports normalizing app mirror collection at: apps/{appId}/chefs
 *
 * Usage:
 *   pnpm dlx tsx scripts/migrate-chefs-canonical.ts <project> [--dry-run] [--only-global] [--include-mirror]
 * Examples:
 *   tsx scripts/migrate-chefs-canonical.ts misebox --dry-run
 *   tsx scripts/migrate-chefs-canonical.ts misebox --include-mirror
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROJECTS = {
  fireux: {
    name: 'FireUX',
    serviceAccountPath: resolve(
      __dirname,
      '../projects/fireux/fireux-app/config/service-account.json'
    ),
    projectId: 'fireux-2005',
    appId: 'fireux-app',
  },
  misebox: {
    name: 'MiseBox',
    serviceAccountPath: resolve(
      __dirname,
      '../packages/ecosystem/fireux-misebox/config/service-account.json'
    ),
    projectId: 'misebox-78f9c',
    appId: 'misebox-app',
  },
  cleanbox: {
    name: 'CleanBox',
    serviceAccountPath: resolve(
      __dirname,
      '../packages/ecosystem/fireux-cleanbox/config/service-account.json'
    ),
    projectId: 'cleanbox-f15bc',
    appId: 'cleanbox-app',
  },
} as const

type ProjectKey = keyof typeof PROJECTS

function getArgFlags() {
  const args = process.argv.slice(2)
  const project = args[0] as ProjectKey
  const dryRun = args.includes('--dry-run')
  const onlyGlobal = args.includes('--only-global')
  const includeMirror = args.includes('--include-mirror')
  return { project, dryRun, onlyGlobal, includeMirror }
}

function isTruthyString(s: unknown): s is string {
  return typeof s === 'string' && s.trim().length > 0
}

function needsNormalization(data: any) {
  // Decide quickly whether a doc needs updates
  const flags = {
    hasUid: 'uid' in data,
    hasAvatarUrlAlias: 'avatarUrl' in data && !isTruthyString(data.avatar),
    hasChefNameAlias: 'chef_name' in data && !isTruthyString(data.name),
    hasBioShortLegacy: 'bio_short' in data && !('bioShort' in data),
    hasBioLongLegacy: 'bio_long' in data && !('bioLong' in data),
    missingIdField: !isTruthyString(data.id),
    missingCreatedAt: !('created_at' in data),
  }
  return (
    flags.hasUid ||
    flags.hasAvatarUrlAlias ||
    flags.hasChefNameAlias ||
    flags.hasBioShortLegacy ||
    flags.hasBioLongLegacy ||
    flags.missingIdField ||
    flags.missingCreatedAt
  )
}

function deriveName(data: any): string | undefined {
  if (isTruthyString(data.name)) return data.name
  if (isTruthyString(data.chef_name)) return data.chef_name
  return undefined
}

function deriveAvatar(data: any): string | null | undefined {
  if (isTruthyString(data.avatar)) return data.avatar
  if (isTruthyString(data.avatarUrl)) return data.avatarUrl
  return null
}

function promoteBioShort(data: any): string | undefined {
  if (isTruthyString(data.bioShort)) return data.bioShort
  if (isTruthyString(data.bio_short)) return data.bio_short
  return undefined
}

function promoteBioLong(data: any): string | undefined {
  if (isTruthyString(data.bioLong)) return data.bioLong
  if (isTruthyString(data.bio_long)) return data.bio_long
  return undefined
}

function collectLegacyDeletes(data: any): Record<string, any> {
  const deletes: Record<string, any> = {}
  if ('uid' in data) deletes.uid = FieldValue.delete()
  if ('chef_name' in data) deletes.chef_name = FieldValue.delete()
  if ('avatarUrl' in data) deletes.avatarUrl = FieldValue.delete()
  if ('bio_short' in data) deletes.bio_short = FieldValue.delete()
  if ('bio_long' in data) deletes.bio_long = FieldValue.delete()
  return deletes
}

function buildUpdateForChef(data: any, id: string) {
  const updates: Record<string, any> = {}

  // id (for UI parity)
  if (!isTruthyString(data.id)) {
    updates.id = id
  }

  // name
  const name = deriveName(data)
  if (isTruthyString(name) && data.name !== name) {
    updates.name = name
  }

  // avatar
  const avatar = deriveAvatar(data)
  if (avatar !== undefined && data.avatar !== avatar) {
    updates.avatar = avatar
  }

  // bioShort / bioLong promotion
  const bioShort = promoteBioShort(data)
  if (isTruthyString(bioShort) && data.bioShort !== bioShort) {
    updates.bioShort = bioShort
  }

  const bioLong = promoteBioLong(data)
  if (isTruthyString(bioLong) && data.bioLong !== bioLong) {
    updates.bioLong = bioLong
  }

  // timestamps
  if (!('created_at' in data)) {
    updates.created_at = FieldValue.serverTimestamp()
  }
  updates.updated_at = FieldValue.serverTimestamp()

  // Legacy field drops
  const deletes = collectLegacyDeletes(data)

  return { updates, deletes }
}

async function migrateCollection(
  db: FirebaseFirestore.Firestore,
  path: string,
  dryRun: boolean
) {
  const snap = await db.collection(path).get()
  let updated = 0
  let skipped = 0
  let processed = 0

  const batchSize = 400
  let batch = db.batch()
  let opsInBatch = 0

  for (const doc of snap.docs) {
    processed++
    const data = doc.data() as any
    if (!needsNormalization(data)) {
      skipped++
      continue
    }
    const { updates, deletes } = buildUpdateForChef(data, doc.id)
    const payload = { ...updates, ...deletes }

    // Nothing to do?
    if (Object.keys(payload).length === 0) {
      skipped++
      continue
    }

    if (dryRun) {
      console.log(`DRY-RUN ${path}/${doc.id}`, payload)
      updated++
      continue
    }

    batch.update(doc.ref, payload)
    opsInBatch++
    updated++

    if (opsInBatch >= batchSize) {
      await batch.commit()
      batch = db.batch()
      opsInBatch = 0
    }
  }

  if (!dryRun && opsInBatch > 0) {
    await batch.commit()
  }

  return { processed, updated, skipped }
}

async function main() {
  const { project, dryRun, onlyGlobal, includeMirror } = getArgFlags()

  if (!project || !PROJECTS[project]) {
    console.log(
      'Usage: tsx scripts/migrate-chefs-canonical.ts <project> [--dry-run] [--only-global] [--include-mirror]'
    )
    console.log(`Projects: ${Object.keys(PROJECTS).join(', ')}`)
    process.exit(1)
  }

  const config = PROJECTS[project]
  console.log(
    `\n👨‍🍳 Migrating Chefs → Canonical for ${config.name} (${config.projectId})`
  )
  console.log(`📁 Service Account: ${config.serviceAccountPath}`)
  if (dryRun) console.log('🧪 DRY RUN: no writes will be performed')

  const serviceAccount = JSON.parse(
    readFileSync(config.serviceAccountPath, 'utf8')
  )
  const app = initializeApp(
    { credential: cert(serviceAccount), projectId: config.projectId },
    config.projectId
  )
  const db = getFirestore(app)

  // Global chefs
  const globalRes = await migrateCollection(db, 'chefs', dryRun)
  console.log(
    `\n🌐 Global chefs → processed=${globalRes.processed} updated=${globalRes.updated} skipped=${globalRes.skipped}`
  )

  if (!onlyGlobal && includeMirror) {
    const mirrorPath = `apps/${config.appId}/chefs`
    const mirrorRes = await migrateCollection(db, mirrorPath, dryRun)
    console.log(
      `🏷️  App mirror (${mirrorPath}) → processed=${mirrorRes.processed} updated=${mirrorRes.updated} skipped=${mirrorRes.skipped}`
    )
  } else {
    console.log('\nℹ️ Skipping app mirror (use --include-mirror to include)')
  }

  console.log('\n✅ Migration finished')
}

main().catch((e) => {
  console.error('💥 Unhandled error:', e)
  process.exit(1)
})
