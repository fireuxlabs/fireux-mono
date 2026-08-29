#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-29
// usage_note: create or apply a protected, non-destructive Google provider reconciliation plan for every Place in the named Misebox database.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const ENV_PATH = 'projects/misebox/misebox-app/.env'
const GOOGLE_ID = /^ChIJ[\w-]+$/u
const GOOGLE_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]
const CURRENCY_BY_COUNTRY = {
  AT: 'EUR', AU: 'AUD', BE: 'EUR', CA: 'CAD', CH: 'CHF', DE: 'EUR',
  DK: 'DKK', ES: 'EUR', FI: 'EUR', FR: 'EUR', GB: 'GBP', IE: 'EUR',
  IT: 'EUR', LU: 'EUR', NL: 'EUR', NO: 'NOK', NZ: 'NZD', PT: 'EUR',
  SE: 'SEK', US: 'USD',
}

const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function')
    return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, stable(child)])
  )
}
const json = (value) => JSON.stringify(stable(value))
const sha256 = (value) =>
  createHash('sha256').update(typeof value === 'string' ? value : json(value)).digest('hex')
const equal = (left, right) => json(left) === json(right)
const present = (value) => {
  if (typeof value === 'string') return Boolean(value.trim())
  if (typeof value === 'number') return Number.isFinite(value) && value !== 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return value !== null && value !== undefined && value !== false
}
const envValue = (source, key) => {
  const line = source.split(/\r?\n/u).find((item) => item.trim().startsWith(`${key}=`))
  return line
    ? line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/gu, '')
    : ''
}
const component = (items, type, key = 'long_name') =>
  text(items.find((item) => Array.isArray(item?.types) && item.types.includes(type))?.[key])
const providerAddress = (value) => {
  const items = Array.isArray(value) ? value : []
  const number = component(items, 'street_number')
  const route = component(items, 'route')
  const country = component(items, 'country', 'short_name').toUpperCase()
  return Object.fromEntries(Object.entries({
    street: [number, route].filter(Boolean).join(' '),
    city: component(items, 'locality') || component(items, 'postal_town') || component(items, 'administrative_area_level_2'),
    region: component(items, 'administrative_area_level_1', 'short_name'),
    postal_code: component(items, 'postal_code'),
    country_code: /^[A-Z]{2}$/u.test(country) ? country : '',
  }).filter(([, value]) => value))
}
const businessHours = (value) => {
  if (!Array.isArray(value)) return null
  const windows = value.map((period) => {
    const open = record(period?.open)
    const close = record(period?.close)
    const day = GOOGLE_DAYS[Number(open.day)]
    const opens = text(open.time)
    if (!day || !/^\d{4}$/u.test(opens)) return null
    if (!Object.keys(close).length && day === 'sunday' && opens === '0000')
      return { days: [...GOOGLE_DAYS.slice(1), 'sunday'], open: '00:00', close: '00:00' }
    const closes = text(close.time)
    return /^\d{4}$/u.test(closes)
      ? { days: [day], open: `${opens.slice(0, 2)}:${opens.slice(2)}`, close: `${closes.slice(0, 2)}:${closes.slice(2)}` }
      : null
  }).filter(Boolean)
  return windows.length ? { windows } : null
}
const providerIdentity = (id, place) => {
  const candidates = [id, place.google_place_id, place.provider_place_id, place.place_id]
    .map(text).filter((value) => GOOGLE_ID.test(value))
  const unique = [...new Set(candidates)]
  return unique.length === 1 ? { id: unique[0] } : {
    error: unique.length ? 'ambiguous-provider-identity' : 'unproved-provider-identity',
    candidates: unique,
  }
}
const addField = (patch, conflicts, field, current, provider) => {
  if (!present(provider)) return
  if (!present(current)) patch[field] = provider
  else if (!equal(current, provider)) conflicts.push({ field, current: stable(current), provider: stable(provider) })
}

const env = await readFile(ENV_PATH, 'utf8')
const apiKey = envValue(env, 'GOOGLE_PLACES_API_KEY') ||
  envValue(env, 'NUXT_GOOGLE_PLACES_API_KEY') ||
  envValue(env, 'NUXT_PUBLIC_GOOGLE_PLACES_API_KEY')
