// Concurrent edit — 2026-07-22 00:38 CEST — Dish image server: normalize and persist canonical Dish image objects.
// Concurrent edit — 2026-07-22 01:48 CEST — Dish image atomicity: publish an immutable object before moving the Firestore pointer.
import { randomUUID } from 'node:crypto'
import { getStorage } from 'firebase-admin/storage'
import { createError } from 'h3'
import sharp from 'sharp'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import {
  firebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import { dishImageStoragePath } from '../../utils/dish-image-storage.ts'

const outputSize = 1200
const clearMargin = 120
const contentSize = outputSize - clearMargin * 2
const maxInputPixels = 40_000_000
const writeMarker = 'fireuxDishImageWriteId'

type DishImageTarget = {
  appId: string
  kitchenId: string
  dishId: string
}

type StorageBucket = ReturnType<ReturnType<typeof getStorage>['bucket']>

const text = (value: unknown) => String(value ?? '').trim()

const missingStorageObject = (error: unknown) => {
  const source =
    error && typeof error === 'object'
      ? (error as { code?: unknown; statusCode?: unknown })
      : {}
  const code = String(source.code ?? '').toLowerCase()

  return (
    source.statusCode === 404 || code === '404' || code.includes('not-found')
  )
}

const storagePreconditionFailed = (error: unknown) => {
  const source =
    error && typeof error === 'object'
      ? (error as { code?: unknown; statusCode?: unknown })
      : {}
  return Number(source.code ?? source.statusCode) === 412
}

const customMetadata = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [text(key), text(entry)] as const)
      .filter(([key, entry]) => key && entry)
  )
}

const downloadTokens = (metadata: Record<string, string>) =>
  text(metadata.firebaseStorageDownloadTokens)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

const dishImageConflict = () =>
  createError({
    statusCode: 409,
    statusMessage: 'The Dish image changed during upload. Please try again.',
  })

async function currentObjectMetadata(
  bucket: StorageBucket,
  objectPath: string
) {
  const [metadata] = await bucket.file(objectPath).getMetadata()
  return {
    generation: text(metadata.generation),
    metageneration: text(metadata.metageneration),
    customMetadata: customMetadata(metadata.metadata),
  }
}

async function normalizeDishImage(data: Buffer) {
  try {
    const source = sharp(data, {
      failOn: 'error',
      limitInputPixels: maxInputPixels,
    })
    const metadata = await source.metadata()
    if (
      !metadata.format ||
      !['jpeg', 'png', 'webp'].includes(metadata.format)
    ) {
      throw new Error('unsupported format')
    }

    return await source
      .rotate()
      .trim({
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        threshold: 4,
      })
      .resize(contentSize, contentSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: clearMargin,
        bottom: clearMargin,
        left: clearMargin,
        right: clearMargin,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 88, alphaQuality: 100, effort: 4 })
      .toBuffer()
  } catch {
    throw createError({
      statusCode: 415,
      statusMessage: 'Upload a valid JPEG, PNG, or WebP Dish image.',
    })
  }
}

export async function normalizeAndSaveDishImage(
  input: DishImageTarget & {
    data: Buffer
  }
) {
  const data = await normalizeDishImage(input.data)
  const uploadId = randomUUID()
  const downloadToken = randomUUID()
  const objectPath = dishImageStoragePath(
    input.appId,
    input.kitchenId,
    input.dishId,
    uploadId
  )
  const bucketName = runtimeStorageBucketName()
  const bucket = getStorage(getAdminApp()).bucket(bucketName)
  const file = bucket.file(objectPath, {
    preconditionOpts: { ifGenerationMatch: 0 },
  })

  try {
    await file.save(data, {
      resumable: false,
      validation: 'md5',
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=300',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
          [writeMarker]: uploadId,
        },
      },
    })
  } catch (error) {
    if (storagePreconditionFailed(error)) throw dishImageConflict()
    throw error
  }

  const savedVersion = await currentObjectMetadata(bucket, objectPath)
  if (
    savedVersion.customMetadata[writeMarker] !== uploadId ||
    !downloadTokens(savedVersion.customMetadata).includes(downloadToken) ||
    !savedVersion.generation ||
    !savedVersion.metageneration
  ) {
    throw dishImageConflict()
  }

  return {
    imageUrl: firebaseStorageDownloadUrl(bucketName, objectPath, downloadToken),
    objectPath,
    async deleteUploaded() {
      let current
      try {
        current = await currentObjectMetadata(bucket, objectPath)
      } catch (error) {
        if (missingStorageObject(error)) return
        throw error
      }
      if (
        current.generation !== savedVersion.generation ||
        current.metageneration !== savedVersion.metageneration ||
        current.customMetadata[writeMarker] !== uploadId
      ) {
        return
      }

      try {
        await bucket
          .file(objectPath, {
            preconditionOpts: {
              ifGenerationMatch: savedVersion.generation,
              ifMetagenerationMatch: savedVersion.metageneration,
            },
          })
          .delete()
      } catch (error) {
        if (storagePreconditionFailed(error) || missingStorageObject(error)) {
          return
        }
        throw error
      }
    },
  }
}
