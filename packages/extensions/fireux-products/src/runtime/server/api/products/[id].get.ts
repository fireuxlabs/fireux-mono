import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getRouterParam,
  type H3Event,
} from 'h3'

import { useRuntimeConfig } from '#imports'
import {
  ProductPriceStorage,
  ProductStorage,
} from '../../../product/utils/product.ts'
import { getProductsFirestore } from '../../../product/server/core/getAdmin'
import {
  joinProductRead,
  normalizeProduct,
  normalizeProductPrice,
} from '../../../product/utils/normalize-product.ts'

function assertSafeDocumentSegment(value: string) {
  if (!value || value.includes('/') || value === '.' || value === '..') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is not valid',
    })
  }
}

function serializeFirestoreValue(value: unknown): unknown {
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

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const id = String(getRouterParam(event, 'id') || '').trim()
  assertSafeDocumentSegment(id)

  const db = getProductsFirestore()
  const productRef = db.collection(ProductStorage.collection).doc(id)
  const productSnap = await productRef.get()

  if (!productSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const rawProduct = productSnap.data() || {}
  const product = normalizeProduct(productSnap.id, rawProduct)
  if (!product)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux || {}) as Record<string, unknown>
  const role = String(fireux.role || '').trim()
  const appId = String(fireux.id || '').trim()
  const sourceAppId = product.source_app_id
  const isAppScopedRuntime = role === 'tenant' || role === 'standalone'
  if (
    product.visibility !== 'public' ||
    product.active !== true ||
    (isAppScopedRuntime && (!appId || sourceAppId !== appId))
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const pricesSnap = await productRef
    .collection(ProductPriceStorage.collection)
    .get()
  const prices = pricesSnap.docs
    .map((doc) => normalizeProductPrice(product.id, doc.id, doc.data()))
    .filter((price): price is NonNullable<typeof price> => Boolean(price))

  return serializeFirestoreValue(joinProductRead(product, prices))
})
