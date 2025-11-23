#!/usr/bin/env tsx
/**
 * Normalize chefs.created_at from string → Firestore Timestamp
 *
 * Usage:
 *   tsx scripts/migrate-chefs-created-at.ts \
 *     --project misebox-78f9c \
 *     --sa packages/ecosystem/fireux-misebox/config/service-account.json \
 *     [--appId misebox-app --mirror] [--dry] [--no-touch] [--backup]
 */
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'

type Flags = {
  project: string
  sa: string
  appId?: string
  mirror?: boolean
  dry?: boolean
  noTouch?: boolean
  backup?: boolean
}
function flags(): Flags {
  const args = process.argv.slice(2)
  function getVal(k: string) {
    const i = args.indexOf(k)
    return i >= 0 ? args[i + 1] : undefined
  }
  return {
    project: getVal('--project')!,
    sa: getVal('--sa')!,
    appId: getVal('--appId'),
    mirror: args.includes('--mirror'),
    dry: args.includes('--dry'),
    noTouch: args.includes('--no-touch'),
    backup: args.includes('--backup'),
  }
}

function isString(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0
}

async function fixCollection(
  path: string,
  db: FirebaseFirestore.Firestore,
  opts: Flags
) {
  const snap = await db.collection(path).get()
  let processed = 0,
    updated = 0,
    skipped = 0,
    failed = 0

  for (const doc of snap.docs) {
    processed++
    const d = doc.data() as any
    const ca = d.created_at
    if (!isString(ca)) {
      skipped++
      continue
    }

    // Parse date safely
    const dt = new Date(ca)
    if (Number.isNaN(dt.getTime())) {
      skipped++
      continue
    }

    const payload: Record<string, any> = {
      created_at: Timestamp.fromDate(dt),
    }
    if (opts.backup && d.created_at_iso_backup == null) {
      payload.created_at_iso_backup = ca
    }
    if (!opts.noTouch) {
      payload.updated_at = FieldValue.serverTimestamp()
    }

    if (opts.dry) {
      console.log(`DRY ${path}/${doc.id}`, payload)
      updated++
      continue
    }

    try {
      await doc.ref.update(payload)
      updated++
    } catch (e) {
      failed++
      console.error(`✖ ${path}/${doc.id}`, e)
    }
  }

  console.log(
    `\n${path}: processed=${processed} updated=${updated} skipped=${skipped} failed=${failed}`
  )
}

async function main() {
  const f = flags()
  if (!f.project || !f.sa) {
    console.log(
      'Usage: tsx scripts/migrate-chefs-created-at.ts --project <id> --sa <service-account.json> [--appId <id> --mirror] [--dry] [--no-touch] [--backup]'
    )
    process.exit(1)
  }

  const app = initializeApp({
    credential: cert(JSON.parse(readFileSync(f.sa, 'utf8'))),
    projectId: f.project,
  })
  const db = getFirestore(app)

  console.log(
    `▶ Normalizing created_at (chefs) in ${f.project}${f.dry ? ' [DRY RUN]' : ''}`
  )
  await fixCollection('chefs', db, f)
  if (f.mirror) {
    if (!f.appId) {
      console.warn(
        '⚠ --mirror set but no --appId provided; skipping mirror collection'
      )
    } else {
      await fixCollection(`apps/${f.appId}/chefs`, db, f)
    }
  }
  console.log('\n✅ Done')
}

main().catch((e) => {
  console.error('💥 Unhandled:', e)
  process.exit(1)
})
