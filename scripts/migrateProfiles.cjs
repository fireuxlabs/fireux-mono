/* eslint-disable no-console */
const admin = require('firebase-admin')

// ---------- CLI ----------
function parseArgs() {
  const args = new Map()
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.includes('=') ? a.split('=') : [a, 'true']
    args.set(k.replace(/^--/, ''), v === 'true' ? true : v)
  }
  const collection = String(args.get('collection') || '')
  if (!collection) {
    console.error('Missing --collection=<name>')
    process.exit(1)
  }
  const appId = typeof args.get('appId') === 'string' ? String(args.get('appId')) : undefined
  const allApps = args.get('allApps') === true
  const apply = args.get('apply') === true
  const limit = args.get('limit') ? Number(args.get('limit')) : undefined
  return { collection, appId, allApps, apply, limit }
}

// ---------- Admin init (env-friendly) ----------
function initAdmin() {
  if (!admin.apps.length) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT
    if (json) {
      const svc = JSON.parse(json)
      if (typeof svc.private_key === 'string') {
        svc.private_key = svc.private_key.replace(/\\n/g, '\n')
      }
      admin.initializeApp({ credential: admin.credential.cert(svc) })
    } else {
      admin.initializeApp() // GOOGLE_APPLICATION_CREDENTIALS or emulator
    }
  }
  return admin.firestore()
}

// ---------- Helpers ----------
const tsNow = () => admin.firestore.Timestamp.now()

function toTimestamp(val) {
  if (!val) return tsNow()
  if (val instanceof admin.firestore.Timestamp) return val
  if (val._seconds && val._nanoseconds) {
    return new admin.firestore.Timestamp(val._seconds, val._nanoseconds)
  }
  let d = null
  if (typeof val === 'string') {
    const parsed = new Date(val)
    d = isNaN(parsed.getTime()) ? null : parsed
  } else if (val instanceof Date) {
    d = val
  }
  return d ? admin.firestore.Timestamp.fromDate(d) : tsNow()
}

// Field rename map (source -> target)
const RENAME = {
  displayName: 'display_name',
  avatarUrl: 'avatar',
  bio_short: 'bioShort',
  bio_long: 'bioLong',
}

function migrateOne(id, data) {
  const before = { ...data }
  const out = { ...data }
  const notes = []
  let changed = false

  // 1) Renames
  for (const [from, to] of Object.entries(RENAME)) {
    if (out[from] !== undefined && out[to] === undefined) {
      out[to] = out[from]
      delete out[from]
      changed = true
      notes.push(`renamed ${from}→${to}`)
    } else if (out[from] !== undefined && out[to] !== undefined) {
      delete out[from]
      changed = true
      notes.push(`dropped legacy ${from} (canonical ${to} present)`)
    }
  }

  // 2) Ensure required base fields and identifiers
  if (out.id !== id) {
    out.id = id
    changed = true
    notes.push('set base.id from doc id (canonical)')
  }

  if (out.uid !== undefined) {
    delete out.uid
    changed = true
    notes.push('dropped legacy uid')
  }

  if (!out.display_name || typeof out.display_name !== 'string' || !out.display_name.trim()) {
    const fallback = (data.displayName ?? data.name ?? id)
    out.display_name = String(fallback)
    changed = true
    notes.push('backfilled display_name')
  }

  if (out.avatar === undefined) {
    out.avatar = ''
    changed = true
    notes.push('backfilled avatar (empty)')
  }

  // 3) Timestamps
  const created = toTimestamp(out.created_at)
  if (!out.created_at || !(out.created_at instanceof admin.firestore.Timestamp)) {
    out.created_at = created
    changed = true
    notes.push('normalized created_at → Timestamp')
  }
  out.updated_at = tsNow()
  changed = true
  notes.push('set updated_at')

  return {
    path: '',
    changed,
    writes: changed ? 1 : 0,
    before,
    after: out,
    notes,
  }
}

async function migrateQuery(db, query, apply, limit) {
  const bw = db.bulkWriter()
  bw.onWriteError((err) => {
    console.error('Write error:', err.documentRef.path, err.message)
    return err.failedAttempts < 5
  })

  const snap = await query.get()
  const docs = limit ? snap.docs.slice(0, limit) : snap.docs

  console.log(`Found ${docs.length} docs`)

  let changedCount = 0
  for (const d of docs) {
    const res = migrateOne(d.id, d.data())
    res.path = d.ref.path
    if (res.changed) {
      changedCount++
      if (apply) {
        bw.set(d.ref, res.after, { merge: false })
      }
      console.log(`[${apply ? 'APPLY' : 'DRY'}] ${d.ref.path} → ${res.notes.join(', ')}`)
    }
  }

  if (apply) await bw.close()
  console.log(`Done: changed ${changedCount}/${docs.length} ${apply ? '(writes committed)' : '(dry-run)'}`)
}

async function main() {
  const { collection, appId, allApps, apply, limit } = parseArgs()
  const db = initAdmin()

  console.log(
    `\n=== FireUX Profile Migration ===\nCollection: ${collection}\nOverlay appId: ${appId ?? '(none)'}\nAll apps (collectionGroup): ${allApps ? 'YES' : 'NO'}\nMode: ${apply ? 'APPLY' : 'DRY-RUN'}\nLimit: ${limit ?? '(none)'}\n================================\n`
  )

  await migrateQuery(db, db.collection(collection), apply, limit)

  if (allApps) {
    await migrateQuery(db, db.collectionGroup(collection), apply, limit)
  } else if (appId) {
    await migrateQuery(db, db.collection(`apps/${appId}/${collection}`), apply, limit)
  }

  console.log('\nMigration complete.')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
