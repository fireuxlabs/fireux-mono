/* eslint-disable no-console */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// ---------- CLI ----------
type Cli = {
  collection: string // e.g. "professionals"
  appId?: string // migrate overlays under apps/{appId}/{collection}
  allApps?: boolean // migrate all app overlays via collection group
  apply?: boolean // perform writes (otherwise dry-run)
  limit?: number // optional cap for testing
  dropLegacy?: boolean // if true, delete legacy arrays after mapping
}

function parseArgs(): Cli {
  const args = new Map<string, string | boolean>()
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.includes('=') ? a.split('=') : [a, 'true']
    args.set(k.replace(/^--/, ''), v === 'true' ? true : v)
  }
  const collection = String(args.get('collection') || '')
  if (!collection) {
    console.error('Missing --collection=<name>')
    process.exit(1)
  }
  const appId =
    typeof args.get('appId') === 'string'
      ? String(args.get('appId'))
      : undefined
  const allApps = args.get('allApps') === true
  const apply = args.get('apply') === true
  const dropLegacy = args.get('dropLegacy') === true
  const limit = args.get('limit') ? Number(args.get('limit')) : undefined
  return { collection, appId, allApps, apply, limit, dropLegacy }
}

// ---------- Admin init (env-friendly) ----------
function initAdmin() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT
    if (json) {
      const svc = JSON.parse(json)
      if (typeof svc.private_key === 'string') {
        svc.private_key = svc.private_key.replace(/\\n/g, '\n')
      }
      initializeApp({ credential: cert(svc) as any })
    } else {
      initializeApp() // GOOGLE_APPLICATION_CREDENTIALS or emulator
    }
  }
  return getFirestore()
}

// ---------- Helpers ----------
const tsNow = () => Timestamp.now()

type AnyDoc = Record<string, any>

type MigrationResult = {
  path: string
  changed: boolean
  writes: number
  before: Record<string, any>
  after: Record<string, any>
  notes: string[]
}

function mapExperienceArrays(
  data: AnyDoc,
  dropLegacy: boolean
): { after: AnyDoc; notes: string[]; changed: boolean } {
  const out: AnyDoc = { ...data }
  const notes: string[] = []
  let changed = false

  // Map kitchen_experience -> relevant_experience if target is missing
  if (
    !Array.isArray(out.relevant_experience) &&
    Array.isArray(out.kitchen_experience)
  ) {
    out.relevant_experience = out.kitchen_experience
    changed = true
    notes.push('mapped kitchen_experience → relevant_experience')
    if (dropLegacy) {
      delete out.kitchen_experience
      notes.push('dropped legacy kitchen_experience')
    }
  }

  // Map other_employment_experience -> other_experience if target is missing
  if (
    !Array.isArray(out.other_experience) &&
    Array.isArray(out.other_employment_experience)
  ) {
    out.other_experience = out.other_employment_experience
    changed = true
    notes.push('mapped other_employment_experience → other_experience')
    if (dropLegacy) {
      delete out.other_employment_experience
      notes.push('dropped legacy other_employment_experience')
    }
  }

  if (changed) {
    out.updated_at = tsNow()
  }

  return { after: out, notes, changed }
}

async function migrateQuery(
  db: ReturnType<typeof getFirestore>,
  query: FirebaseFirestore.Query,
  apply: boolean,
  dropLegacy: boolean,
  limit?: number
) {
  const bw = db.bulkWriter()
  bw.onWriteError((err) => {
    console.error('Write error:', err.documentRef.path, err.message)
    if (err.failedAttempts < 5) return true
    return false
  })

  const snap = await query.get()
  const docs = limit ? snap.docs.slice(0, limit) : snap.docs

  console.log(`Found ${docs.length} docs`)

  let changedCount = 0
  for (const d of docs) {
    const before = d.data()
    const { after, notes, changed } = mapExperienceArrays(before, dropLegacy)
    if (changed) {
      changedCount++
      if (apply) {
        bw.set(d.ref, after, { merge: true }) // merge to avoid clobbering unrelated fields
      }
      console.log(
        `[${apply ? 'APPLY' : 'DRY'}] ${d.ref.path} → ${notes.join(', ')}`
      )
    }
  }

  if (apply) await bw.close()
  console.log(
    `Done: changed ${changedCount}/${docs.length} ${
      apply ? '(writes committed)' : '(dry-run)'
    } \n`
  )
}

// ---------- Main ----------
async function main() {
  const { collection, appId, allApps, apply, limit, dropLegacy } = parseArgs()
  const db = initAdmin()

  console.log(
    `\n=== FireUX Professionals Experience Migration ===\nCollection: ${collection}\nOverlay appId: ${
      appId ?? '(none)'
    }\nAll apps (collectionGroup): ${allApps ? 'YES' : 'NO'}\nMode: ${
      apply ? 'APPLY' : 'DRY-RUN'
    }\nDrop legacy fields: ${dropLegacy ? 'YES' : 'NO'}\nLimit: ${
      limit ?? '(none)'
    }\n================================\n`
  )

  // 1) Core collection: {collection}/*
  await migrateQuery(db, db.collection(collection), apply, dropLegacy!, limit)

  // 2) App overlays
  if (allApps) {
    await migrateQuery(
      db,
      db.collectionGroup(collection),
      apply,
      dropLegacy!,
      limit
    )
  } else if (appId) {
    await migrateQuery(
      db,
      db.collection(`apps/${appId}/${collection}`),
      apply,
      dropLegacy!,
      limit
    )
  }

  console.log('\nMigration complete.')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
