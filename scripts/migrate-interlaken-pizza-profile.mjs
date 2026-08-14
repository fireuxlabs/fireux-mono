#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-14
// usage_note: plan or apply the protected Interlaken Pizza profile enrichment from owner-controlled website media and fresh Google hours.

import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const BUCKET_NAME = 'misebox-78f9c.appspot.com'
const PLACE_ID = 'ChIJWcym7tulj0cRb3N2twqVj1U'
const ENV_PATH = 'projects/misebox/misebox-app/.env'
const ABOUT =
  'Interlaken Pizza serves freshly prepared pizza, kebab, burgers, pasta and grills in a relaxed local setting. Its menu brings together Italian favourites and Middle Eastern specialities, with food made for sharing around the table.'
const MEDIA = [
  {
    field: 'cover_image',
    objectPath: `places/${PLACE_ID}/cover`,
    sourceUrl:
      'https://interlakenpizza.ch/image/catalog/Categories/Pizza%20%282%29.png',
  },
  {
    field: 'gallery_images',
    objectPath: `places/${PLACE_ID}/gallery/pizza`,
    sourceUrl:
      'https://interlakenpizza.ch/image/catalog/Categories/Pizza%20%282%29.png',
  },
  {
    field: 'gallery_images',
    objectPath: `places/${PLACE_ID}/gallery/burger`,
    sourceUrl:
      'https://interlakenpizza.ch/image/catalog/Banner/Burgers%20%283%29.png',
  },
  {
    field: 'gallery_images',
    objectPath: `places/${PLACE_ID}/gallery/kebab`,
    sourceUrl:
      'https://interlakenpizza.ch/image/catalog/Banner/Kebabs%20%281%29.png',
  },
]
const GOOGLE_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
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
const sha256 = (value) =>
  createHash('sha256')
    .update(
      typeof value === 'string' || Buffer.isBuffer(value)
        ? value
        : JSON.stringify(stable(value))
    )
    .digest('hex')
