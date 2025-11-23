import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

// ---------- CLI ----------
type Cli = {
  collection: string // e.g. "professionals"
  appId?: string // migrate overlays under apps/{appId}/{collection}
  allApps: boolean // migrate all app overlays via collection group
  apply: boolean // perform writes (otherwise dry-run)
  limit?: number // optional cap for testing
  dropLegacy: boolean // if true, delete legacy arrays after mapping
  mergeKitchen: boolean // if false, kitchen_experience is discarded instead of merged
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
  const allAppsRaw = args.get('allApps')
  const allApps = allAppsRaw === true || allAppsRaw === 'true'
  const applyRaw = args.get('apply')
  const apply = applyRaw === true || applyRaw === 'true'
  const dropLegacyRaw = args.get('dropLegacy')
  const dropLegacy =
    dropLegacyRaw === undefined
      ? true
      : dropLegacyRaw === true || dropLegacyRaw === 'true'
  const mergeKitchenRaw = args.get('mergeKitchen')
  const mergeKitchen =
    mergeKitchenRaw === undefined
      ? true
      : mergeKitchenRaw === true || mergeKitchenRaw === 'true'
  const limit = args.get('limit') ? Number(args.get('limit')) : undefined
  return { collection, appId, allApps, apply, limit, dropLegacy, mergeKitchen }
}

// ---------- Admin init (env-friendly) ----------
const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_SERVICE_ACCOUNT_PATHS = [
  resolve(
    __dirname,
    '../packages/ecosystem/fireux-misebox/config/service-account.json'
  ),
]

function initAdmin() {
  if (getApps().length === 0) {
    const rawJson =
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE

    if (rawJson) {
      const svc = JSON.parse(rawJson)
      if (typeof svc.private_key === 'string') {
        svc.private_key = svc.private_key.replace(/\\n/g, '\n')
      }
      initializeApp({ credential: cert(svc) as any })
    } else if (filePath) {
      const svc = JSON.parse(readFileSync(filePath, 'utf-8'))
      if (typeof svc.private_key === 'string') {
        svc.private_key = svc.private_key.replace(/\\n/g, '\n')
      }
      initializeApp({ credential: cert(svc) as any })
    } else {
      const fallbackPath = DEFAULT_SERVICE_ACCOUNT_PATHS.find((p) =>
        existsSync(p)
      )
      if (fallbackPath) {
        const svc = JSON.parse(readFileSync(fallbackPath, 'utf-8'))
        if (typeof svc.private_key === 'string') {
          svc.private_key = svc.private_key.replace(/\\n/g, '\n')
        }
        initializeApp({ credential: cert(svc) as any })
      } else {
        initializeApp() // GOOGLE_APPLICATION_CREDENTIALS or emulator
      }
    }
  }
  return getFirestore()
}

// ---------- Helpers ----------
const tsNow = () => Timestamp.now()

type AnyDoc = Record<string, any>

type ExperienceEntry = Record<string, any>

type SanitizedExperience = {
  place_id: string
  role: string | null
  from_month: string | null
  from_year: string | null
  to_month: string | null
  to_year: string | null
  ongoing: boolean
  responsibilities: string | null
}

const sanitizeExperience = (
  entry: ExperienceEntry
): SanitizedExperience | null => {
  const placeId =
    typeof entry.place_id === 'string' ? entry.place_id.trim() : ''
  if (!placeId) return null

  const base: SanitizedExperience = {
    place_id: placeId,
    role:
      (typeof entry.role === 'string' || typeof entry.role === 'number') &&
      String(entry.role).trim() !== ''
        ? String(entry.role).trim()
        : null,
    from_month:
      (typeof entry.from_month === 'string' ||
        typeof entry.from_month === 'number') &&
      String(entry.from_month).trim() !== ''
        ? String(entry.from_month).trim()
        : null,
    from_year:
      (typeof entry.from_year === 'string' ||
        typeof entry.from_year === 'number') &&
      String(entry.from_year).trim() !== ''
        ? String(entry.from_year).trim()
        : null,
    to_month:
      (typeof entry.to_month === 'string' ||
        typeof entry.to_month === 'number') &&
      String(entry.to_month).trim() !== ''
        ? String(entry.to_month).trim()
        : null,
    to_year:
      (typeof entry.to_year === 'string' ||
        typeof entry.to_year === 'number') &&
      String(entry.to_year).trim() !== ''
        ? String(entry.to_year).trim()
        : null,
    ongoing: Boolean(entry.ongoing),
    responsibilities:
      typeof entry.responsibilities === 'string' &&
      entry.responsibilities.trim() !== ''
        ? entry.responsibilities.trim()
        : null,
  }

  return base
}

function collectExperience(...arrays: (ExperienceEntry[] | undefined)[]) {
  return arrays
    .flatMap((arr) => (Array.isArray(arr) ? arr : []))
    .map((item) => sanitizeExperience(item))
    .filter((item): item is SanitizedExperience => item !== null)
}

