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
  // Offline mode does not require collection
  const appId =
    typeof args.get('appId') === 'string'
      ? String(args.get('appId'))
      : undefined
  const allApps = args.get('allApps') === true
  const apply = args.get('apply') === true
  const limit = args.get('limit') ? Number(args.get('limit')) : undefined
  const input =
    typeof args.get('input') === 'string'
      ? String(args.get('input'))
      : undefined
  const output =
    typeof args.get('output') === 'string'
      ? String(args.get('output'))
      : undefined
  const key =
    typeof args.get('key') === 'string' ? String(args.get('key')) : undefined
  return { collection, appId, allApps, apply, limit, input, output, key }
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
// Keep legacy camelCase -> snake_case policy aligned with models.
const RENAME = {
  displayName: 'display_name',
  avatarUrl: 'avatar',
}

// Additional pass: camel bios → snake bios
const RENAME_CAMEL_TO_SNAKE = {
  bioShort: 'bio_short',
  bioLong: 'bio_long',
}

function applyRenameMap(out, map, notes) {
  let changed = false
  for (const [from, to] of Object.entries(map)) {
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
  return changed
}

function migrateOne(id, data) {
  const before = { ...data }
  const out = { ...data }
  const notes = []
  let changed = false

  // 1) Renames
  changed = applyRenameMap(out, RENAME, notes) || changed

  // 1b) Camel bios back to snake
  changed = applyRenameMap(out, RENAME_CAMEL_TO_SNAKE, notes) || changed

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

  if (
    !out.display_name ||
    typeof out.display_name !== 'string' ||
    !out.display_name.trim()
  ) {
    const fallback = data.displayName ?? data.name ?? id
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
  if (
    !out.created_at ||
    !(out.created_at instanceof admin.firestore.Timestamp)
  ) {
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
      console.log(
        `[${apply ? 'APPLY' : 'DRY'}] ${d.ref.path} → ${res.notes.join(', ')}`
      )
    }
  }

  if (apply) await bw.close()
  console.log(
    `Done: changed ${changedCount}/${docs.length} ${
      apply ? '(writes committed)' : '(dry-run)'
    }`
  )
}

function toPlainTimestamp(ts) {
  if (ts instanceof admin.firestore.Timestamp) {
    return { _seconds: ts.seconds, _nanoseconds: ts.nanoseconds }
  }
  if (
    ts &&
    typeof ts._seconds === 'number' &&
    typeof ts._nanoseconds === 'number'
  ) {
    return ts
  }
  return ts
}

function pickArrayFromJson(json, key) {
  if (Array.isArray(json)) return json
  if (key && Array.isArray(json[key])) return json[key]
  if (Array.isArray(json.professionals)) return json.professionals
  return []
}

async function migrateOffline(inputPath, key, outputPath, limit) {
  const fs = require('node:fs')
  const path = require('node:path')
  const raw = fs.readFileSync(path.resolve(inputPath), 'utf8')
  const json = JSON.parse(raw)

  const arr = pickArrayFromJson(json, key)

  if (!Array.isArray(arr) || arr.length === 0) {
    console.log('No items found to migrate in offline input')
    return
  }

  const items = limit ? arr.slice(0, limit) : arr
  let changed = 0
  const outItems = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const id = String(item.id || item.uid || `idx-${i}`)
    const res = migrateOne(id, item)
    if (res.changed) changed++
    console.log(`[OFFLINE-DRY] ${id} → ${res.notes.join(', ')}`)
    // Prepare plain JSON for optional output
    const after = { ...res.after }
    after.created_at = toPlainTimestamp(after.created_at)
    if (after.updated_at) after.updated_at = toPlainTimestamp(after.updated_at)
    outItems.push(after)
  }
  console.log(`Offline dry-run done: changed ${changed}/${items.length}`)

  if (outputPath) {
    const out = Array.isArray(json)
      ? outItems
      : { ...json, [key || 'professionals']: outItems }
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2))
    console.log(`Wrote transformed preview to ${outputPath}`)
  }
}

async function main() {
  const { collection, appId, allApps, apply, limit, input, output, key } =
    parseArgs()

  if (input) {
    console.log(
      `\n=== FireUX Profile Migration (OFFLINE) ===\nInput: ${input}\nKey: ${
        key || 'professionals'
      }\nMode: DRY-RUN (offline)\nLimit: ${
        limit ?? '(none)'
      }\n========================================\n`
    )
    await migrateOffline(input, key, output, limit)
    console.log('\nOffline migration preview complete.')
    return
  }

  if (!collection) {
    console.error('Missing --collection=<name>')
    process.exit(1)
  }

  const db = initAdmin()

  console.log(
    `\n=== FireUX Profile Migration ===\nCollection: ${collection}\nOverlay appId: ${
      appId ?? '(none)'
    }\nAll apps (collectionGroup): ${allApps ? 'YES' : 'NO'}\nMode: ${
      apply ? 'APPLY' : 'DRY-RUN'
    }\nLimit: ${limit ?? '(none)'}\n================================\n`
  )

  await migrateQuery(db, db.collection(collection), apply, limit)

  if (allApps) {
    await migrateQuery(db, db.collectionGroup(collection), apply, limit)
  } else if (appId) {
    await migrateQuery(
      db,
      db.collection(`apps/${appId}/${collection}`),
      apply,
      limit
    )
  }

  console.log('\nMigration complete.')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
