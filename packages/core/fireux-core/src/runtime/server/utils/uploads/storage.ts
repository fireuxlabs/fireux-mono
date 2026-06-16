import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from '../getAdmin.ts'

export type SavedStorageFile = {
  fileUrl: string
  objectPath: string
  bucketName: string
  downloadToken: string
}

export type SaveStorageFileOptions = {
  objectPath: string
  data: Buffer
  contentType: string
  bucketName?: string
  cacheControl?: string
}

export type DownloadStorageFileOptions = {
  objectPath: string
  bucketName?: string
}

export function normalizeStorageBucketName(bucket?: string | null) {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

export function runtimeStorageBucketName(
  missingMessage = 'Missing Firebase Storage bucket configuration.'
) {
  const runtime = useRuntimeConfig()
  const bucketName = normalizeStorageBucketName(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket
  )

  if (!bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: missingMessage,
    })
  }

  return bucketName
}

export function firebaseStorageDownloadUrl(
  bucketName: string,
  objectPath: string,
  token: string
) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

export async function saveStorageFileWithDownloadToken(
  options: SaveStorageFileOptions
): Promise<SavedStorageFile> {
  const bucketName = options.bucketName || runtimeStorageBucketName()
  const downloadToken = randomUUID()

  await getStorage(getAdminApp())
    .bucket(bucketName)
    .file(options.objectPath)
    .save(options.data, {
      resumable: false,
      metadata: {
        contentType: options.contentType,
        cacheControl: options.cacheControl ?? 'public, max-age=300',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    })

  return {
    fileUrl: firebaseStorageDownloadUrl(
      bucketName,
      options.objectPath,
      downloadToken
    ),
    objectPath: options.objectPath,
    bucketName,
    downloadToken,
  }
}

export async function downloadStorageFile(
  options: DownloadStorageFileOptions
) {
  const bucketName = options.bucketName || runtimeStorageBucketName()
  const [buffer] = await getStorage(getAdminApp())
    .bucket(bucketName)
    .file(options.objectPath)
    .download()

  return {
    buffer,
    bucketName,
    objectPath: options.objectPath,
  }
}
