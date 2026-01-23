#!/usr/bin/env node
/*
  Update Places place_image URLs from legacy /avatar to /image.

  Usage:
    pnpm -s tsx scripts/update-place-image-urls.ts --project <projectId> --commit [--bucket <bucketName>] [--pageSize 250]

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

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
const pageSize = Math.min(Number(args.pageSize || 250), 500)

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

function isFirebaseStorageUrl(value: string) {
  return value.includes('firebasestorage.googleapis.com')
}

function isLegacyAvatarUrl(value: string) {
  return value.includes('/avatar') || value.includes('%2Favatar')
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

let processed = 0
let updated = 0
let skipped = 0
let missing = 0
let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null

while (true) {
  let q = db.collection('places').orderBy(FieldPath.documentId()).limit(pageSize)
  if (lastDoc) q = q.startAfter(lastDoc)

  const snap = await q.get()
  if (snap.empty) break

  for (const docSnap of snap.docs) {
    processed += 1
    lastDoc = docSnap

    const data = docSnap.data() || {}
    const placeImage = typeof data.place_image === 'string' ? data.place_image : ''

    if (!placeImage || !isFirebaseStorageUrl(placeImage) || !isLegacyAvatarUrl(placeImage)) {
      skipped += 1
      continue
    }

    const destPath = `places/${docSnap.id}/image`
    const destFile = bucket.file(destPath)
    const [destExists] = await destFile.exists()

    if (!destExists) {
      console.log('[missing]', docSnap.id, destPath)
      missing += 1
      continue
    }

    if (!commit) {
      console.log('[dry-run]', docSnap.id, destPath)
      skipped += 1
      continue
    }

    const newUrl = await ensureDownloadUrl(destPath)

    await docSnap.ref.update({
      place_image: newUrl,
      updated_at: FieldValue.serverTimestamp(),
      migration: {
        from: 'avatar-url',
        to: 'image-url',
        script: 'update-place-image-urls',
        version: 1,
      },
    })

    console.log('[updated]', docSnap.id, newUrl)
    updated += 1
  }
}

console.log('\nSummary')
console.log('  processed:', processed)
console.log('  updated:', updated)
console.log('  skipped:', skipped)
console.log('  missing:', missing)
