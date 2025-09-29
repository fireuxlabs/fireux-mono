// packages/core/fireux-core/src/runtime/composables/firebase/useImageStorage.ts
import { useFirebaseStorage } from 'vuefire'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from 'firebase/storage'

/**
 * Image Storage (no fallbacks)
 * - Accepts a Blob or URL (URL is fetched via /api/proxy/image)
 * - Uploads to Firebase Storage
 * - Returns the download URL
 */
export function useImageStorage() {
  const storage = useFirebaseStorage()

  const proxiedUrl = (url: string) =>
    url.startsWith('/')
      ? url
      : `/api/proxy/image?url=${encodeURIComponent(url)}`

  async function fetchAsBlob(url: string): Promise<Blob> {
    const proxied = proxiedUrl(url)
    const res = await fetch(proxied, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(
        `[useImageStorage] fetch failed ${res.status} ${res.statusText}`
      )
    }
    return await res.blob()
  }

  async function toBlob(source: Blob | string): Promise<Blob> {
    return source instanceof Blob ? source : fetchAsBlob(source)
  }

  async function uploadBlobToStorage(
    blob: Blob,
    path: string
  ): Promise<string> {
    const bucket = getStorage()?.app?.options?.storageBucket
    const fileRef = storageRef(storage, path)
    console.log('[useImageStorage] upload', {
      bucket,
      path,
      size: blob.size,
      type: blob.type,
    })

    await uploadBytes(fileRef, blob, { contentType: blob.type })
    const url = await getDownloadURL(fileRef)
    console.log('[useImageStorage] url', url)
    return url
  }

  /**
   * Upload an image to Firebase Storage
   * @param path   Storage path (e.g. "core-users/{uid}/avatar")
   * @param source Blob or URL (required)
   */
  async function uploadImage(
    path: string,
    source: Blob | string
  ): Promise<string> {
    if (!path || !source) {
      throw new Error('[useImageStorage] path and source are required')
    }
    const blob = await toBlob(source)
    return uploadBlobToStorage(blob, path)
  }

  // Optional convenience when you already have a URL
  async function uploadFromUrl(path: string, url: string): Promise<string> {
    const blob = await fetchAsBlob(url)
    return uploadBlobToStorage(blob, path)
  }

  // Default image helper (centralized default location)
  function getDefaultImageUrl(path: string = '/img/default-image.png'): string {
    return path
  }

  return { uploadImage, uploadFromUrl, getDefaultImageUrl }
}
