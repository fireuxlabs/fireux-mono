import {
  createError,
  defineEventHandler,
  getRouterParam,
  type H3Event,
} from 'h3'
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
  const productRef = db.collection('products').doc(id)
  const productSnap = await productRef.get()

  if (!productSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const pricesSnap = await productRef.collection('prices').get()
  const prices = pricesSnap.docs.map((doc) =>
    serializeFirestoreValue({
      id: doc.id,
      ...doc.data(),
    })
  )

  return serializeFirestoreValue({
    id: productSnap.id,
    ...productSnap.data(),
    prices,
  })
})
