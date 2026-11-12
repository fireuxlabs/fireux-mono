import { createHash } from 'node:crypto'
import { createError } from 'h3'

// Bump when derived byte semantics change; exact source query/token remains significant.
const contract = 'photo-alpha-v1'

export function createPhotoDeliveryCache({
  maxBytes = 64 * 1024 * 1024,
  maxEntries = 128,
  ttlMs = 5 * 60_000,
  now = Date.now,
} = {}) {
  const cache = new Map<string, { bytes: Buffer; expires: number }>()
  const pending = new Map<string, Promise<Buffer>>()
  let byteLength = 0
  const remove = (key: string) => {
    const value = cache.get(key)
    if (value) byteLength -= value.bytes.byteLength
    cache.delete(key)
  }
  return async (
    source: string,
    load: () => Promise<Buffer>
  ): Promise<Buffer> => {
    const key = createHash('sha256')
      .update(`${contract}\0${source}`)
      .digest('hex')
    const time = now()
    for (const [storedKey, value] of cache) {
      if (value.expires <= time) remove(storedKey)
    }
    const cached = cache.get(key)
    if (cached) {
      cache.delete(key)
      cache.set(key, cached)
      return cached.bytes
    }
    const existing = pending.get(key)
    if (existing) return existing
    if (pending.size >= 34) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Image delivery is busy; try again shortly.',
      })
    }
    const request = Promise.resolve()
      .then(load)
      .then((bytes) => {
        if (bytes.byteLength <= maxBytes) {
          while (
            cache.size &&
            (cache.size >= maxEntries ||
              byteLength + bytes.byteLength > maxBytes)
          ) {
            remove(cache.keys().next().value!)
          }
          if (maxEntries > 0) {
            cache.set(key, { bytes, expires: now() + ttlMs })
            byteLength += bytes.byteLength
          }
        }
        return bytes
      })
      .finally(() => {
        pending.delete(key)
      })
    pending.set(key, request)
    return request
  }
}

export const cachedPhotoDelivery = createPhotoDeliveryCache()
