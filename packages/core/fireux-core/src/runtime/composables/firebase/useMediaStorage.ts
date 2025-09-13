import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { useAppFirebaseStorage } from './useFirebaseStorage'
import { useFireUXConfig } from '../FireUXConfig'

/**
 * Simplified image upload system
 * Supports: Product images, Blog images (featured/social), User avatars
 */
export function useMediaStorage() {
  const { uploadFile } = useAppFirebaseStorage()
  const storage = getStorage()
  const { appId } = useFireUXConfig()

  // Central default avatar URL (SSR-safe string constant)
  // Tenants can override via their own assets; use this as a sane default.
  const DEFAULT_AVATAR_URL = '/img/default-avatar.png'
  function getDefaultAvatarUrl() {
    return DEFAULT_AVATAR_URL
  }

  type UploadOpts = {
    maxWidth?: number
    contentType?: string // currently jpeg only; reserved for future
    allowRemoteHttpFetch?: boolean // default false (avoid CORS for remote URLs)
    pathOverride?: string // upload to an explicit path instead of the computed one
  }

  // Helpers
  const isFirebaseStorageUrl = (url: string) =>
    /firebasestorage\.googleapis\.com/.test(url)
  const isHttpUrl = (s: string) =>
    s.startsWith('http://') || s.startsWith('https://')
  const isDataUrl = (s: string) => s.startsWith('data:')
  const isSameOriginOrRelative = (s: string) => !isHttpUrl(s)

  // Convert Data-URL to Blob
  const dataUrlToBlob = (dataUrl: string): Promise<Blob> =>
    fetch(dataUrl).then((res) => res.blob())

  // Turn File | dataURL | http(s)/relative URL into Blob
  const sourceToBlob = async (source: File | string): Promise<Blob> => {
    if (source instanceof File) return source
    if (typeof source === 'string' && isDataUrl(source)) {
      return dataUrlToBlob(source)
    }
    // treat as URL (relative or absolute)
    const res = await fetch(source)
    return await res.blob()
  }

  // Resize image with smart defaults for different use cases
  const resizeImage = async (blob: Blob, maxWidth = 800): Promise<Blob> => {
    // Prefer createImageBitmap to avoid nested callbacks and improve performance
    try {
      if (typeof (globalThis as any).createImageBitmap === 'function') {
        const bitmap: ImageBitmap = await (globalThis as any).createImageBitmap(
          blob
        )
        const scale = Math.min(1, maxWidth / bitmap.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas context not available')
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        return await dataUrlToBlob(dataUrl)
      }
    } catch (e) {
      // Fallback to Image element path below
      console.warn(
        '[MediaStorage] createImageBitmap failed, falling back to Image()',
        e
      )
    }

    // Fallback: use Image element and toDataURL (avoids toBlob callback nesting)
    const img = new Image()
    const url = URL.createObjectURL(blob)
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
      })
    } finally {
      URL.revokeObjectURL(url)
    }
    const scale = Math.min(1, maxWidth / img.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    return await dataUrlToBlob(dataUrl)
  }

  // Core upload function
  const uploadToStorage = async (blob: Blob, path: string): Promise<string> => {
    await uploadFile(path, blob)
    return getDownloadURL(storageRef(storage, path))
  }

  // Public URL resolver for an existing storage path
  const getPublicUrl = async (path: string): Promise<string> => {
    return getDownloadURL(storageRef(storage, path))
  }

  // Process and upload any image
  const uploadImage = async (
    source: File | string,
    collection: string,
    id: string,
    type: string,
    opts?: UploadOpts
  ): Promise<string> => {
    console.log('📤 uploadImage called with:')
    console.log('  - collection:', collection)
    console.log('  - id:', id)
    console.log('  - type:', type)
    console.log('  - appId:', appId)

    // If source is a Firebase Storage URL and remote fetch is not allowed, return as-is to avoid CORS
    if (typeof source === 'string' && isHttpUrl(source)) {
      if (isFirebaseStorageUrl(source) && !opts?.allowRemoteHttpFetch) {
        console.warn(
          '[MediaStorage] Returning existing Firebase Storage URL without re-upload to avoid CORS:',
          source
        )
        return source
      }
      // If same-origin asset (relative path), it is safe to fetch
      if (!isSameOriginOrRelative(source) && !opts?.allowRemoteHttpFetch) {
        console.warn(
          '[MediaStorage] Remote HTTP fetch disabled; returning original URL:',
          source
        )
        return source
      }
    }

    // Convert source to blob (supports File, data URL, or same-origin/relative URL)
    const blob = await sourceToBlob(source)

    // Set smart defaults based on image type
    let imageMaxWidth = opts?.maxWidth
    if (!imageMaxWidth) {
      switch (type) {
        case 'avatar':
          imageMaxWidth = 400
          break
        case 'featured':
        case 'social':
          imageMaxWidth = 1200
          break
        default:
          imageMaxWidth = 800
      }
    }

    // Resize image
    const resized = await resizeImage(blob, imageMaxWidth)

    // Generate path with apps prefix to match database structure (unless overridden)
    const path =
      opts?.pathOverride || `apps/${appId}/${collection}/${id}/${type}.jpg`

    // Upload and return URL
    return await uploadToStorage(resized, path)
  }

  // Specialized avatar upload
  const uploadUserAvatar = async (
    source: File | string,
    uid: string,
    opts?: UploadOpts
  ): Promise<string> => {
    // Backwards-compat alias: app user avatar under apps/{appId}/users/{uid}
    return await uploadImage(source, 'users', uid, 'avatar', {
      maxWidth: 400,
      ...opts,
    })
  }

  // Explicit AppUser avatar helper (alias of uploadUserAvatar)
  const uploadAppUserAvatar = async (
    source: File | string,
    uid: string,
    opts?: UploadOpts
  ): Promise<string> => uploadUserAvatar(source, uid, opts)

  // Core avatar uploader (NO app prefix): core-users/{uid}/avatar.jpg
  const uploadCoreAvatar = async (
    source: File | string,
    uid: string,
    opts?: UploadOpts
  ): Promise<string> => {
    // Avoid re-uploading remote storage URLs on client
    if (
      typeof source === 'string' &&
      isHttpUrl(source) &&
      isFirebaseStorageUrl(source) &&
      !opts?.allowRemoteHttpFetch
    ) {
      console.warn(
        '[MediaStorage] Using existing Firebase Storage URL for core avatar (no re-upload):',
        source
      )
      return source
    }
    const blob = await sourceToBlob(source)
    const resized = await resizeImage(blob, opts?.maxWidth ?? 400)
    const path = opts?.pathOverride || `core-users/${uid}/avatar.jpg`
    return await uploadToStorage(resized, path)
  }

  return {
    uploadImage,
    uploadUserAvatar, // legacy alias kept
    uploadAppUserAvatar,
    uploadCoreAvatar,
    // defaults
    DEFAULT_AVATAR_URL,
    getDefaultAvatarUrl,
    // utilities
    getPublicUrl,
  }
}
