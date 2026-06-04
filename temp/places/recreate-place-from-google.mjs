#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../../scripts/_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_PLACE_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const DEFAULT_GOOGLE_JSON =
  'temp/places/la-tapberne-google-details-lean-2026-06-04.json'
const SYSTEM_ACTOR = 'system:recreate-place-from-google'

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = String(args.project || DEFAULT_PROJECT_ID).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const serviceAccountPath = String(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT
).trim()
const placeId = String(args.place || DEFAULT_PLACE_ID).trim()
const googleJsonPath = String(args['google-json'] || DEFAULT_GOOGLE_JSON).trim()
const savedJsonPath = String(args['saved-json'] || '').trim()
const restoreSavedImage = Boolean(args['restore-saved-image'])

const clean = (value) => String(value ?? '').trim()
const cleanArray = (value) =>
  Array.isArray(value) ? value.map(clean).filter(Boolean) : []
const numberValue = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const searchText = (value) =>
  clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
const toShortAddress = (value) => {
  const text = clean(value)
  if (!text) return ''
  const parts = text.split(',').map(clean).filter(Boolean)
  if (parts.length <= 2) return text
  return parts.slice(1).join(', ')
}
const component = (components, type) =>
  components.find((item) => cleanArray(item?.types).includes(type)) ?? null
const addressFromGoogle = (components) => {
  const street = [
    clean(component(components, 'route')?.long_name),
    clean(component(components, 'street_number')?.long_name),
  ]
    .filter(Boolean)
    .join(' ')

  return {
    street,
    city: clean(component(components, 'locality')?.long_name),
    region: clean(component(components, 'administrative_area_level_1')?.short_name),
    postal_code: clean(component(components, 'postal_code')?.long_name),
    country_code: clean(component(components, 'country')?.short_name),
  }
}
const currencyCodeFromCountry = (countryCode) =>
  ({
    AT: 'EUR',
    AU: 'AUD',
    CA: 'CAD',
    CH: 'CHF',
    DE: 'EUR',
    ES: 'EUR',
    FR: 'EUR',
    GB: 'GBP',
    IE: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    NZ: 'NZD',
    PT: 'EUR',
    US: 'USD',
  })[clean(countryCode).toUpperCase()] ?? ''

function payloadFromGoogle(placeIdValue, result) {
  const components = Array.isArray(result?.address_components)
    ? result.address_components
    : []
  const address = addressFromGoogle(components)
  const formattedAddress = clean(result?.formatted_address || result?.vicinity)
  const name = clean(result?.name) || 'Unknown place'
  const phone =
    clean(result?.international_phone_number) ||
    clean(result?.formatted_phone_number)

  return {
    id: placeIdValue,
    name,
    short_name: '',
    brand_tagline: '',
    about: '',
    formatted_address: formattedAddress,
    short_address: toShortAddress(formattedAddress),
    address,
    lat: numberValue(result?.geometry?.location?.lat),
    lng: numberValue(result?.geometry?.location?.lng),
    timezone: '',
    image_url: '',
    cover_image: '',
    gallery_images: [],
    image_shade: 'none',
    phone,
    email: '',
    website: clean(result?.website),
    google_maps_url: clean(result?.url),
    social_links: {
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      linkedin: '',
      youtube: '',
    },
    place_type: 'physical',
    types: cleanArray(result?.types),
    tags: [],
    price_level: result?.price_level === undefined ? '' : clean(result.price_level),
    default_currency_code: currencyCodeFromCountry(address.country_code),
    claimed_by: '',
    verified: false,
    slug: '',
    source: 'fireux',
    search_term: searchText(`${name} ${formattedAddress}`),
    created: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

if (!projectId || !databaseId || !serviceAccountPath || !placeId || !googleJsonPath) {
  console.error('Missing required project/database/service-account/place/google-json input.')
  process.exit(1)
}

const googleRaw = JSON.parse(await readFile(googleJsonPath, 'utf8'))
const googleResult = googleRaw?.result
if (!googleResult) {
  console.error('Google JSON does not contain result.')
  process.exit(2)
}

let savedRecord = null
if (restoreSavedImage) {
  if (!savedJsonPath) {
    console.error('Pass --saved-json when using --restore-saved-image.')
    process.exit(3)
  }
  const savedRaw = JSON.parse(await readFile(savedJsonPath, 'utf8'))
  savedRecord = savedRaw?.record ?? savedRaw
}

const account = JSON.parse(await readFile(serviceAccountPath, 'utf8'))
const app = initializeApp(
  { credential: cert(account), projectId },
  `recreate-place-from-google-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
const ref = db.collection('places').doc(placeId)
const beforeSnap = await ref.get()
const before = beforeSnap.exists ? beforeSnap.data() : null
const payload = payloadFromGoogle(placeId, googleResult)
if (restoreSavedImage && savedRecord) {
  payload.image_url = clean(savedRecord.image_url)
  payload.image_shade = clean(savedRecord.image_shade) || 'none'
}

console.log(
  JSON.stringify(
    {
      projectId,
      databaseId,
      commit,
      path: ref.path,
      before: before
        ? {
            name: before.name ?? '',
            formatted_address: before.formatted_address ?? '',
            image_url: before.image_url ?? '',
            phone: before.phone ?? '',
            website: before.website ?? '',
            default_currency_code: before.default_currency_code ?? '',
            oldShape: {
              creator_id: before.creator_id ?? '',
              created_at: before.created_at ?? null,
              updated_at: before.updated_at ?? null,
            },
          }
        : null,
      after: {
        name: payload.name,
        formatted_address: payload.formatted_address,
        image_url: payload.image_url,
        phone: payload.phone,
        website: payload.website,
        google_maps_url: payload.google_maps_url,
        types: payload.types,
        default_currency_code: payload.default_currency_code,
      },
    },
    null,
    2
  )
)

if (!commit) {
  console.log('[dry-run] pass --commit to delete and recreate the Place record.')
  process.exit(0)
}

await ref.delete()
await ref.set(payload)
const afterSnap = await ref.get()

console.log(
  JSON.stringify(
    {
      done: true,
      path: ref.path,
      exists: afterSnap.exists,
      saved: afterSnap.exists ? afterSnap.data() : null,
    },
    null,
    2
  )
)
