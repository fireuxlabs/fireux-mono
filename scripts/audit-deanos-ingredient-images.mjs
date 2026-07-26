// @fireux-script
// last_used: 2026-07-26
// usage_note: read-only audit of Deanos usage links against canonical Misebox Ingredient roots and Storage.

import { getApps, initializeApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const STORAGE_BUCKET = 'misebox-78f9c.appspot.com'
const ASSET_DIRECTORY =
  'packages/extensions/fireux-kitchens/src/runtime/public/img/showcase/ingredients'
const MANIFEST_PATH =
  'scripts/data/misebox-kitchen-ingredient-promotion.json'

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
const entriesToAudit = Array.isArray(manifest.entries) ? manifest.entries : []
const ids = entriesToAudit.map(entry => String(entry.ingredient_id || '').trim())

if (
  manifest.format !== 'fireux-misebox-kitchen-ingredient-promotion/1' ||
  ids.length !== 68 ||
  new Set(ids).size !== ids.length
) {
  throw new Error(
    `Expected 68 unique canonical Ingredient ids; found ${ids.length}.`
  )
}

const localFiles = new Set(await readdir(ASSET_DIRECTORY))
const credential = await resolveFirebaseAdminCredential({
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  {
    credential: credential.credential,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  },
  `audit-deanos-ingredient-images-${process.pid}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const bucket = getStorage(app).bucket(STORAGE_BUCKET)
  const rootSnapshots = await db.getAll(
    ...ids.map((id) => db.collection('ingredients').doc(id))
  )
  const roots = new Map(
    rootSnapshots.map((snapshot) => [snapshot.id, snapshot])
  )

  const entries = []
  for (const manifestEntry of entriesToAudit) {
    const id = String(manifestEntry.ingredient_id || '').trim()
    const sourceAssetId = String(manifestEntry.source_asset_id || '').trim()
    const asset = `${ASSET_DIRECTORY}/${sourceAssetId}.jpg`
    const localExists = localFiles.has(`${sourceAssetId}.jpg`)
    const localStat = localExists ? await stat(asset) : null
    const root = roots.get(id)
    const canonicalRoot = Boolean(root?.exists)
    const storageObject = canonicalRoot ? `ingredients/${id}/image_url` : ''
    const currentImageUrl = canonicalRoot
      ? String(root.get('image_url') || '')
      : ''
    let storage = null
    let imageUrlVerification = null

    if (storageObject) {
      const file = bucket.file(storageObject)
      const [exists] = await file.exists()
      if (exists) {
        const [metadata] = await file.getMetadata()
        storage = {
          exists: true,
          generation: String(metadata.generation || ''),
          size: Number(metadata.size || 0),
          content_type: String(metadata.contentType || ''),
          download_tokens: String(
            metadata.metadata?.firebaseStorageDownloadTokens || ''
          ),
        }
      } else {
        storage = { exists: false }
      }
    }

    if (currentImageUrl) {
      const response = await fetch(currentImageUrl, { method: 'HEAD' })
      imageUrlVerification = {
        ok: response.ok,
        status: response.status,
        content_type: String(response.headers.get('content-type') || ''),
        content_length: Number(response.headers.get('content-length') || 0),
      }
    }

    entries.push({
      ingredient_id: id,
      source_asset_id: sourceAssetId,
      canonical_root: canonicalRoot,
      canonical_name: canonicalRoot ? String(root.get('name') || '') : '',
      source: localExists
        ? {
            asset,
            bytes: localStat.size,
            provenance: 'reviewed-promotion-source',
          }
        : null,
      storage_object: storageObject,
      storage,
      final_image_url: currentImageUrl,
      verification: {
        local_asset: localExists,
        canonical_identity: canonicalRoot ? 'matched' : 'missing',
        image_url: imageUrlVerification,
      },
    })
  }

  console.log(
    JSON.stringify(
      {
        format: 'fireux-deanos-ingredient-image-audit/1',
        read_only: true,
        target: {
          project_id: PROJECT_ID,
          database_id: DATABASE_ID,
          storage_bucket: STORAGE_BUCKET,
        },
        credential_source: credential.source,
        counts: {
          requested: entries.length,
          local_assets: entries.filter((entry) => entry.source).length,
          canonical_roots: entries.filter((entry) => entry.canonical_root)
            .length,
          missing_canonical_roots: entries.filter(
            (entry) => !entry.canonical_root
          ).length,
          existing_storage_objects: entries.filter(
            (entry) => entry.storage?.exists
          ).length,
          missing_storage_objects: entries.filter(
            (entry) => entry.storage && !entry.storage.exists
          ).length,
          canonical_image_urls: entries.filter((entry) => entry.final_image_url)
            .length,
          verified_image_urls: entries.filter(
            (entry) => entry.verification.image_url?.ok
          ).length,
        },
        entries,
      },
      null,
      2
    )
  )
} finally {
  if (getApps().includes(app)) await deleteApp(app)
}
