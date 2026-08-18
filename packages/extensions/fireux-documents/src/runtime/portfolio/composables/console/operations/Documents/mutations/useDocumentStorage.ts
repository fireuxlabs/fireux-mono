// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access before document upload.
import { useRuntimeConfig } from '#imports'
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import type { RuntimeConfig } from '@nuxt/schema'
import { useFirebaseStorage } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'

const normalize = (value: unknown) => String(value || '').trim()

const normalizeFileName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '')

const extensionOf = (name: string) => {
  const raw = normalize(name)
  const idx = raw.lastIndexOf('.')
  if (idx <= 0) return ''
  return raw.slice(idx)
}

const baseNameOf = (name: string) => {
  const raw = normalize(name)
  const idx = raw.lastIndexOf('.')
  if (idx <= 0) return raw
  return raw.slice(0, idx)
}

const uniqueSuffix = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export type DocumentUploadInput = {
  file: Blob
  fileName?: string
  pathPrefix: string
}

export type DocumentUploadResult = {
  storagePath: string
  downloadUrl: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export function useDocumentStorage(runtimePortfolio = useActivePortfolio()) {
  const runtimeConfig = useRuntimeConfig() as RuntimeConfig
  const storage = resolveStorageBucket(useFirebaseStorage(), runtimeConfig)

  async function uploadFile(input: DocumentUploadInput): Promise<DocumentUploadResult> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-documents')

    const prefix = normalize(input.pathPrefix)
    if (!prefix) {
      throw new Error('[fireux-documents] pathPrefix is required for upload.')
    }

    const fileNameCandidate =
      normalize(input.fileName) ||
      normalize((input.file as any)?.name) ||
      `document-${uniqueSuffix()}`

    const normalizedName = normalizeFileName(fileNameCandidate)
    if (!normalizedName) {
      throw new Error('[fireux-documents] fileName is invalid after normalization.')
    }

    const ext = extensionOf(normalizedName)
    const base = baseNameOf(normalizedName) || `document-${uniqueSuffix()}`
    const finalName = `${base}-${uniqueSuffix()}${ext}`

    const storagePath = `${prefix}/${finalName}`
    const fileRef = storageRef(storage, storagePath)

    const mimeType = normalize((input.file as any)?.type) || 'application/octet-stream'
    await uploadBytes(fileRef, input.file, { contentType: mimeType })
    const downloadUrl = await getDownloadURL(fileRef)

    return {
      storagePath,
      downloadUrl,
      fileName: finalName,
      mimeType,
      sizeBytes: Number((input.file as any)?.size || 0),
    }
  }

  return {
    uploadFile,
  }
}

function resolveStorageBucket(
  storage: ReturnType<typeof useFirebaseStorage>,
  runtimeConfig: RuntimeConfig
) {
  try {
    const rawBucket =
      (runtimeConfig?.public as any)?.firebaseEcosystem?.firebase?.storageBucket ??
      (runtimeConfig?.public as any)?.firebaseConfig?.storageBucket ??
      storage.app.options.storageBucket

    const normalized = normalizeBucketName(rawBucket)
    if (!normalized || normalized === storage.app.options.storageBucket) {
      return storage
    }

    return getStorage(storage.app, `gs://${normalized}`)
  } catch {
    return storage
  }
}

function normalizeBucketName(bucket?: string | null): string | undefined {
  if (!bucket) return undefined
  let trimmed = bucket.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('gs://')) {
    trimmed = trimmed.slice(5)
  }
  return trimmed
}
