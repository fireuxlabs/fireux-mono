// @fireux-script
// last_used: 2026-07-21
// usage_note: back up and explicitly apply a reviewed Interlaken Dish image plan with Storage and Firestore version guards.
// Concurrent edit — 2026-07-21 23:59 CEST — Interlaken Pizza images: add create-only Storage publication and atomic Dish pointer updates.

import { createHash, randomUUID } from 'node:crypto'

import { FieldValue } from 'firebase-admin/firestore'

import { firebaseStorageDownloadUrl } from './interlaken-pizza-image-plan.mjs'

const OPERATION = 'interlaken-dish-images'
const CACHE_CONTROL = 'public, max-age=300'

const text = (value) => String(value ?? '').trim()
const hash = (value) =>
  createHash('sha256')
    .update(Buffer.isBuffer(value) ? value : String(value ?? ''))
    .digest('hex')

export async function applyInterlakenImagePlan({ bucket, db, plan }) {
  if (plan.blockers.length) {
    throw new Error('Refusing to apply an Interlaken image plan with blockers.')
  }
  if (!plan.entries.length) {
    return {
      storageCreated: 0,
      storageReused: 0,
      firestoreUpdated: 0,
      verified: 0,
    }
  }
  if (plan.entries.length > 500) {
    throw new Error('Interlaken image plan exceeds the atomic write limit.')
  }

  const createdObjects = []
  let firestoreCommitted = false
  let published = []

  try {
    await assertDishVersions(db, plan, 'before Storage upload')
    published = await mapLimit(plan.entries, 4, (entry) =>
      publishEntry(bucket, plan, entry, createdObjects)
    )

    await db.runTransaction(async (transaction) => {
      const snapshots = await transaction.getAll(
        ...plan.entries.map((entry) => entry.documentRef)
      )
      assertDishSnapshots(snapshots, plan, 'inside the Firestore transaction')

      for (let index = 0; index < plan.entries.length; index += 1) {
        transaction.update(plan.entries[index].documentRef, {
          image_url: published[index].url,
          updated: {
            at: FieldValue.serverTimestamp(),
            by: plan.actor,
          },
        })
      }
    })
    firestoreCommitted = true

    const verified = await verifyAppliedPlan({ bucket, db, plan, published })
    return applyResult(plan, published, verified)
  } catch (error) {
    if (!firestoreCommitted && published.length === plan.entries.length) {
      let pointerState
      try {
        pointerState = await readPublishedPointerState(db, plan, published)
      } catch (readError) {
        throw new Error(
          `${error instanceof Error ? error.message : String(error)} Firestore commit state could not be read, so Storage cleanup was skipped. Created objects: ${JSON.stringify(createdObjectInventory(createdObjects))}`,
          { cause: readError }
        )
      }
      if (pointerState.matched === plan.entries.length) {
        firestoreCommitted = true
        const verified = await verifyAppliedPlan({ bucket, db, plan, published })
        return applyResult(plan, published, verified, {
          recoveredAfterTransactionError: true,
        })
      }
      if (pointerState.matched > 0) {
        throw new Error(
          `${error instanceof Error ? error.message : String(error)} ${pointerState.matched} Dish image pointers already reference this run, so Storage cleanup was skipped. Created objects: ${JSON.stringify(createdObjectInventory(createdObjects))}`,
          { cause: error }
        )
      }
    }
    if (!firestoreCommitted && createdObjects.length) {
      const cleanup = await cleanupCreatedObjects(createdObjects)
      console.error(
        `[interlaken-dish-images] pre-commit Storage cleanup ${JSON.stringify(cleanup)}`
      )
      throw new Error(
        `${error instanceof Error ? error.message : String(error)} Pre-commit Storage cleanup: ${JSON.stringify(cleanup)}`,
        { cause: error }
      )
    }
    throw error
  }
}

function applyResult(plan, published, verified, extra = {}) {
  return {
    storageCreated: published.filter((item) => item.action === 'create').length,
    storageReused: published.filter((item) => item.action === 'reuse').length,
    firestoreUpdated: plan.entries.length,
    verified,
    ...extra,
  }
}

async function publishEntry(bucket, plan, entry, createdObjects) {
  if (entry.storageAction === 'reuse') {
    const current = await verifyStorageObject(bucket, entry, {
      expectedGeneration: entry.storageGeneration,
      expectedToken: entry.storageDownloadToken,
    })
    return {
      action: 'reuse',
      dishId: entry.dishId,
      generation: current.generation,
      token: entry.storageDownloadToken,
      url: entry.storageUrl,
    }
  }

  const token = randomUUID()
  const file = bucket.file(entry.objectPath)
  const created = {
    dishId: entry.dishId,
    file,
    objectPath: entry.objectPath,
    sha256: entry.localSha256,
    token,
  }
  try {
    await file.save(entry.buffer, {
      resumable: false,
      validation: 'md5',
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: {
        contentType: 'image/webp',
        cacheControl: CACHE_CONTROL,
        metadata: {
          firebaseStorageDownloadTokens: token,
          fireuxImportOperation: OPERATION,
          fireuxImportSha256: entry.localSha256,
        },
      },
    })
    createdObjects.push(created)
  } catch (error) {
    if (await storageObjectOwnedBy(created).catch(() => false)) {
      createdObjects.push(created)
    }
    throw error
  }

  const current = await verifyStorageObject(bucket, entry, {
    expectedToken: token,
  })
  created.generation = current.generation
  return {
    action: 'create',
    dishId: entry.dishId,
    generation: current.generation,
    token,
    url: firebaseStorageDownloadUrl(
      plan.target.storageBucket,
      entry.objectPath,
      token
    ),
  }
}

