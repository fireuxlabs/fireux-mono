// @fireux-script
// last_used: 2026-07-22
// usage_note: validate the reviewed Interlaken image manifest and build a fixed-target Dish image publication plan.
// Concurrent edit — 2026-07-21 23:57 CEST — Interlaken Pizza images: add the dry-run-first canonical Dish publication plan.
// Concurrent edit — 2026-07-22 00:34 CEST — Interlaken image apply safety: expose pinned mismatch and manual-review exclusions separately.

import { createHash } from 'node:crypto'

import { readInterlakenImageManifest } from './interlaken-pizza-image-manifest.mjs'
import { INTERLAKEN_PIZZA_TARGET } from './interlaken-pizza-target.mjs'

const text = (value) => String(value ?? '').trim()
const hash = (value) =>
  createHash('sha256')
    .update(Buffer.isBuffer(value) ? value : String(value ?? ''))
    .digest('hex')

export async function buildInterlakenImagePlan({
  actor,
  bucket,
  db,
  manifestPath,
  repoRoot,
}) {
  const loaded = await readInterlakenImageManifest({ manifestPath, repoRoot })
  const { candidates, manifestSkipped } = loaded
  const refs = candidates.map((candidate) => db.doc(candidate.documentPath))
  const snapshots = refs.length ? await db.getAll(...refs) : []
  const inspected = await mapLimit(candidates, 6, async (candidate, index) => {
    const snapshot = snapshots[index]
    return inspectLiveCandidate(candidate, snapshot, bucket)
  })
  const entries = inspected
    .filter((result) => result.kind === 'entry')
    .map((result) => result.value)
    .sort((left, right) => left.dishId.localeCompare(right.dishId))
  const skipped = [
    ...manifestSkipped,
    ...inspected
      .filter((result) => result.kind === 'skipped')
      .map((result) => result.value),
  ].sort((left, right) => left.dishId.localeCompare(right.dishId))
  const blockers = inspected
    .filter((result) => result.kind === 'blocker')
    .map((result) => result.value)
    .sort((left, right) => left.dishId.localeCompare(right.dishId))

  const planShape = {
    operation: 'interlaken-dish-images',
    actor,
    target: INTERLAKEN_PIZZA_TARGET,
    manifestSha256: loaded.manifestSha256,
    entries: entries.map(planEntryShape),
    skipped: skipped.map((item) => ({
      dishId: item.dishId,
      reason: item.reason,
      dishImageSha256: item.dishImageSha256,
      reviewNote: item.reviewNote,
      sourceImageSha256: item.sourceImageSha256,
    })),
    blockers,
  }
  const planSha256 = hash(JSON.stringify(planShape))

  return {
    actor,
    blockers,
    entries,
    manifest: loaded.manifest,
    manifestPath,
    manifestSha256: loaded.manifestSha256,
    planSha256,
    skipped,
    target: INTERLAKEN_PIZZA_TARGET,
  }
}

export function interlakenImagePlanOutput(plan) {
  const exact = plan.entries.filter(
    (entry) => entry.matchStatus === 'exact'
  ).length
  const probable = plan.entries.filter(
    (entry) => entry.matchStatus === 'probable'
  ).length
  const creates = plan.entries.filter(
    (entry) => entry.storageAction === 'create'
  ).length
  const reuses = plan.entries.length - creates
  const reviewedWrongSourceExclusions = plan.skipped.filter(
    (item) => item.reason === 'reviewed_wrong_website_image'
  ).length
  const reviewedManualSourceExclusions = plan.skipped.filter(
    (item) => item.reason === 'reviewed_manual_image'
  ).length
  const existingImagesPreserved = plan.skipped.filter((item) =>
    ['manifest_image_already_present', 'live_image_now_present'].includes(
      item.reason
    )
  ).length

  return {
    target: plan.target,
    manifestPath: plan.manifestPath,
    manifestSha256: plan.manifestSha256,
    planSha256: plan.planSha256,
    counts: {
      planned: plan.entries.length,
      exact,
      probable,
      storageCreates: creates,
      identicalStorageReuses: reuses,
      existingImagesPreserved,
      reviewedWrongSourceImagesExcluded: reviewedWrongSourceExclusions,
      reviewedManualSourceImagesExcluded: reviewedManualSourceExclusions,
      blockers: plan.blockers.length,
    },
    entries: plan.entries.map((entry) => ({
      dishId: entry.dishId,
      dishName: entry.dishName,
      matchStatus: entry.matchStatus,
      confidence: entry.confidence,
      websiteProductId: entry.websiteProductId,
      websiteName: entry.websiteName,
      websiteImageUrl: entry.websiteImageUrl,
      storageAction: entry.storageAction,
      localSha256: entry.localSha256,
      objectPath: entry.objectPath,
    })),
    skipped: plan.skipped.map(({ dishId, dishName, reason, reviewNote }) => ({
      dishId,
      dishName,
      reason,
      reviewNote,
    })),
    blockers: plan.blockers,
  }
}

