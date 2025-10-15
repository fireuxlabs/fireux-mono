/* scripts/2025-10-ensure-place-professional-links.ts
 * Backfill professionals_current / professionals_alumni arrays for selected places.
 */
/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
} from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

type Intent = {
  label: string
  current?: string[]
  alumni?: string[]
  create?: {
    name?: string
    formatted_address?: string
    search_term?: string
    source?: string
  }
}

type Plan = {
  placeId: string
  label: string
  create: boolean
  data: FirebaseFirestore.DocumentData
  summary: string
}

const PLACE_INTENTS: Record<string, Intent> = {
  ChIJcUsl4xejj0cRbug8Ds7VHNc: {
    label: 'Seehotel Bönigen',
    current: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  ChIJQzGAsJCkj0cRJZIIj0XoBqA: {
    label: 'Goldener Anker (Interlaken)',
    current: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  ChIJGZLquf6bj0cRgf5eaOtK7PY: {
    label: 'Berghaus Männlichen',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  'ChIJTeUywPmbj0cR-wT2hmyQaUM': {
    label: 'Berghaus Alpiglen',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  ChIJ5_TdZKNFj0cRunmn1AAOhAM: {
    label: 'Hotel Allalin',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  ChIJHxvMffqkj0cR7zCUD5KfxXc: {
    label: 'Salzano / Landhotel Golf',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  ChIJswCZ5HQzGQ0REazzU1ROadQ: {
    label: 'Real Palácio',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  'ChIJ-x5EtnEzGQ0R8am5BtQUOLs': {
    label: 'Four Seasons Ritz',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
  },
  ChIJXdh4fWQzGQ0RMxS3c5Nua04: {
    label: 'Hotel da Estrela',
    alumni: ['OnLDg1ZcGqh30aaopCZggBIyhbS2'],
    create: {
      name: 'Hotel da Estrela',
      formatted_address: 'Lisboa, Portugal',
      search_term: 'Hotel da Estrela Lisboa',
      source: 'manual-migration',
    },
  },
  ChIJS1kBa_AGOEYRwRaP4kZIjvs: {
    label: 'Boen Gård',
    current: ['FoPLMYVPirSiMm2eDskwsZja0q42'],
  },
  ChIJZYHwV2osOUYR6N1qUJ8m0jU: {
    label: 'Hovden Alpin Lodge',
    alumni: ['FoPLMYVPirSiMm2eDskwsZja0q42'],
  },
  ChIJy9QERoAFR0YRAnMwI2eEV8Q: {
    label: 'Tollboden Restaurant',
    alumni: ['FoPLMYVPirSiMm2eDskwsZja0q42'],
  },
  ChIJfQbcFs5C2EcRfPr8IZUWn6g: {
    label: 'The Kings Head',
    alumni: ['FoPLMYVPirSiMm2eDskwsZja0q42'],
  },
  ChIJ84hrmh6lj0cRoczGWuTvTtE: {
    label: 'Balmers Backyard',
    alumni: ['rEssOnUA8wVHdNKE2JETqWAdwdm1'],
  },
  'ChIJd5U3YbF0iUcR-oLtm9B0M5Y': {
    label: "Hôtel Le Ski d'Or",
    alumni: ['s9hKBxO7mJSFC5vHNOo3mt9Dgi42'],
  },
  ChIJ5a7zI4yZb0gREnXFLyK2efw: {
    label: 'The Hafod Hotel',
    alumni: ['s9hKBxO7mJSFC5vHNOo3mt9Dgi42'],
  },
  ChIJoVol0XW33kcRzlGVA086YZc: {
    label: 'Broome Park Hotel',
    alumni: ['s9hKBxO7mJSFC5vHNOo3mt9Dgi42'],
  },
  ChIJW24UWZEFR0YRLz8DJUFmfes: {
    label: 'Verify Goldener Anker (manual review)',
    alumni: ['s9hKBxO7mJSFC5vHNOo3mt9Dgi42'],
    create: {
      name: 'Goldener Anker (verify manually)',
      formatted_address: '',
      search_term: '',
      source: 'manual-migration',
    },
  },
}

const compareIds = (a: string, b: string) => a.localeCompare(b)

const rawArgs = process.argv.slice(2)
const argSet = new Set(rawArgs)

function readOption(prefix: string): string | undefined {
  const match = rawArgs.find((arg) => arg.startsWith(`${prefix}=`))
  return match ? match.slice(prefix.length + 1) : undefined
}

let apply = false
let dryRun = true
if (argSet.has('--apply')) {
  apply = true
  dryRun = false
}
if (argSet.has('--dry-run')) {
  dryRun = true
  apply = false
}
const createMissing = argSet.has('--create-missing')

let batchSize = Number(readOption('--batch-size') ?? '250')
if (!Number.isFinite(batchSize) || batchSize <= 0 || batchSize > 500) {
  batchSize = 250
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const defaultServiceAccountPath = resolve(
  __dirname,
  '../packages/tenants/fireux-misebox/config/service-account.json'
)

function initFirebase() {
  if (getApps().length === 0) {
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const envFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    if (envJson) {
      initializeApp({ credential: cert(JSON.parse(envJson)) })
    } else if (envFile && existsSync(envFile)) {
      const svc = JSON.parse(readFileSync(envFile, 'utf8'))
      initializeApp({ credential: cert(svc) })
    } else if (existsSync(defaultServiceAccountPath)) {
      const svc = JSON.parse(readFileSync(defaultServiceAccountPath, 'utf8'))
      initializeApp({ credential: cert(svc) })
    } else {
      initializeApp({ credential: applicationDefault() })
    }
  }
  return getFirestore()
}

function normalizeIds(values?: string[]): string[] {
  if (!Array.isArray(values)) return []
  const set = new Set<string>()
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (!trimmed) continue
    set.add(trimmed)
  }
  return Array.from(set)
}

function ensureArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const raw of value) {
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (!trimmed) continue
    out.push(trimmed)
  }
  return out
}

function setsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false
  for (const value of a) {
    if (!b.has(value)) return false
  }
  return true
}

function diffAdded(base: Set<string>, next: Set<string>): string[] {
  const out: string[] = []
  for (const value of next) {
    if (!base.has(value)) out.push(value)
  }
  return out
}

function diffRemoved(base: Set<string>, next: Set<string>): string[] {
  const out: string[] = []
  for (const value of base) {
    if (!next.has(value)) out.push(value)
  }
  return out
}

function formatDelta(label: string, added: string[], removed: string[]) {
  const parts: string[] = []
  if (added.length) parts.push(`+${label}:${added.join(',')}`)
  if (removed.length) parts.push(`-${label}:${removed.join(',')}`)
  return parts.join(' ')
}

function buildCreatePlan(placeId: string, intent: Intent): Plan | null {
  if (!createMissing) return null

  const currentSet = new Set(normalizeIds(intent.current))
  const alumniSet = new Set(normalizeIds(intent.alumni))
  const now = FieldValue.serverTimestamp()
  const currentList = Array.from(currentSet).sort(compareIds)
  const alumniList = Array.from(alumniSet).sort(compareIds)

  const data: FirebaseFirestore.DocumentData = {
    place_id: placeId,
    name: intent.create?.name ?? intent.label,
    formatted_address: intent.create?.formatted_address ?? '',
    search_term: intent.create?.search_term ?? '',
    source: intent.create?.source ?? 'manual-migration',
    professionals_current: currentList,
    professionals_alumni: alumniList,
    created_at: now,
    updated_at: now,
  }

  const segments: string[] = []
  if (currentList.length) segments.push(`current:${currentList.join(',')}`)
  if (alumniList.length) segments.push(`alumni:${alumniList.join(',')}`)
  if (!segments.length) segments.push('init-empty')

  return {
    placeId,
    label: intent.label,
    create: true,
    data,
    summary: segments.join(' '),
  }
}

function buildUpdatePlan(
  placeId: string,
  intent: Intent,
  before: Record<string, unknown>
): Plan | null {
  const targetCurrent = new Set(normalizeIds(intent.current))
  const targetAlumni = new Set(normalizeIds(intent.alumni))

  const currentBefore = new Set(ensureArray(before.professionals_current))
  const alumniBefore = new Set(ensureArray(before.professionals_alumni))
  const nextCurrent = new Set(currentBefore)
  const nextAlumni = new Set(alumniBefore)

  for (const id of targetCurrent) {
    nextCurrent.add(id)
    nextAlumni.delete(id)
  }
  for (const id of targetAlumni) {
    nextAlumni.add(id)
    nextCurrent.delete(id)
  }

  const initCurrent = !Array.isArray(before.professionals_current)
  const initAlumni = !Array.isArray(before.professionals_alumni)
  const unchangedArrays =
    setsEqual(currentBefore, nextCurrent) && setsEqual(alumniBefore, nextAlumni)
  if (unchangedArrays && !initCurrent && !initAlumni) return null

  const addedCurrent = diffAdded(currentBefore, nextCurrent)
  const removedCurrent = diffRemoved(currentBefore, nextCurrent)
  const addedAlumni = diffAdded(alumniBefore, nextAlumni)
  const removedAlumni = diffRemoved(alumniBefore, nextAlumni)

  const nextCurrentArr = Array.from(nextCurrent).sort(compareIds)
  const nextAlumniArr = Array.from(nextAlumni).sort(compareIds)

  const update: FirebaseFirestore.DocumentData = {
    professionals_current: nextCurrentArr,
    professionals_alumni: nextAlumniArr,
    updated_at: FieldValue.serverTimestamp(),
  }

  const segments: string[] = []
  const currentDelta = formatDelta('current', addedCurrent, removedCurrent)
  if (currentDelta) segments.push(currentDelta)
  const alumniDelta = formatDelta('alumni', addedAlumni, removedAlumni)
  if (alumniDelta) segments.push(alumniDelta)
  if (!segments.length && (initCurrent || initAlumni)) {
    segments.push('init-arrays')
  }

  return {
    placeId,
    label: intent.label,
    create: false,
    data: update,
    summary: segments.join(' '),
  }
}

async function buildPlans(db: FirebaseFirestore.Firestore) {
  const plans: Plan[] = []
  const missing: string[] = []

  for (const [placeId, intent] of Object.entries(PLACE_INTENTS)) {
    const ref = db.collection('places').doc(placeId)
    const snap = await ref.get()

    if (!snap.exists) {
      missing.push(`${placeId} (${intent.label})`)
      const plan = buildCreatePlan(placeId, intent)
      if (plan) plans.push(plan)
      continue
    }

    const plan = buildUpdatePlan(placeId, intent, snap.data() ?? {})
    if (plan) plans.push(plan)
  }

  return { plans, missing }
}

async function commitPlans(db: FirebaseFirestore.Firestore, plans: Plan[]) {
  if (!plans.length) return

  for (let i = 0; i < plans.length; i += batchSize) {
    const slice = plans.slice(i, i + batchSize)
    const batch = db.batch()
    for (const plan of slice) {
      const ref = db.collection('places').doc(plan.placeId)
      if (plan.create) {
        batch.set(ref, plan.data, { merge: false })
      } else {
        batch.set(ref, plan.data, { merge: true })
      }
    }
    await batch.commit()
  }
}

async function main() {
  const db = initFirebase()
  console.log('=== Ensure place professional links ===')
  console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'APPLY'}`)
  console.log(`Batch size: ${batchSize}`)
  console.log(`Create missing: ${createMissing ? 'YES' : 'NO'}`)

  const { plans, missing } = await buildPlans(db)

  if (missing.length) {
    console.log('\nMissing places:')
    for (const item of missing) {
      console.log(`  - ${item}`)
    }
  }

  if (!plans.length) {
    console.log('\nNo changes required.')
    return
  }

  console.log('\nPlanned operations:')
  for (const plan of plans) {
    const prefix = plan.create ? '[CREATE]' : '[UPDATE]'
    console.log(`  ${prefix} ${plan.label} (${plan.placeId}) ${plan.summary}`)
  }

  if (dryRun) {
    console.log('\nDry run complete. No writes executed.')
    return
  }

  await commitPlans(db, plans)
  console.log('\nWrites committed.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