function dedupeExperience(entries: SanitizedExperience[]) {
  const seen = new Set<string>()
  const deduped: SanitizedExperience[] = []
  for (const entry of entries) {
    const key = `${entry.place_id}|${entry.role ?? ''}|${entry.from_year ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(entry)
  }
  return deduped
}

function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

type NormalizeConfig = {
  data: AnyDoc
  target: AnyDoc
  field: 'relevant_experience' | 'other_experience'
  additions?: ExperienceEntry[]
  includeAdditions: boolean
  mergeNote: string
  sanitizeNote: string
  notes: string[]
}

function normalizeExperienceArray(config: NormalizeConfig): boolean {
  const base = Array.isArray(config.data[config.field])
    ? (config.data[config.field] as ExperienceEntry[])
    : undefined
  const before = collectExperience(
    Array.isArray(config.target[config.field])
      ? (config.target[config.field] as ExperienceEntry[])
      : undefined
  )
  const normalized = dedupeExperience(
    collectExperience(
      base,
      config.includeAdditions ? config.additions : undefined
    )
  )

  if (deepEqual(normalized, before)) return false

  config.target[config.field] = normalized
  const note =
    config.includeAdditions &&
    Array.isArray(config.additions) &&
    config.additions.length > 0
      ? config.mergeNote
      : config.sanitizeNote
  config.notes.push(note)

  return true
}

function dropLegacyArray(
  data: AnyDoc,
  target: AnyDoc,
  key: 'kitchen_experience' | 'other_employment_experience',
  note: string,
  notes: string[]
): boolean {
  if (!Object.hasOwn(data, key)) return false
  target[key] = FieldValue.delete()
  notes.push(note)
  return true
}

function mapExperienceArrays(
  data: AnyDoc,
  dropLegacy: boolean,
  mergeKitchen: boolean
): { after: AnyDoc; notes: string[]; changed: boolean } {
  const after: AnyDoc = { ...data }
  const notes: string[] = []
  let changed = false

  const kitchenAdditions = Array.isArray(data.kitchen_experience)
    ? (data.kitchen_experience as ExperienceEntry[])
    : undefined
  const otherEmploymentAdditions = Array.isArray(
    data.other_employment_experience
  )
    ? (data.other_employment_experience as ExperienceEntry[])
    : undefined

  if (
    normalizeExperienceArray({
      data,
      target: after,
      field: 'relevant_experience',
      additions: kitchenAdditions,
      includeAdditions: mergeKitchen,
      mergeNote: 'merged kitchen_experience into relevant_experience',
      sanitizeNote: 'sanitized relevant_experience',
      notes,
    })
  ) {
    changed = true
  }

  if (
    normalizeExperienceArray({
      data,
      target: after,
      field: 'other_experience',
      additions: otherEmploymentAdditions,
      includeAdditions: true,
      mergeNote: 'merged other_employment_experience into other_experience',
      sanitizeNote: 'sanitized other_experience',
      notes,
    })
  ) {
    changed = true
  }

  if (dropLegacy) {
    if (
      dropLegacyArray(
        data,
        after,
        'kitchen_experience',
        'dropped legacy kitchen_experience',
        notes
      )
    ) {
      changed = true
    }

    if (
      dropLegacyArray(
        data,
        after,
        'other_employment_experience',
        'dropped legacy other_employment_experience',
        notes
      )
    ) {
      changed = true
    }
  }

  if (changed) {
    after.updated_at = tsNow()
  }

  return { after, notes, changed }
}

async function migrateQuery(
  db: ReturnType<typeof getFirestore>,
  query: FirebaseFirestore.Query,
  apply: boolean,
  dropLegacy: boolean,
  mergeKitchen: boolean,
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
    const { after, notes, changed } = mapExperienceArrays(
      before,
      dropLegacy,
      mergeKitchen
    )
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
  const { collection, appId, allApps, apply, limit, dropLegacy, mergeKitchen } =
    parseArgs()
  const db = initAdmin()

  console.log(
    `\n=== FireUX Professionals Experience Migration ===\nCollection: ${collection}\nOverlay appId: ${
      appId ?? '(none)'
    }\nAll apps (collectionGroup): ${allApps ? 'YES' : 'NO'}\nMode: ${
      apply ? 'APPLY' : 'DRY-RUN'
    }\nMerge kitchen experience: ${
      mergeKitchen ? 'YES' : 'NO'
    }\nDrop legacy fields: ${dropLegacy ? 'YES' : 'NO'}\nLimit: ${
      limit ?? '(none)'
    }\n================================\n`
  )

  // 1) Core collection: {collection}/*
  await migrateQuery(
    db,
    db.collection(collection),
    apply,
    dropLegacy,
    mergeKitchen,
    limit
  )

  // 2) App overlays
  if (allApps) {
    await migrateQuery(
      db,
      db.collectionGroup(collection),
      apply,
      dropLegacy,
      mergeKitchen,
      limit
    )
  } else if (appId) {
    await migrateQuery(
      db,
      db.collection(`apps/${appId}/${collection}`),
      apply,
      dropLegacy,
      mergeKitchen,
      limit
    )
  }

  console.log('\nMigration complete.')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
