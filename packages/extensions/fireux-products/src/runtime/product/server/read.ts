import {
  normalizeProduct,
  normalizeProductPrice,
} from '../utils/normalize-product'
import type { Product } from '../utils/product'

export type PublicProductScope = { role: string; appId: string }

/** Public DTO: allowlisted catalogue fields, never the stored workflow record. */
export function publicProduct(
  id: string,
  raw: unknown,
  scope: PublicProductScope
): Product | null {
  if (!['global', 'tenant', 'standalone'].includes(scope.role)) return null
  const product = normalizeProduct(id, raw)
  if (!product || !product.active || product.visibility !== 'public')
    return null
  if (
    ['tenant', 'standalone'].includes(scope.role) &&
    (!scope.appId || product.source_app_id !== scope.appId)
  )
    return null
  return {
    ...product,
    images: product.images
      .filter((image) => image && typeof image === 'object')
      .map((image) => ({
        url: String(image.url || ''),
        alt: String(image.alt || ''),
        ...(Number.isFinite(image.order) ? { order: image.order } : {}),
      })),
    features: product.features
      .filter((feature) => feature && typeof feature === 'object')
      .map((feature) => ({
        title: String(feature.title || ''),
        description: String(feature.description || ''),
        available: feature.available === true,
      })),
    created: { at: product.created.at },
    updated: { at: product.updated.at },
  }
}

/** Prices expose catalogue data, not provider metadata or audit identities. */
export function publicProductPrice(
  productId: string,
  priceId: string,
  raw: unknown
) {
  const price = normalizeProductPrice(productId, priceId, raw)
  if (!price || !price.active) return null
  return {
    ...price,
    metadata: {},
    created: { at: price.created?.at },
    updated: { at: price.updated?.at },
  }
}

export function serializeFirestoreValue(value: unknown): unknown {
  if (!value) return value
  if (Array.isArray(value)) return value.map(serializeFirestoreValue)
  if (typeof value !== 'object') return value

  const maybeTimestamp = value as {
    seconds?: number
    nanoseconds?: number
    toDate?: () => Date
  }

  if (typeof maybeTimestamp.toDate === 'function') {
    return {
      seconds:
        typeof maybeTimestamp.seconds === 'number'
          ? maybeTimestamp.seconds
          : Math.floor(maybeTimestamp.toDate().getTime() / 1000),
      nanoseconds:
        typeof maybeTimestamp.nanoseconds === 'number'
          ? maybeTimestamp.nanoseconds
          : 0,
    }
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      serializeFirestoreValue(entry),
    ])
  )
}