if (!apiKey) throw new Error(`Google Places API key is missing from ${ENV_PATH}.`)

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `reconcile-misebox-places-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const sourceSnapshot = await db.collection('places').get()
const source = sourceSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data(), source_sha256: sha256(doc.data()) }))

async function fetchProvider(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', [
    'address_component', 'formatted_address', 'formatted_phone_number', 'geometry',
    'international_phone_number', 'name', 'opening_hours', 'place_id',
    'price_level', 'type', 'url', 'vicinity', 'website',
  ].join(','))
  url.searchParams.set('key', apiKey)
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  const body = await response.json()
  if (!response.ok || body?.status !== 'OK' || text(body?.result?.place_id) !== placeId)
    throw new Error(text(body?.status) || `HTTP ${response.status}`)
  const result = record(body.result)
  const address = providerAddress(result.address_components)
  const location = record(record(result.geometry).location)
  const lat = Number(location.lat)
  const lng = Number(location.lng)
  const locality = [...new Set([address.city, address.region, address.country_code].filter(Boolean))].join(', ')
  const priceLevel = Number(result.price_level)
  return {
    name: text(result.name),
    address,
    formatted_address: text(result.formatted_address || result.vicinity),
    short_address: locality,
    ...(Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat || lng) ? { lat, lng } : {}),
    phone: text(result.international_phone_number || result.formatted_phone_number),
    website: text(result.website),
    google_maps_url: text(result.url),
    types: Array.isArray(result.types) ? [...new Set(result.types.map(text).filter(Boolean))] : [],
    ...(Number.isInteger(priceLevel) && priceLevel >= 0 && priceLevel <= 4 ? { price_level: String(priceLevel) } : {}),
    business_hours: businessHours(result.opening_hours?.periods),
    default_currency_code: CURRENCY_BY_COUNTRY[address.country_code] || '',
  }
}

async function planPlace(item) {
  const identity = providerIdentity(item.id, item.data)
  if (!identity.id) return { id: item.id, source_sha256: item.source_sha256, status: identity.error, provider_candidates: identity.candidates, patch: {}, conflicts: [] }
  let provider
  try { provider = await fetchProvider(identity.id) }
  catch (error) { return { id: item.id, source_sha256: item.source_sha256, provider_id: identity.id, status: 'provider-error', error: error.message, patch: {}, conflicts: [] } }
  const patch = {}
  const conflicts = []
  addField(patch, conflicts, 'name', item.data.name, provider.name)
  const currentAddress = record(item.data.address)
  const mergedAddress = { ...currentAddress }
  for (const [field, value] of Object.entries(provider.address)) {
    if (!present(currentAddress[field])) mergedAddress[field] = value
    else if (!equal(currentAddress[field], value)) conflicts.push({ field: `address.${field}`, current: stable(currentAddress[field]), provider: value })
  }
  if (!equal(currentAddress, mergedAddress)) patch.address = mergedAddress
  for (const field of ['formatted_address', 'short_address', 'phone', 'website', 'google_maps_url', 'types', 'price_level', 'business_hours', 'default_currency_code'])
    addField(patch, conflicts, field, item.data[field], provider[field])
  const currentLat = Number(item.data.lat)
  const currentLng = Number(item.data.lng)
  const currentCoordinatesPresent = Number.isFinite(currentLat) && Number.isFinite(currentLng) && (currentLat !== 0 || currentLng !== 0)
  if (!currentCoordinatesPresent && present(provider.lat) && present(provider.lng)) {
    patch.lat = provider.lat
    patch.lng = provider.lng
  } else if (present(provider.lat) && (currentLat !== provider.lat || currentLng !== provider.lng)) {
    conflicts.push({ field: 'coordinates', current: { lat: currentLat, lng: currentLng }, provider: { lat: provider.lat, lng: provider.lng } })
  }
  return { id: item.id, source_sha256: item.source_sha256, provider_id: identity.id, status: Object.keys(patch).length ? 'patch' : 'unchanged', provider: stable(provider), patch: stable(patch), conflicts }
}

const rows = []
for (let index = 0; index < source.length; index += 5)
  rows.push(...await Promise.all(source.slice(index, index + 5).map(planPlace)))
const plan = {
  format: 'fireux-misebox-place-provider-reconciliation/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  collection_path: 'places',
  document_count: source.length,
  summary: {
    patch_documents: rows.filter((row) => Object.keys(row.patch).length).length,
    patch_fields: rows.reduce((sum, row) => sum + Object.keys(row.patch).length, 0),
    conflict_documents: rows.filter((row) => row.conflicts.length).length,
    conflicts: rows.reduce((sum, row) => sum + row.conflicts.length, 0),
    unresolved: rows.filter((row) => row.status === 'unproved-provider-identity' || row.status === 'ambiguous-provider-identity').length,
    provider_errors: rows.filter((row) => row.status === 'provider-error').length,
  },
  rows,
}
plan.plan_sha256 = sha256(plan)

if (!apply) {
  const planPath = text(args.plan)
  if (!planPath.startsWith('/private/tmp/') || !planPath.endsWith('.json'))
    throw new Error('Dry-run requires --plan /private/tmp/<name>.json')
  const artifact = await writeProtectedJsonArtifact({ path: planPath, payload: plan })
  console.log(JSON.stringify({ mode: 'dry-run', plan_sha256: plan.plan_sha256, artifact, summary: plan.summary }, null, 2))
  process.exit(0)
}

const planPath = text(args.plan)
if (!planPath.startsWith('/private/tmp/') || !planPath.endsWith('.json'))
  throw new Error('Apply requires --plan /private/tmp/<name>.json')
const savedPlan = JSON.parse(await readFile(planPath, 'utf8'))
const savedHash = savedPlan.plan_sha256
const hashablePlan = { ...savedPlan }
delete hashablePlan.plan_sha256
if (!savedHash || sha256(hashablePlan) !== savedHash) throw new Error('Protected plan content hash is invalid.')
if (text(args.confirm) !== savedHash) throw new Error(`Apply requires --confirm ${savedHash}`)
if (savedPlan.project_id !== PROJECT_ID || savedPlan.database_id !== DATABASE_ID || savedPlan.collection_path !== 'places')
  throw new Error('Protected plan targets an unexpected Firestore database or collection.')
const currentSnapshot = await db.collection('places').get()
if (currentSnapshot.size !== savedPlan.document_count) throw new Error('Place document count changed after planning.')
const currentById = new Map(currentSnapshot.docs.map((doc) => [doc.id, doc.data()]))
for (const row of savedPlan.rows)
  if (!currentById.has(row.id) || sha256(currentById.get(row.id)) !== row.source_sha256)
    throw new Error(`Place changed after planning: ${row.id}`)
const touched = savedPlan.rows.filter((row) => Object.keys(row.patch).length)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json'))
  throw new Error('Apply requires --backup /private/tmp/<name>.json')
const backup = await writeProtectedJsonArtifact({ path: backupPath, payload: {
  format: 'fireux-misebox-place-provider-preimage/1', captured_at: new Date().toISOString(),
  plan_sha256: savedHash, project_id: PROJECT_ID, database_id: DATABASE_ID,
  documents: touched.map((row) => ({ path: `places/${row.id}`, data: stable(currentById.get(row.id)) })),
} })
const target = defineFirestoreMutationTarget({
  key: 'misebox.place-provider-reconciliation', lane: 'mcp-skill', verbs: ['update'],
  database: { kind: 'named', databaseId: DATABASE_ID }, collectionPath: 'places',
})
for (const row of touched) await mcpSkillUpdate(app, target, row.id, row.patch)
const verifiedSnapshot = await db.collection('places').get()
if (verifiedSnapshot.size !== savedPlan.document_count) throw new Error('Verification found a changed Place document count.')
for (const row of touched) {
  const before = stable(currentById.get(row.id))
  const after = stable(verifiedSnapshot.docs.find((doc) => doc.id === row.id)?.data())
  const expected = stable({ ...before, ...row.patch })
  if (!equal(after, expected)) throw new Error(`Exact post-write verification failed: ${row.id}`)
}
console.log(JSON.stringify({ mode: 'applied-and-verified', plan_sha256: savedHash, touched_documents: touched.length, backup }, null, 2))
