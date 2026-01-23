#!/usr/bin/env node
/*
  Migrate specific Places docs from legacy /avatar storage object to /image.

  Usage:
    pnpm -s tsx scripts/migrate-place-avatars-to-image.ts --project <projectId> --commit [--bucket <bucketName>]

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const IDS = [
  'ChIJ-x5EtnEzGQ0R8am5BtQUOLs',
  'ChIJ0UF6GPmvj0cR__jYKy-J8pE',
  'ChIJ4WdXoJIZjkcRFH_M6dS5EPo',
  'ChIJ5_TdZKNFj0cRunmn1AAOhAM',
  'ChIJ84hrmh6lj0cRoczGWuTvTtE',
  'ChIJEbkWR0ijj0cRiHfShuHPLcc',
  'ChIJGR6JR805jkcREU0bp-9yfRI',
  'ChIJGZLquf6bj0cRgf5eaOtK7PY',
  'ChIJHxvMffqkj0cR7zCUD5KfxXc',
  'ChIJQzGAsJCkj0cRJZIIj0XoBqA',
  'ChIJS1kBa_AGOEYRwRaP4kZIjvs',
  'ChIJTeUywPmbj0cR-wT2hmyQaUM',
  'ChIJWS2cLEkKkEcRPkeZB6EcnLk',
  'ChIJWfJ_ovw5jkcRbC19phRjokk',
  'ChIJXdh4fWQzGQ0Rv0Q55pCtVb4',
  'ChIJZYHwV2osOUYR6N1qUJ8m0jU',
  'ChIJcUsl4xejj0cRbug8Ds7VHNc',
  'ChIJfQbcFs5C2EcRfPr8IZUWn6g',
  'ChIJgZS5zY_8jkcRG3KbHXxkrlw',
  'ChIJoVol0XW33kcRzlGVA086YZc',
  'ChIJswCZ5HQzGQ0REazzU1ROadQ',
  'ChIJy9QERoAFR0YRAnMwI2eEV8Q',
]

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg) continue
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        out[key] = true
      } else {
        out[key] = next
        i += 1
      }
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const projectId =
  (typeof args.project === 'string' && args.project) ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  ''
const commit = Boolean(args.commit)
const bucketName =
  (typeof args.bucket === 'string' && args.bucket) ||
  process.env.FIREBASE_STORAGE_BUCKET ||
  ''

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  }
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }
  return applicationDefault()
}

if (!getApps().length) {
  initializeApp({
    credential: await resolveCredential(),
    projectId,
    storageBucket: bucketName || undefined,
  })
}

const db = getFirestore()
const storage = getStorage()
const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket()

const errors: Array<{ id: string; error: unknown }> = []
let migrated = 0
let skipped = 0
let missing = 0

function isFirebaseStorageUrl(value: string) {
  return value.includes('firebasestorage.googleapis.com')
}

function toDownloadUrl(path: string, token: string) {
  const encoded = encodeURIComponent(path)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`
}

async function ensureDownloadUrl(path: string): Promise<string> {
  const file = bucket.file(path)
  const [meta] = await file.getMetadata()
  const existing = meta?.metadata?.firebaseStorageDownloadTokens
  const token = existing || randomUUID()
  if (!existing) {
    await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } })
  }
  return toDownloadUrl(path, token)
}

for (const id of IDS) {
  try {
    const ref = db.collection('places').doc(id)
    const snap = await ref.get()
    if (!snap.exists) {
      console.log('[missing]', id)
      missing += 1
      continue
    }

    const data = snap.data() || {}
    const placeImage = typeof data.place_image === 'string' ? data.place_image : ''

    if (!isFirebaseStorageUrl(placeImage) || !placeImage.includes('/avatar')) {
      console.log('[skip]', id, 'place_image not legacy avatar')
      skipped += 1
      continue
    }

    const srcPath = `places/${id}/avatar`
    const destPath = `places/${id}/image`

    const srcFile = bucket.file(srcPath)
    const destFile = bucket.file(destPath)

    const [srcExists] = await srcFile.exists()
    if (!srcExists) {
      console.log('[skip]', id, 'source object missing')
      skipped += 1
      continue
    }

    const [destExists] = await destFile.exists()

    if (!commit) {
      console.log('[dry-run]', id, 'copy', srcPath, '->', destPath)
      skipped += 1
      continue
    }

    if (!destExists) {
      await srcFile.copy(destFile)
    }

    const newUrl = await ensureDownloadUrl(destPath)

    await ref.update({
      place_image: newUrl,
      migrated_at: FieldValue.serverTimestamp(),
      migration: {
        from: 'avatar',
        to: 'image',
        script: 'migrate-place-avatars-to-image',
        version: 1,
      },
    })

    console.log('[migrated]', id, newUrl)
    migrated += 1
  } catch (error) {
    console.error('[error]', id, error)
    errors.push({ id, error })
  }
}

console.log('\nSummary')
console.log('  migrated:', migrated)
console.log('  skipped:', skipped)
console.log('  missing:', missing)
if (errors.length) {
  console.log('  errors:')
  for (const entry of errors) {
    console.log('   -', entry.id, String(entry.error))
  }
}
