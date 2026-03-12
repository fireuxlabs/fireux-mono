import { useRuntimeConfig } from '#imports'
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import type { RuntimeConfig } from '@nuxt/schema'
import { useFirebaseStorage } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

function getDefaultImageUrl(
  path: string = '/img/core/defaults/default-thumbnail.png'
): string {
  return path
}

/**
 * Image Storage
 * - Accepts a Blob or URL (URL is fetched via /api/proxy/image)
 * - Uploads to Firebase Storage
 * - Returns the download URL
 */
export function useImageStorage() {
  const runtimeConfig = useRuntimeConfig() as RuntimeConfig
  const storage = resolveStorageBucket(useFirebaseStorage(), runtimeConfig)
  const debug = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[useImageStorage]', ...args)
    }
  }

  const proxiedUrl = (url: string) =>
    url.startsWith('/')
      ? url
      : `/api/proxy/image?url=${encodeURIComponent(url)}`

  async function fetchAsBlob(url: string): Promise<Blob> {
    const proxied = proxiedUrl(url)
    debug('fetchAsBlob:start', { url, proxied })
    const res = await fetch(proxied, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(
        `[useImageStorage] fetch failed ${res.status} ${res.statusText}`
      )
    }
    const blob = await res.blob()
    debug('fetchAsBlob:success', { url, size: blob.size, type: blob.type })
    return blob
  }

  async function toBlob(source: Blob | string): Promise<Blob> {
    if (source instanceof Blob) {
      debug('toBlob:input-blob', { size: source.size, type: source.type })
      return source
    }
    debug('toBlob:fetch', { source })
    return fetchAsBlob(source)
  }

  async function uploadBlobToStorage(
    blob: Blob,
    path: string
  ): Promise<string> {
    const bucket = getStorage()?.app?.options?.storageBucket
    const fileRef = storageRef(storage, path)
    debug('upload', { bucket, path, size: blob.size, type: blob.type })

    await uploadBytes(fileRef, blob, { contentType: blob.type })
    const url = await getDownloadURL(fileRef)
    debug('upload:success', { path, url })
    return url
  }

  /**
   * Upload an image to Firebase Storage
   * @param path   Storage path (e.g. "users/{uid}/avatar")
   * @param source Blob or URL (required)
   */
  async function uploadImage(
    path: string,
    source: Blob | string
  ): Promise<string> {
    if (!path || !source) {
      throw new Error('[useImageStorage] path and source are required')
    }
    debug('uploadImage:start', { path, sourceType: typeof source })
    const blob = await toBlob(source)
    debug('uploadImage:blob-ready', { path, size: blob.size, type: blob.type })
    return uploadBlobToStorage(blob, path)
  }

  async function uploadFromUrl(path: string, url: string): Promise<string> {
    debug('uploadFromUrl:start', { path, url })
    const blob = await fetchAsBlob(url)
    return uploadBlobToStorage(blob, path)
  }

  async function getDownloadUrlForPath(path: string): Promise<string> {
    if (!path) {
      throw new Error('[useImageStorage] path is required for download lookup')
    }
    const fileRef = storageRef(storage, path)
    return getDownloadURL(fileRef)
  }

  return {
    uploadImage,
    uploadFromUrl,
    getDefaultImageUrl,
    getDownloadUrlForPath,
  }
}

function resolveStorageBucket(
  storage: ReturnType<typeof useFirebaseStorage>,
  runtimeConfig: RuntimeConfig
) {
  try {
    const rawBucket =
      (runtimeConfig?.public as any)?.firebaseEcosystem?.firebase
        ?.storageBucket ??
      (runtimeConfig?.public as any)?.firebaseConfig?.storageBucket ??
      storage.app.options.storageBucket

    const normalized = normalizeBucketName(rawBucket)
    if (!normalized || normalized === storage.app.options.storageBucket) {
      return storage
    }

    const resolved = getStorage(storage.app, `gs://${normalized}`)
    if (import.meta.dev) {
      console.log('[useImageStorage] remapped storage bucket', {
        from: storage.app.options.storageBucket,
        to: normalized,
      })
    }
    return resolved
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[useImageStorage] failed to resolve custom bucket', error)
    }
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