async function inspectLiveCandidate(candidate, snapshot, bucket) {
  if (!snapshot?.exists) {
    return blocker(candidate, 'Dish document is missing.')
  }
  const data = snapshot.data() || {}
  if (text(data.id) !== candidate.dishId) {
    return blocker(candidate, 'Dish document id field no longer matches.')
  }
  if (text(data.kitchen_id) !== candidate.expectedKitchenId) {
    return blocker(candidate, 'Dish kitchen_id no longer matches the fixed target.')
  }
  if (text(data.name) !== candidate.dishName) {
    return blocker(candidate, 'Dish name changed after the audit manifest.')
  }
  if (text(data.item_kind) !== candidate.expectedItemKind) {
    return blocker(candidate, 'Dish item_kind changed after the audit manifest.')
  }
  if (!snapshot.updateTime) {
    return blocker(candidate, 'Dish updateTime is unavailable.')
  }
  if (text(data.image_url)) {
    return blocker(candidate, 'Dish still uses legacy image_url; migrate it to image first.')
  }
  if (text(data.image)) {
    return {
      kind: 'skipped',
      value: {
        dishId: candidate.dishId,
        dishName: candidate.dishName,
        reason: 'live_image_now_present',
        dishImageSha256: hash(data.image),
      },
    }
  }

  const file = bucket.file(candidate.objectPath)
  const storage = await inspectStorageObject(file)
  if (storage.exists && storage.sha256 !== candidate.localSha256) {
    return blocker(candidate, 'Canonical Storage object exists with different bytes.')
  }
  if (
    storage.exists &&
    (storage.contentType !== 'image/webp' || !storage.downloadToken)
  ) {
    return blocker(
      candidate,
      'Identical Storage object lacks canonical WebP metadata or a download token.'
    )
  }

  return {
    kind: 'entry',
    value: {
      ...candidate,
      currentData: data,
      documentRef: snapshot.ref,
      expectedUpdateTime: snapshot.updateTime,
      storageAction: storage.exists ? 'reuse' : 'create',
      storageGeneration: storage.generation,
      storageDownloadToken: storage.downloadToken,
      storageUrl: storage.exists
        ? firebaseStorageDownloadUrl(
            INTERLAKEN_PIZZA_TARGET.storageBucket,
            candidate.objectPath,
            storage.downloadToken
          )
        : '',
    },
  }
}

async function inspectStorageObject(file) {
  try {
    const [before] = await file.getMetadata()
    const generation = text(before.generation)
    const [buffer] = await file.download({ validation: 'md5' })
    const [after] = await file.getMetadata()
    if (!generation || generation !== text(after.generation)) {
      throw new Error(`Storage object changed while it was inspected: ${file.name}`)
    }
    return {
      exists: true,
      contentType: text(after.contentType),
      downloadToken: firstDownloadToken(after),
      generation,
      sha256: hash(buffer),
    }
  } catch (error) {
    if (Number(error?.code) === 404) {
      return {
        exists: false,
        contentType: '',
        downloadToken: '',
        generation: '',
        sha256: '',
      }
    }
    throw error
  }
}

function firstDownloadToken(metadata) {
  return text(metadata?.metadata?.firebaseStorageDownloadTokens)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)[0] || ''
}

export function firebaseStorageDownloadUrl(bucketName, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

function planEntryShape(entry) {
  return {
    dishId: entry.dishId,
    documentPath: entry.documentPath,
    updateTime: versionLabel(entry.expectedUpdateTime),
    matchStatus: entry.matchStatus,
    confidence: entry.confidence,
    websiteProductId: entry.websiteProductId,
    websiteName: entry.websiteName,
    websiteImageUrl: entry.websiteImageUrl,
    localSha256: entry.localSha256,
    objectPath: entry.objectPath,
    storageAction: entry.storageAction,
    storageGeneration: entry.storageGeneration,
    storageTokenSha256: entry.storageDownloadToken
      ? hash(entry.storageDownloadToken)
      : '',
  }
}

function blocker(candidate, reason) {
  return {
    kind: 'blocker',
    value: {
      dishId: candidate.dishId,
      dishName: candidate.dishName,
      reason,
    },
  }
}

export function versionLabel(value) {
  return value && Number.isInteger(value.seconds)
    ? `${value.seconds}.${String(value.nanoseconds).padStart(9, '0')}`
    : ''
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
