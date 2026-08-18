import { FieldPath } from 'firebase-admin/firestore'
import { createError, getQuery, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { MenuStorage } from '../../models/menu.model.ts'
import { KitchenMenuStorage } from '../../models/kitchen-menu.model.ts'
import {
  PUBLIC_MENU_INDEX_MAX_PAGE_SIZE,
  PUBLIC_MENU_INDEX_PAGE_SIZE,
  type PublicMenuIndexPage,
  type PublicMenuIndexScope,
} from '../../models/menu-index.model.ts'
import {
  resolveDirectoryPublicMenuScope,
  resolveTenantPublicMenuScope,
} from '../ownership/public-target'
import { readMenuIndexContext, readScopedMenuIndexContext } from './context'
import { projectMenuIndexItem, type MenuIndexDocument } from './projection'

export async function readMenuIndex(
  event: H3Event
): Promise<PublicMenuIndexPage> {
  const db = getRuntimeFirestore()
  const query = getQuery(event)
  const tenantScope = await resolveTenantPublicMenuScope()
  const kitchenSlug = text(query.kitchenSlug)
  if (tenantScope && kitchenSlug) {
    throw createError({ statusCode: 404, statusMessage: 'Menus not found.' })
  }
  const directoryScope =
    !tenantScope && kitchenSlug
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
  const documents: MenuIndexDocument[] = pageDocs.map((doc) => ({
    id: doc.id,
    data: doc.data(),
  }))
  const context = scopedKitchen
    ? new Map()
    : await readMenuIndexContext(db, documents)
  const scopedContext = scopedKitchen
    ? await readScopedMenuIndexContext(db, scopedKitchen)
    : null
  const items = documents
    .map((document) =>
      projectMenuIndexItem(
        document,
        scopedKitchen,
        scopedContext || context.get(document.id)
      )
    )
    .filter((menu): menu is NonNullable<typeof menu> => Boolean(menu))
  const nextCursor =
    hasMore && documents.length
      ? encodeCursor(documents[documents.length - 1]?.id || '')
      : null
  return { scope, items, nextCursor }
}

function pageSize(value: unknown) {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_MENU_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_MENU_INDEX_PAGE_SIZE
}

function encodeCursor(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeCursor(value: unknown) {
  const cursor = text(value)
  if (!cursor || !/^[A-Za-z0-9_-]+$/.test(cursor)) return ''
  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

function isDocumentId(value: string) {
  return (
    Boolean(value) &&
    value !== '.' &&
    value !== '..' &&
    !value.includes('/') &&
    !(value.startsWith('__') && value.endsWith('__')) &&
    new TextEncoder().encode(value).length <= 1_500
  )
}

function text(value: unknown) {
  return String(value ?? '').trim()
}
