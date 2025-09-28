// packages/core/fireux-core/src/runtime/composables/firebase/useImageStorage.ts
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { useAppFirebaseStorage } from './useFirebaseStorage'

/**
 * Generic image storage:
 *  - uploadImage(source, path) -> download URL (from Firebase Storage)
 *  - getDefaultImageUrl(fallbackPath) -> string
 *
 * Notes:
 *  - `source` can be File or URL string.
 *  - For remote Google photo URLs, we proxy once via /api/proxy/google-avatar to dodge CORS/rate limits.
 *  - If fetch/resize/upload fails, returns the provided default path (e.g. '/img/default-image.png').
 */
export function useImageStorage() {
  const storage = getStorage()
  const { uploadFile } = useAppFirebaseStorage()

  const isDev = typeof process !== 'undefined' && (process as any).dev === true
  const dlog = (...args: any[]) => {
    if (isDev) console.log('[img-storage]', ...args)
  }

  const getDefaultImageUrl = (fallback = '/img/default-image.png') => fallback

  // -- helpers ---------------------------------------------------------------

  function normalizeUrlOnce(url: string): string {
    const alreadyProxied = url.startsWith('/api/proxy/google-avatar')
    const looksGoogle =
      url.includes('googleusercontent.com') || url.includes('google.com/')
    if (alreadyProxied || !looksGoogle) return url
    const proxied = `/api/proxy/google-avatar?url=${encodeURIComponent(url)}`
    dlog('normalizeUrlOnce: proxied', proxied)
    return proxied
  }

  async function toBlob(source: File | string): Promise<Blob> {
    if (source instanceof File) {
      dlog('toBlob:file', { size: source.size, type: source.type })
      return source
    }
    const url = normalizeUrlOnce(source)
    dlog('toBlob:url', url)
    const res = await fetch(url)
    dlog('toBlob:status', res.status)
    if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
    return await res.blob()
  }

  async function resizeToJpeg(blob: Blob, maxWidth = 1200): Promise<Blob> {
    dlog('resize:start', { size: blob.size, maxWidth })

    // Fast path with createImageBitmap when available
    try {
      // @ts-ignore
      if (typeof createImageBitmap === 'function') {
        // @ts-ignore
        const bmp: ImageBitmap = await createImageBitmap(blob)
        const scale = Math.min(1, maxWidth / bmp.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bmp.width * scale)
        canvas.height = Math.round(bmp.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no 2d context')
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        return await (await fetch(dataUrl)).blob()
      }
    } catch (e) {
      dlog('resize:bitmap-fallback', e)
    }

    // Fallback path
    const img = new Image()
    const tmpUrl = URL.createObjectURL(blob)
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('img onerror'))
        img.src = tmpUrl
      })
    } finally {
      URL.revokeObjectURL(tmpUrl)
    }

    const scale = Math.min(1, maxWidth / img.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no 2d context')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const out = await (await fetch(dataUrl)).blob()
    dlog('resize:done', { size: out.size, w: canvas.width, h: canvas.height })
    return out
  }

  async function uploadAndGetUrl(blob: Blob, path: string): Promise<string> {
    dlog('upload:start', { path, size: blob.size })
    await uploadFile(path, blob) // wraps Firebase uploadBytes
    const url = await getDownloadURL(storageRef(storage, path))
    dlog('upload:ok', { url })
    return url
  }

  // -- public ---------------------------------------------------------------

  /**
   * Upload any image to the given storage `path` and return its public URL.
   * If anything fails, returns `fallbackPath` (defaults to '/img/default-image.png').
   */
  async function uploadImage(
    source: File | string,
    path: string,
    fallbackPath = '/img/default-image.png'
  ): Promise<string> {
    try {
      const blob = await toBlob(source)
      const resized = await resizeToJpeg(blob, 1200)
      const url = await uploadAndGetUrl(resized, path)
      return url
    } catch (e) {
      console.warn('[img-storage] uploadImage: fallback to default', e)
      return getDefaultImageUrl(fallbackPath)
    }
  }

  return {
    uploadImage,
    getDefaultImageUrl,
  }
}
