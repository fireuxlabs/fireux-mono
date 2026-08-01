import {
  createError,
  defineEventHandler,
  getRouterParam,
  type H3Event,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { ProductPriceStorage, ProductStorage } from '../../../models/product.model'
import { getProductsFirestore } from '../../utils/getAdmin'

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

  const product = productSnap.data() || {}
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux || {}) as Record<string, unknown>
  const role = String(fireux.role || '').trim()
  const appId = String(fireux.id || '').trim()
  const sourceAppId = String(product.source_app_id || '').trim()
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

  const pricesSnap = await productRef.collection(ProductPriceStorage.collection).get()
  const prices = pricesSnap.docs.map((doc) =>
    serializeFirestoreValue({
      id: doc.id,
      ...doc.data(),
    })
  )

  return serializeFirestoreValue({
    id: productSnap.id,
    ...product,
    prices,
  })
})
