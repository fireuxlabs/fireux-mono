// @fireux-script
// last_used: 2026-07-21
// usage_note: write the exclusive exact Firestore and Storage preimage required before an Interlaken Dish image apply.
// Concurrent edit — 2026-07-21 23:59 CEST — Interlaken Pizza images: isolate protected preimage serialization from mutation mechanics.

import { createHash } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { Timestamp } from 'firebase-admin/firestore'

import { writeProtectedJsonArtifact } from './protected-json-artifact.mjs'
import { versionLabel } from './interlaken-pizza-image-plan.mjs'

const OPERATION = 'interlaken-dish-images'
const hash = (value) =>
  createHash('sha256').update(String(value ?? '')).digest('hex')

export async function writeInterlakenImagePreimage({ backupPath, plan }) {
  const resolved = path.resolve(backupPath)
  await mkdir(path.dirname(resolved), { recursive: true, mode: 0o700 })

  return writeProtectedJsonArtifact({
    path: resolved,
    payload: {
      schema: 'fireux.firestore-storage-preimage.v1',
      operation: OPERATION,
      createdAt: new Date().toISOString(),
      actor: plan.actor,
      target: plan.target,
      manifest: {
        path: plan.manifestPath,
        sha256: plan.manifestSha256,
      },
      planSha256: plan.planSha256,
      documents: plan.entries.map((entry) => ({
        path: entry.documentPath,
        updateTime: versionLabel(entry.expectedUpdateTime),
        before: serialiseFirestoreValue(entry.currentData),
        plannedFields: ['image', 'image_url', 'updated'],
      })),
      storage: plan.entries.map((entry) => ({
        bucket: plan.target.storageBucket,
        objectPath: entry.objectPath,
        before:
          entry.storageAction === 'create'
            ? { exists: false }
            : {
                exists: true,
                generation: entry.storageGeneration,
                sha256: entry.localSha256,
                downloadTokenSha256: hash(entry.storageDownloadToken),
              },
      })),
    },
  })
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function serialiseFirestoreValue(value) {
  if (value instanceof Timestamp) {
    return {
      __firestore_type: 'timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (value instanceof Date) {
    return { __firestore_type: 'date', value: value.toISOString() }
  }
  if (Buffer.isBuffer(value)) {
    return { __firestore_type: 'bytes', base64: value.toString('base64') }
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { __firestore_type: 'number', value: String(value) }
  }
  if (Array.isArray(value)) return value.map(serialiseFirestoreValue)
  if (value?.constructor?.name === 'DocumentReference') {
    return { __firestore_type: 'reference', path: value.path }
  }
  if (value?.constructor?.name === 'GeoPoint') {
    return {
      __firestore_type: 'geopoint',
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }
  if (typeof value?.toBase64 === 'function') {
    return { __firestore_type: 'bytes', base64: value.toBase64() }
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        serialiseFirestoreValue(entry),
      ])
    )
  }
  if (value && typeof value === 'object') {
    throw new Error(
      `Cannot create exact preimage for Firestore ${value.constructor?.name || 'value'}.`
    )
  }
  return value
}
