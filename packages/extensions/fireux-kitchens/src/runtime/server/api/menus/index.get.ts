import { createError, defineEventHandler, getQuery } from 'h3'
import { FieldPath } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { menuSourceFromData } from '../../menu/payload/source.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import { KitchenMenuStorage } from '../../../models/kitchen/menu/kitchen-menu.model.ts'
import {
  PUBLIC_MENU_INDEX_MAX_PAGE_SIZE,
  PUBLIC_MENU_INDEX_PAGE_SIZE,
  type PublicMenuIndexPage,
  type PublicMenuIndexScope,
} from '../../../models/kitchen/menu/menu-index.model.ts'
import {
  resolveTenantPublicMenuScope,
  resolveDirectoryPublicMenuScope,
  type TenantPublicMenuScope,
} from '../../menu/ownership/public-target.ts'

const text = (value: unknown) => String(value ?? '').trim()
const isFirestoreDocumentId = (value: string) =>
  Boolean(value) &&
  value !== '.' &&
  value !== '..' &&
  !value.includes('/') &&
  !(value.startsWith('__') && value.endsWith('__')) &&
  new TextEncoder().encode(value).length <= 1_500

const pageSize = (value: unknown) => {
  const size = Number(value)

  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_MENU_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_MENU_INDEX_PAGE_SIZE
}

const encodeCursor = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')

const decodeCursor = (value: unknown) => {
  const cursor = text(value)
  if (!cursor) return ''
  if (!/^[A-Za-z0-9_-]+$/.test(cursor)) return ''

  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isFirestoreDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

const publicMenuIndexItem = (
  id: string,
  data: Record<string, unknown>,
  tenantScope?: TenantPublicMenuScope | null
) => {
  const status = readRecordString(data, 'status')
  if (status !== 'published') return null

  const source = tenantScope
    ? menuSourceFromData(data, {
        kitchenAppId: tenantScope.appId,
        kitchenId: tenantScope.kitchenId,
        kitchenSlug: tenantScope.kitchenSlug,
        kitchenMenuId: id,
      })
    : menuSourceFromData(data)
  const hasSource = Boolean(
    source.app_id && source.kitchen_id && source.menu_id
  )

  return {
    id,
    kind: tenantScope ? 'menu' : readRecordString(data, 'kind') || undefined,
    name: readRecordString(data, 'name') || id,
    description: readRecordString(data, 'description'),
    status,
    ...(hasSource ? { source } : {}),
  }
}

export default defineEventHandler(async (event) => {
  const db = getRuntimeFirestore()
  const query = getQuery(event)
  const tenantScope = await resolveTenantPublicMenuScope()
  const kitchenSlug = text(query.kitchenSlug)
  if (tenantScope && kitchenSlug) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menus not found.',
    })
  }
  const directoryScope = !tenantScope && kitchenSlug
    ? await resolveDirectoryPublicMenuScope(kitchenSlug)
    : null
  const scopedKitchen = tenantScope || directoryScope
  const scope: PublicMenuIndexScope = tenantScope
    ? { kind: 'tenant', kitchenSlug: tenantScope.kitchenSlug }
    : directoryScope
      ? { kind: 'directory', kitchenSlug: directoryScope.kitchenSlug }
      : { kind: 'root' }

  const collectionPath = scopedKitchen
    ? `apps/${scopedKitchen.appId}/kitchens/${scopedKitchen.kitchenId}/${KitchenMenuStorage.collection}`
    : MenuStorage.rootCollection
  const limit = pageSize(query.limit)
  const requestedCursor = text(query.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu cursor is invalid.',
    })
  }

  let menuQuery = db
    .collection(collectionPath)
    .where('status', '==', 'published')
    .orderBy(FieldPath.documentId())
    .limit(limit + 1)
  if (cursor) menuQuery = menuQuery.startAfter(cursor)

  const snap = await menuQuery.get()
  const hasMore = snap.docs.length > limit
  const pageDocs = hasMore ? snap.docs.slice(0, limit) : snap.docs
  const items = pageDocs
    .map((doc) => publicMenuIndexItem(doc.id, doc.data(), scopedKitchen))
    .filter((menu): menu is NonNullable<typeof menu> => Boolean(menu))
  const nextCursor = hasMore && pageDocs.length
    ? encodeCursor(pageDocs[pageDocs.length - 1]?.id || '')
    : null

  return {
    scope,
    items,
    nextCursor,
  } satisfies PublicMenuIndexPage
})
