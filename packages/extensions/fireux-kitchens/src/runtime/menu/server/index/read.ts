import { readMatchingMenuDishes, matchesFoodSearch } from './food-search'
import { MenuStorage } from '../../models/menu-storage.model'
import { menuServiceOfferings } from '../../utils/service-menu'
import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  MENU_DIRECTORY_MAX_PAGE_SIZE,
  MENU_DIRECTORY_PAGE_SIZE,
  type MenuDirectoryPage,
  type MenuDirectoryScope,
} from '../../models/menu-directory.response.ts'
import {
  resolveDirectoryMenuScope,
  resolveTenantMenuScope,
  currentMenuAppId,
} from '../ownership/app-scope'
import { readScopedMenuDirectoryContext } from './context'
import { projectMenuDirectoryEntry } from './projection'

export type ReadMenuDirectoryPageInput = {
  offering?: unknown
  search?: unknown
  service?: unknown
  kitchenSlug?: unknown
  cursor?: unknown
  limit?: unknown
}

async function readMenuDirectoryBatch(
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
    ? `kitchens/${scopedKitchen.kitchenId}/${MenuStorage.collection}`
    : ''
  const limit = pageSize(input.limit)
  const requestedCursor = text(input.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (
    requestedCursor &&
    (!cursor || (scopedKitchen && !isDocumentId(cursor)))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu cursor is invalid.',
    })
  }

  let menuQuery = scopedKitchen
    ? db.collection(collectionPath).where('status', '==', 'published')
    : db.collectionGroup('menus')
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
  const documents = pageDocs.map((doc) => ({
    id: doc.id,
    path: doc.ref.path,
    data: doc.data(),
  }))
  const scopes = new Map<
    string,
    Awaited<ReturnType<typeof resolveDirectoryMenuScope>>
  >()
  const contexts = new Map<
    string,
    Awaited<ReturnType<typeof readScopedMenuDirectoryContext>>
  >()
  if (!scopedKitchen) {
    const kitchenIds = [
      ...new Set(
        documents.flatMap((document) => {
          const parts = document.path.split('/')
          return parts.length === 4 &&
            parts[0] === 'kitchens' &&
            parts[2] === 'menus' &&
            document.data.status === 'published' &&
            (!document.data.audience || document.data.audience === 'public')
            ? [parts[1]!]
            : []
        })
      ),
    ]
    const snapshots = kitchenIds.length
      ? await db.getAll(...kitchenIds.map((id) => db.doc(`kitchens/${id}`)))
      : []
    await Promise.all(
      snapshots.map(async (snapshot) => {
        const data = snapshot.data() || {}
        const identity = data.identity as Record<string, unknown> | undefined
        if (
          !snapshot.exists ||
          identity?.status !== 'active' ||
          identity.visibility !== true ||
          typeof identity.slug !== 'string'
        )
          return
        const scope = {
          appId: currentMenuAppId(),
          kitchenId: snapshot.id,
          kitchenSlug: identity.slug,
          rootKitchenData: data,
        }
        scopes.set(snapshot.id, scope)
        contexts.set(
          snapshot.id,
          await readScopedMenuDirectoryContext(db, scope, ['online', 'collection', 'delivery'].includes(text(input.service)))
        )
      })
    )
  }
  const scopedContext = scopedKitchen
    ? await readScopedMenuDirectoryContext(db, scopedKitchen, ['online', 'collection', 'delivery'].includes(text(input.service)))
    : null
  const items = documents
    .map((document) => {
      const parts = document.path.split('/')
      const kitchenId =
        parts.length === 4 && parts[0] === 'kitchens' ? parts[1]! : ''
      const owner = scopedKitchen || scopes.get(kitchenId)
      if (!owner) return null
      const entry = projectMenuDirectoryEntry(
        document,
        owner,
        scopedContext || contexts.get(kitchenId)
      )
      return entry && !scopedKitchen ? { ...entry, id: document.path } : entry
    })
    .filter((menu): menu is NonNullable<typeof menu> => Boolean(menu))
  const nextCursor =
    hasMore && documents.length
      ? encodeCursor(
          scopedKitchen
            ? documents.at(-1)?.id || ''
            : documents.at(-1)?.path || ''
        )
      : null
  return { scope, items, nextCursor }
}

/** Filter before returning a service page; skipped raw pages must not hide later matches. */
export async function readMenuDirectoryPage(
  input: ReadMenuDirectoryPageInput = {}
): Promise<MenuDirectoryPage> {
  if (
    input.service !== undefined &&
    input.service !== '' &&
    input.service !== 'online' &&
    input.service !== 'collection' &&
    input.service !== 'delivery' &&
    input.service !== 'table' &&
    input.service !== 'room_service'
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unknown Menu service.',
    })
  const search = text(input.search).slice(0, 120)
  const limit = pageSize(input.limit)
  let cursor = input.cursor
  let page: MenuDirectoryPage
  const items: MenuDirectoryPage['items'] = []
  do {
    page = await readMenuDirectoryBatch({
      ...input,
      cursor,
      limit: Math.max(1, limit - items.length),
    })
    const eligible = page.items.filter(
        (menu) =>
          !input.service ||
          (input.service === 'online'
            ? menuServiceOfferings(menu, 'collection').length > 0 ||
              menuServiceOfferings(menu, 'delivery').length > 0
            : menuServiceOfferings(
            menu,
            input.service as
              | 'collection'
              | 'delivery'
              | 'table'
              | 'room_service'
          ).length > 0)
      )
    for (const menu of eligible) {
      if (input.offering && !menu.offerings?.some(offering => offering.id === text(input.offering))) continue
      if (!search) { items.push(menu); continue }
      const dishes = await readMatchingMenuDishes(getRuntimeFirestore(), menu, search)
      const metadata = [menu.name, menu.description, menu.source?.kitchen_name, menu.kitchen?.name].filter(Boolean).join(' ')
      if (dishes.length || matchesFoodSearch(metadata, search))
        items.push({ ...menu, matching_dishes: dishes })
    }
    cursor = page.nextCursor
  } while (cursor && items.length < limit)
  return { scope: page.scope, items, nextCursor: page.nextCursor }
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
    return (isDocumentId(id) || isMenuDocumentPath(id)) &&
      encodeCursor(id) === cursor
      ? id
      : ''
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

function isMenuDocumentPath(value: string) {
  const parts = value.split('/')
  return (
    parts.length % 2 === 0 &&
    parts.at(-2) === 'menus' &&
    parts.every(isDocumentId)
  )
}
