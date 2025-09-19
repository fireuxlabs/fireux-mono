// packages/core/fireux-core/src/runtime/composables/firebase/useMediaStorage.ts
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { useAppFirebaseStorage } from './useFirebaseStorage'

/**
 * Minimal media storage utilities for current needs:
 *  - Upload a core user avatar and return its public URL
 *  - Provide a default avatar URL
 *
 * Notes:
 *  - We try to fetch and resize the source; if that fails, we fall back to the default avatar.
 *  - For remote HTTP URLs, CORS can block fetch; we catch and fall back safely.
 */
export function useMediaStorage() {
  const { uploadFile } = useAppFirebaseStorage()
  const storage = getStorage()

  // Static default avatar (SSR-safe). Tenants can override by replacing this asset.
  const DEFAULT_AVATAR_URL = '/img/default-avatar.png'
  const getDefaultAvatarUrl = () => DEFAULT_AVATAR_URL

  // ---- helpers (minimal) ----
  const toBlob = async (source: File | string): Promise<Blob> => {
    if (source instanceof File) return source
    // Try to fetch (supports same-origin/relative; remote may CORS-fail)
    const res = await fetch(source)
    return await res.blob()
  }

  const resizeToJpeg = async (blob: Blob, maxWidth = 400): Promise<Blob> => {
    // Prefer createImageBitmap when available
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
        const resp = await fetch(dataUrl)
        return await resp.blob()
      }
    } catch {
      // fall through to Image() path below
    }

    // Fallback path
    const img = new Image()
    const url = URL.createObjectURL(blob)
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Image load failed'))
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
    const resp = await fetch(dataUrl)
    return await resp.blob()
  }

  const uploadAndGetUrl = async (blob: Blob, path: string): Promise<string> => {
    await uploadFile(path, blob)
    return getDownloadURL(storageRef(storage, path))
  }

  // ---- public API (trimmed) ----
  /**
   * Upload a core user avatar to `core-users/{uid}/avatar.jpg`.
   * If fetch/resize fails (e.g., CORS), returns DEFAULT_AVATAR_URL.
   */
  const uploadCoreAvatar = async (
    source: File | string,
    uid: string
  ): Promise<string> => {
    try {
      const blob = await toBlob(source)
      const resized = await resizeToJpeg(blob, 400)
      const path = `core-users/${uid}/avatar.jpg`
      return await uploadAndGetUrl(resized, path)
    } catch (e) {
      console.warn(
        '[MediaStorage] uploadCoreAvatar failed, using default avatar:',
        e
      )
      return DEFAULT_AVATAR_URL
    }
  }

  /**
   * Generic image uploader. Accepts File or URL and writes to the provided path.
   */
  const uploadImage = async (
    source: File | string,
    path: string
  ): Promise<string> => {
    try {
      const blob = await toBlob(source)
      const resized = await resizeToJpeg(blob, 1200)
      return await uploadAndGetUrl(resized, path)
    } catch (e) {
      console.error('[MediaStorage] uploadImage failed:', e)
      throw e
    }
  }

  return {
    uploadCoreAvatar,
    uploadImage,
    getDefaultAvatarUrl,
  }
}
