import {
  createError,
  defineEventHandler,
  getHeader,
  getMethod,
  getQuery,
  setResponseHeaders,
  setResponseStatus,
} from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { MenuStorage } from '../../../../../models/menu.model'

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function bearerToken(value: unknown) {
  return text(value).match(/^Bearer\s+(.+)$/i)?.[1] || ''
}

function hasOperator(data: Record<string, unknown> | undefined, uid: string) {
  const ids = [
    ...(Array.isArray(data?.operator_ids) ? data.operator_ids : []),
    ...(Array.isArray(data?.team_ids) ? data.team_ids : []),
  ].map((value) => text(value))

  return Boolean(uid && ids.includes(uid))
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization',
  })
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return null
  }

  const query = getQuery(event)
  const appId = text(query.appId)
  const kitchenId = text(query.kitchenId)
  const menuId = normalizeSlug(query.id)
  const validation = validatePublicSlug(menuId, {
    label: 'Menu id',
    reservedScope: 'entity',
    reserved: ['create', 'edit', 'new', 'qr', 'sections'],
  })

  if (!validation.isValid) {
    return {
      id: menuId,
      is_valid: false,
      taken: false,
      available: false,
      message: validation.message || 'Menu id is not valid.',
    }
  }

  const token = bearerToken(getHeader(event, 'authorization'))
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in before checking menus.' })
  }

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
  const uid = text(decoded.uid)
  const db = getRuntimeFirestore()
  const kitchenPath = `${AppStorage.collection}/${appId}/${KitchenStorage.scopeCollection}/${kitchenId}`
  const kitchenSnap = await db.doc(kitchenPath).get()
  if (!kitchenSnap.exists || !hasOperator(kitchenSnap.data(), uid)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this kitchen.',
    })
  }

  const menuSnap = await db
    .doc(`${kitchenPath}/${MenuStorage.collection}/${menuId}`)
    .get()

  return {
    id: menuId,
    is_valid: true,
    taken: menuSnap.exists,
    available: !menuSnap.exists,
  }
})
