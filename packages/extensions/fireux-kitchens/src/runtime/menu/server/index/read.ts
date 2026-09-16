import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { MenuStorage } from '../../utils/menu.ts'
import { KitchenMenuStorage } from '../../utils/kitchen-menu.ts'
import {
  MENU_DIRECTORY_MAX_PAGE_SIZE,
  MENU_DIRECTORY_PAGE_SIZE,
  type MenuDirectoryPage,
  type MenuDirectoryScope,
} from '../../models/menu-directory.response.ts'
import {
  resolveDirectoryMenuScope,
  resolveTenantMenuScope,
} from '../ownership/app-scope'
import {
  readMenuDirectoryContext,
  readScopedMenuDirectoryContext,
} from './context'
import {
  projectMenuDirectoryEntry,
  type MenuDirectoryDocument,
} from './projection'

export type ReadMenuDirectoryPageInput = {
  kitchenSlug?: unknown
  cursor?: unknown
  limit?: unknown
}

export async function readMenuDirectoryPage(
  input: ReadMenuDirectoryPageInput = {}
): Promise<MenuDirectoryPage> {
  const db = getRuntimeFirestore()
  const tenantScope = await resolveTenantMenuScope()
  const kitchenSlug = text(input.kitchenSlug)
  if (tenantScope && kitchenSlug) {
    throw createError({ statusCode: 404, statusMessage: 'Menus not found.' })
  }
  const directoryScope =
    !tenantScope && kitchenSlug
      ? await resolveDirectoryMenuScope(kitchenSlug)
      : null
  const scopedKitchen = tenantScope || directoryScope
  const scope: MenuDirectoryScope = tenantScope
    ? { kind: 'tenant', kitchenSlug: tenantScope.kitchenSlug }
    : directoryScope
      ? { kind: 'directory', kitchenSlug: directoryScope.kitchenSlug }
      : { kind: 'root' }
  const collectionPath = scopedKitchen
    ? `kitchens/${scopedKitchen.kitchenId}/${KitchenMenuStorage.collection}`
    : MenuStorage.rootCollection
  const limit = pageSize(input.limit)
  const requestedCursor = text(input.cursor)
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
  if (scopedKitchen) menuQuery = menuQuery.orderBy('sort_order')
  menuQuery = menuQuery.orderBy(FieldPath.documentId()).limit(limit + 1)
  if (cursor) {
    if (scopedKitchen) {
      const cursorDocument = await db
        .collection(collectionPath)
        .doc(cursor)
        .get()
      const sortOrder = cursorDocument.data()?.sort_order
      if (!cursorDocument.exists || typeof sortOrder !== 'number') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Menu cursor is unavailable.',
        })
      }
      menuQuery = menuQuery.startAfter(sortOrder, cursor)
    } else {
      menuQuery = menuQuery.startAfter(cursor)
    }
  }
  const snap = await menuQuery.get()
  const hasMore = snap.docs.length > limit
  const pageDocs = hasMore ? snap.docs.slice(0, limit) : snap.docs
  const documents: MenuDirectoryDocument[] = pageDocs.map((doc) => ({
    id: doc.id,
    data: doc.data(),
  }))
  const context = scopedKitchen
    ? new Map()
    : await readMenuDirectoryContext(db, documents)
  const scopedContext = scopedKitchen
    ? await readScopedMenuDirectoryContext(db, scopedKitchen)
    : null
  const items = documents
    .map((document) =>
      projectMenuDirectoryEntry(
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
    ? Math.min(size, MENU_DIRECTORY_MAX_PAGE_SIZE)
    : MENU_DIRECTORY_PAGE_SIZE
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
