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

export type DeleteStorageFileOptions = DownloadStorageFileOptions

export type FirebaseStorageDownloadTarget = {
  bucketName: string
  objectPath?: string
  objectPrefix?: string
  label?: string
}

export function normalizeStorageBucketName(bucket?: string | null) {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

export function parseFirebaseStorageDownloadUrl(value: unknown) {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  try {
    const url = new URL(raw)
    const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.hash ||
      url.hostname !== 'firebasestorage.googleapis.com' ||
      !match ||
      url.searchParams.get('alt') !== 'media'
    ) {
      return null
    }
    return {
      url: url.toString(),
      bucketName: decodeURIComponent(match[1] || ''),
      objectPath: decodeURIComponent(match[2] || ''),
    }
  } catch {
    return null
  }
}

export function requireFirebaseStorageDownloadUrl(
  value: unknown,
  target: FirebaseStorageDownloadTarget
) {
  const label = String(target.label || 'Image').trim()
  const parsed = parseFirebaseStorageDownloadUrl(value)
  const bucketName = normalizeStorageBucketName(target.bucketName)
  const objectPath = String(target.objectPath || '').trim()
  const objectPrefix = String(target.objectPrefix || '').trim()

  if (
    !parsed ||
    parsed.bucketName !== bucketName ||
    (objectPath && parsed.objectPath !== objectPath) ||
    (objectPrefix && !parsed.objectPath.startsWith(objectPrefix))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} must use its canonical Firebase Storage target.`,
    })
  }
  return parsed.url
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

export async function deleteStorageFileIfExists(
  options: DeleteStorageFileOptions
) {
  const bucketName = options.bucketName || runtimeStorageBucketName()
  await getStorage(getAdminApp())
    .bucket(bucketName)
    .file(options.objectPath)
    .delete({ ignoreNotFound: true })

  return {
    bucketName,
    objectPath: options.objectPath,
  }
}