const envValue = (source, key) => {
  const line = source
    .split(/\r?\n/u)
    .find((candidate) => candidate.trim().startsWith(`${key}=`))
  if (!line) return ''
  return line
    .slice(line.indexOf('=') + 1)
    .trim()
    .replace(/^['"]|['"]$/gu, '')
}
const businessHoursFromGoogle = (value) => {
  if (!Array.isArray(value)) return null
  const windows = value
    .map((period) => {
      const open = period?.open || {}
      const close = period?.close || {}
      const day = GOOGLE_DAYS[Number(open.day)]
      const openTime = text(open.time)
      if (!day || !/^\d{4}$/u.test(openTime)) return null
      if (!Object.keys(close).length && day === 'sunday' && openTime === '0000')
        return {
          days: [...GOOGLE_DAYS.slice(1), 'sunday'],
          open: '00:00',
          close: '00:00',
        }
      const closeTime = text(close.time)
      if (!/^\d{4}$/u.test(closeTime)) return null
      return {
        days: [day],
        open: `${openTime.slice(0, 2)}:${openTime.slice(2)}`,
        close: `${closeTime.slice(0, 2)}:${closeTime.slice(2)}`,
      }
    })
    .filter(Boolean)
  return windows.length ? { windows } : null
}

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  {
    credential: auth.credential,
    projectId: PROJECT_ID,
    storageBucket: BUCKET_NAME,
  },
  `migrate-interlaken-pizza-profile-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const placeRef = db.collection('places').doc(PLACE_ID)
const snapshot = await placeRef.get()
if (!snapshot.exists) throw new Error(`Missing Place: ${placeRef.path}`)
const place = snapshot.data() || {}
if (text(place.name) !== 'Interlaken Pizza')
  throw new Error(`Unexpected Place identity: ${text(place.name) || '<empty>'}`)
if (text(place.cover_image))
  throw new Error('Interlaken Pizza already has a cover image.')
if (Array.isArray(place.gallery_images) && place.gallery_images.length)
  throw new Error('Interlaken Pizza already has gallery images.')
if (text(place.about))
  throw new Error('Interlaken Pizza already has authored About copy.')
if (
  Array.isArray(place.business_hours?.windows) &&
  place.business_hours.windows.length
)
  throw new Error('Interlaken Pizza already has authored business hours.')
if (!['', 'Interlaken Pizza', 'IP'].includes(text(place.short_name)))
  throw new Error(`Unexpected existing short name: ${text(place.short_name)}`)

const env = await readFile(ENV_PATH, 'utf8')
const apiKey =
  envValue(env, 'GOOGLE_PLACES_API_KEY') ||
  envValue(env, 'NUXT_GOOGLE_PLACES_API_KEY') ||
  envValue(env, 'NUXT_PUBLIC_GOOGLE_PLACES_API_KEY')
if (!apiKey)
  throw new Error(`Google Places API key is missing from ${ENV_PATH}.`)
const googleUrl = new URL(
  'https://maps.googleapis.com/maps/api/place/details/json'
)
googleUrl.searchParams.set('place_id', PLACE_ID)
googleUrl.searchParams.set('fields', 'name,opening_hours,place_id')
googleUrl.searchParams.set('key', apiKey)
const googleResponse = await fetch(googleUrl, {
  signal: AbortSignal.timeout(10_000),
})
const google = await googleResponse.json()
if (
  !googleResponse.ok ||
  google?.status !== 'OK' ||
  text(google?.result?.place_id) !== PLACE_ID ||
  text(google?.result?.name) !== 'Interlaken Pizza'
)
  throw new Error(
    `Google Place verification failed: ${text(google?.status) || googleResponse.status}`
  )
const businessHours = businessHoursFromGoogle(
  google?.result?.opening_hours?.periods
)
if (!businessHours?.windows.length)
  throw new Error('Google did not return usable opening hours.')

const media = []
for (const item of MEDIA) {
  const response = await fetch(item.sourceUrl, {
    signal: AbortSignal.timeout(10_000),
  })
  const contentType = text(response.headers.get('content-type')).split(';')[0]
  const bytes = Buffer.from(await response.arrayBuffer())
  if (
    !response.ok ||
    !contentType.startsWith('image/') ||
    bytes.length < 10_000
  )
    throw new Error(`Owner media could not be verified: ${item.sourceUrl}`)
  media.push({
    ...item,
    contentType,
    size: bytes.length,
    sha256: sha256(bytes),
    bytes,
  })
}

const plan = {
  format: 'fireux-interlaken-pizza-profile-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  place_id: PLACE_ID,
  source_sha256: sha256(place),
  patch: { short_name: 'IP', about: ABOUT, business_hours: businessHours },
  media: media.map(({ bytes, ...item }) => item),
}
const planSha256 = sha256(plan)
if (!apply) {
  console.log(
    JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2)
  )
  process.exit(0)
}
if (text(args.confirm) !== planSha256)
  throw new Error(`Apply requires --confirm ${planSha256}`)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json'))
  throw new Error('Apply requires --backup /private/tmp/<name>.json')
const current = await placeRef.get()
if (!current.exists || sha256(current.data()) !== plan.source_sha256)
  throw new Error('Interlaken Pizza changed after planning.')
const bucket = getStorage(app).bucket(BUCKET_NAME)
for (const item of media) {
  const [exists] = await bucket.file(item.objectPath).exists()
  if (exists)
    throw new Error(
      `Storage target already exists: gs://${BUCKET_NAME}/${item.objectPath}`
    )
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-interlaken-pizza-profile-preimage/1',
    captured_at: new Date().toISOString(),
    plan_sha256: planSha256,
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    documents: [{ path: placeRef.path, data: stable(place) }],
  },
})
const uploaded = []
try {
  for (const item of media) {
    const token = randomUUID()
    await bucket
      .file(item.objectPath)
      .save(item.bytes, {
        resumable: false,
        metadata: {
          contentType: item.contentType,
          cacheControl: 'public, max-age=31536000, immutable',
          metadata: {
            firebaseStorageDownloadTokens: token,
            sourceUrl: item.sourceUrl,
            sourceSha256: item.sha256,
          },
        },
      })
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET_NAME)}/o/${encodeURIComponent(item.objectPath)}?alt=media&token=${encodeURIComponent(token)}`
    uploaded.push({ ...item, fileUrl })
  }
  const coverImage = uploaded.find(
    (item) => item.field === 'cover_image'
  )?.fileUrl
  const galleryImages = uploaded
    .filter((item) => item.field === 'gallery_images')
    .map((item) => item.fileUrl)
  const target = defineFirestoreMutationTarget({
    key: 'misebox.interlaken-pizza-profile',
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId: DATABASE_ID },
    collectionPath: 'places',
  })
  await mcpSkillUpdate(app, target, PLACE_ID, {
    ...plan.patch,
    cover_image: coverImage,
    gallery_images: galleryImages,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: 'system:migrate-interlaken-pizza-profile',
    },
  })
  const verified = await placeRef.get()
  const value = verified.data() || {}
  if (
    !verified.exists ||
    text(value.short_name) !== 'IP' ||
    text(value.about) !== ABOUT ||
    JSON.stringify(value.business_hours) !== JSON.stringify(businessHours) ||
    text(value.cover_image) !== coverImage ||
    JSON.stringify(value.gallery_images) !== JSON.stringify(galleryImages)
  )
    throw new Error('Post-write Place verification failed.')
  for (const item of uploaded)
    if (!(await bucket.file(item.objectPath).exists())[0])
      throw new Error(
        `Post-write Storage verification failed: ${item.objectPath}`
      )
  console.log(
    JSON.stringify(
      {
        mode: 'apply',
        ok: true,
        plan_sha256: planSha256,
        backup,
        place_id: PLACE_ID,
        imported_media: uploaded.map((item) => ({
          object_path: item.objectPath,
          sha256: item.sha256,
          size: item.size,
        })),
        business_hours: businessHours,
      },
      null,
      2
    )
  )
} catch (error) {
  for (const item of uploaded)
    await bucket
      .file(item.objectPath)
      .delete({ ignoreNotFound: true })
      .catch(() => {})
  throw error
}
