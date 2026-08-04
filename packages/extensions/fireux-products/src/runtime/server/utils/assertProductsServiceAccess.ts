import { useRuntimeConfig } from '#imports'
import { timingSafeEqual } from 'node:crypto'
import { createError, getHeader, type H3Event } from 'h3'
import { getFirestore } from 'firebase-admin/firestore'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { AppUserStorage } from 'fireux-core/runtime/models/core/user.model'
import {
  bearerToken,
  bearerTokenFromEvent,
} from 'fireux-core/runtime/server/utils/auth/bearer'
import { getProductsAdmin } from './getAdmin'

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function safeEquals(value: string, expected: string): boolean {
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function serviceKeyFromRequest(event: H3Event): string {
  const authorization = firstString(getHeader(event, 'authorization'))

  return firstString(
    getHeader(event, 'x-fireux-products-service-key'),
    getHeader(event, 'x-fireux-products-internal-key'),
    getHeader(event, 'x-fireux-internal-key'),
    bearerToken(authorization)
  )
}

function configuredServiceKey(event: H3Event): string {
  const runtime = useRuntimeConfig(event) as any
  const fireuxProducts = runtime?.fireuxProducts || {}
  const fireux = runtime?.fireux || {}

  return firstString(
    process.env.FIREUX_PRODUCTS_SERVICE_KEY,
    process.env.FIREUX_PRODUCTS_INTERNAL_API_KEY,
    process.env.FIREUX_INTERNAL_API_KEY,
    fireuxProducts.serviceKey,
    fireuxProducts.internalApiKey,
    fireux.serviceKey,
    fireux.internalApiKey
  )
}

async function hasAppAdminAccess(event: H3Event): Promise<boolean> {
  const token = bearerTokenFromEvent(event)
  if (!token) return false

  try {
    const runtime = useRuntimeConfig(event) as any
    const appId = firstString(runtime?.public?.fireux?.id)
    const databaseId = firstString(
      runtime?.public?.firebaseEcosystem?.firebase?.databaseId
    )

    if (!appId) return false

    const admin = getProductsAdmin()
    const decoded = await admin.auth().verifyIdToken(token)
    const uid = firstString(decoded?.uid)
    if (!uid) return false

    const db = databaseId
      ? getFirestore(admin.app(), databaseId)
      : admin.firestore()

    const appUserSnap = await db
      .doc(`${AppStorage.collection}/${appId}/${AppUserStorage.collection}/${uid}`)
      .get()
    const appUserData = appUserSnap.data() || {}

    return (
      appUserData.role === 'admin' ||
      appUserData.canManageProducts === true
    )
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[fireux-products] admin token access check failed', error)
    }
    return false
  }
}

export async function assertProductsServiceAccess(event: H3Event) {
  const serviceKey = configuredServiceKey(event)
  const requestKey = serviceKeyFromRequest(event)

  if (serviceKey && requestKey && safeEquals(requestKey, serviceKey)) {
    return
  }

  if (await hasAppAdminAccess(event)) {
    return
  }

  if (!serviceKey && !requestKey) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized FireUX products request.',
  })
}
