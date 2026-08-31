#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-30
// usage_note: plan or apply the protected La Tapberne Place discovery-media backfill.

import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { initializeApp, deleteApp } from 'firebase-admin/app'
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
const PLACE_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const IMAGE_PATH =
  'projects/misebox/la-tap-berne/public/img/gallery/image-1.png'
const OBJECT_PATH = `places/${PLACE_ID}/cover`
const ABOUT =
  'La Tap Berne is a relaxed pub for tapas, Comida Casera, and easy drinks in Matten bei Interlaken. Come for Iberian small plates, tortilla, bravas, pimientos, ribs, and food made for sharing around the table.'
const TAGS = ['spanish', 'tapas', 'pub', 'restaurant']

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
    .update(Buffer.isBuffer(value) ? value : JSON.stringify(stable(value)))
    .digest('hex')

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
  `backfill-la-tapberne-discovery-${Date.now()}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const placeRef = db.collection('places').doc(PLACE_ID)
  const snapshot = await placeRef.get()
  if (!snapshot.exists) throw new Error(`Missing Place: ${placeRef.path}`)
  const place = snapshot.data() || {}
  if (!['La Tapberne', 'La Tap Berne'].includes(text(place.name)))
    throw new Error(
      `Unexpected Place identity: ${text(place.name) || '<empty>'}`
    )
  if (text(place.about) || text(place.cover_image))
    throw new Error('La Tapberne discovery content is already populated.')
  if (Array.isArray(place.tags) && place.tags.length)
    throw new Error('La Tapberne discovery tags are already populated.')

  const bytes = await readFile(IMAGE_PATH)
  if (bytes.length < 10_000)
    throw new Error('Source image is unexpectedly small.')
  const plan = {
    format: 'fireux-la-tapberne-discovery-plan/1',
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    place_id: PLACE_ID,
    source_sha256: sha256(place),
    image: {
      source_path: IMAGE_PATH,
      object_path: OBJECT_PATH,
      size: bytes.length,
      sha256: sha256(bytes),
    },
    patch: { about: ABOUT, tags: TAGS },
  }
  const planSha256 = sha256(plan)
  if (!apply) {
    console.log(
      JSON.stringify(
        { mode: 'plan', plan_sha256: planSha256, ...plan },
        null,
        2
      )
    )
    process.exitCode = 0
  } else {
    if (text(args.confirm) !== planSha256)
      throw new Error(`Apply requires --confirm ${planSha256}`)
    const backupPath = text(args.backup)
    if (
      !backupPath.startsWith('/private/tmp/') ||
      !backupPath.endsWith('.json')
    )
      throw new Error('Apply requires --backup /private/tmp/<name>.json')
    const current = await placeRef.get()
    if (!current.exists || sha256(current.data()) !== plan.source_sha256)
      throw new Error('La Tapberne changed after planning.')
    const bucket = getStorage(app).bucket(BUCKET_NAME)
    const object = bucket.file(OBJECT_PATH)
    if ((await object.exists())[0])
      throw new Error(
        `Storage target already exists: gs://${BUCKET_NAME}/${OBJECT_PATH}`
      )
    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: {
        format: 'fireux-la-tapberne-discovery-preimage/1',
        captured_at: new Date().toISOString(),
        plan_sha256: planSha256,
        documents: [{ path: placeRef.path, data: stable(place) }],
      },
    })
    const token = randomUUID()
    let uploaded = false
    try {
      await object.save(bytes, {
        resumable: false,
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000, immutable',
          metadata: {
            firebaseStorageDownloadTokens: token,
            sourcePath: IMAGE_PATH,
            sourceSha256: plan.image.sha256,
          },
        },
      })
      uploaded = true
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET_NAME)}/o/${encodeURIComponent(OBJECT_PATH)}?alt=media&token=${encodeURIComponent(token)}`
      const target = defineFirestoreMutationTarget({
        key: 'misebox.la-tapberne-discovery',
        lane: 'mcp-skill',
        verbs: ['update'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: 'places',
      })
      await mcpSkillUpdate(app, target, PLACE_ID, {
        ...plan.patch,
        cover_image: imageUrl,
        gallery_images: [imageUrl],
        updated: {
          at: FieldValue.serverTimestamp(),
          by: 'system:backfill-la-tapberne-discovery',
        },
      })
      const verified = (await placeRef.get()).data() || {}
      if (
        text(verified.about) !== ABOUT ||
        JSON.stringify(verified.tags) !== JSON.stringify(TAGS) ||
        text(verified.cover_image) !== imageUrl ||
        JSON.stringify(verified.gallery_images) !==
          JSON.stringify([imageUrl]) ||
        !(await object.exists())[0]
      )
        throw new Error('Post-write La Tapberne verification failed.')
      console.log(
        JSON.stringify(
          {
            mode: 'apply',
            ok: true,
            plan_sha256: planSha256,
            backup: backup.path,
            place_id: PLACE_ID,
            image_url: imageUrl,
          },
          null,
          2
        )
      )
    } catch (error) {
      if (uploaded)
        await object.delete({ ignoreNotFound: true }).catch(() => {})
      throw error
    }
  }
} finally {
  await deleteApp(app)
}