async function assertDishVersions(db, plan, phase) {
  const snapshots = await db.getAll(
    ...plan.entries.map((entry) => entry.documentRef)
  )
  assertDishSnapshots(snapshots, plan, phase)
}

function assertDishSnapshots(snapshots, plan, phase) {
  for (let index = 0; index < plan.entries.length; index += 1) {
    const entry = plan.entries[index]
    const snapshot = snapshots[index]
    if (!snapshot?.exists) {
      throw new Error(`Dish disappeared ${phase}: ${entry.documentPath}`)
    }
    if (!sameVersion(snapshot.updateTime, entry.expectedUpdateTime)) {
      throw new Error(`Dish changed ${phase}: ${entry.documentPath}`)
    }
    if (text(snapshot.data()?.image_url)) {
      throw new Error(`Dish gained an image ${phase}: ${entry.documentPath}`)
    }
  }
}

async function readPublishedPointerState(db, plan, published) {
  const snapshots = await db.getAll(
    ...plan.entries.map((entry) => entry.documentRef)
  )
  return {
    matched: snapshots.filter(
      (snapshot, index) =>
        snapshot?.exists &&
        text(snapshot.data()?.image_url) === published[index].url
    ).length,
  }
}

function createdObjectInventory(createdObjects) {
  return createdObjects.map(({ dishId, generation, objectPath }) => ({
    dishId,
    generation: text(generation),
    objectPath,
  }))
}

async function cleanupCreatedObjects(createdObjects) {
  return mapLimit(createdObjects, 4, async (created) => {
    try {
      const [metadata] = await created.file.getMetadata()
      const generation = text(metadata.generation)
      if (!storageMetadataOwnedBy(metadata, created)) {
        return {
          dishId: created.dishId,
          objectPath: created.objectPath,
          status: 'not_deleted_metadata_changed',
          generation,
        }
      }
      await created.file.delete({
        preconditionOpts: { ifGenerationMatch: generation },
      })
      return {
        dishId: created.dishId,
        objectPath: created.objectPath,
        status: 'deleted',
        generation,
      }
    } catch (error) {
      if (Number(error?.code) === 404) {
        return {
          dishId: created.dishId,
          objectPath: created.objectPath,
          status: 'already_missing',
          generation: text(created.generation),
        }
      }
      return {
        dishId: created.dishId,
        objectPath: created.objectPath,
        status: 'delete_failed',
        generation: text(created.generation),
        error: error instanceof Error ? error.message : String(error),
      }
    }
  })
}

async function storageObjectOwnedBy(created) {
  const [metadata] = await created.file.getMetadata()
  return storageMetadataOwnedBy(metadata, created)
}

function storageMetadataOwnedBy(metadata, created) {
  return Boolean(
    text(metadata?.metadata?.fireuxImportOperation) === OPERATION &&
      text(metadata?.metadata?.fireuxImportSha256) === created.sha256 &&
      downloadTokens(metadata).includes(created.token)
  )
}

async function verifyAppliedPlan({ bucket, db, plan, published }) {
  const snapshots = await db.getAll(
    ...plan.entries.map((entry) => entry.documentRef)
  )
  for (let index = 0; index < plan.entries.length; index += 1) {
    const entry = plan.entries[index]
    const snapshot = snapshots[index]
    if (!snapshot?.exists) {
      throw new Error(`Verification failed; Dish is missing: ${entry.documentPath}`)
    }
    if (text(snapshot.data()?.image_url) !== published[index].url) {
      throw new Error(`Verification failed; image_url differs: ${entry.documentPath}`)
    }
    if (text(snapshot.data()?.updated?.by) !== plan.actor) {
      throw new Error(`Verification failed; updated.by differs: ${entry.documentPath}`)
    }
  }

  await mapLimit(plan.entries, 4, (entry, index) =>
    verifyStorageObject(bucket, entry, {
      expectedGeneration: published[index].generation,
      expectedToken: published[index].token,
    })
  )
  return plan.entries.length
}

async function verifyStorageObject(
  bucket,
  entry,
  { expectedGeneration = '', expectedToken = '' } = {}
) {
  const file = bucket.file(entry.objectPath)
  const [before] = await file.getMetadata()
  const generation = text(before.generation)
  if (expectedGeneration && generation !== text(expectedGeneration)) {
    throw new Error(`Storage generation changed: ${entry.objectPath}`)
  }
  if (text(before.contentType) !== 'image/webp') {
    throw new Error(`Storage content type differs: ${entry.objectPath}`)
  }
  if (!downloadTokens(before).includes(expectedToken)) {
    throw new Error(`Storage download token differs: ${entry.objectPath}`)
  }

  const [buffer] = await file.download({ validation: 'md5' })
  const [after] = await file.getMetadata()
  if (generation !== text(after.generation)) {
    throw new Error(`Storage object changed during verification: ${entry.objectPath}`)
  }
  if (hash(buffer) !== entry.localSha256) {
    throw new Error(`Storage bytes differ: ${entry.objectPath}`)
  }
  return { generation }
}

function downloadTokens(metadata) {
  return text(metadata?.metadata?.firebaseStorageDownloadTokens)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function sameVersion(left, right) {
  return Boolean(
    left &&
      right &&
      (typeof left.isEqual === 'function'
        ? left.isEqual(right)
        : versionLabel(left) === versionLabel(right))
  )
}

async function mapLimit(values, concurrency, mapper) {
  const output = new Array(values.length)
  let cursor = 0
  let failure = null

  async function worker() {
    while (!failure && cursor < values.length) {
      const index = cursor
      cursor += 1
      try {
        output[index] = await mapper(values[index], index)
      } catch (error) {
        failure ||= error
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, values.length || 1)) },
      () => worker()
    )
  )
  if (failure) throw failure
  return output
}
