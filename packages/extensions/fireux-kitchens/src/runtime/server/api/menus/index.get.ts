// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: batch explicit Place links and omit absent Menu copy.
import { createError, defineEventHandler, getQuery } from 'h3'
import { FieldPath } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { menuSourceFromData } from '../../menu/payload/source.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import { KitchenMenuStorage } from '../../../models/kitchen/menu/kitchen-menu.model.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import {
  PUBLIC_MENU_INDEX_MAX_PAGE_SIZE,
  PUBLIC_MENU_INDEX_PAGE_SIZE,
  type PublicMenuIndexItem,
  type PublicMenuIndexKitchen,
  type PublicMenuIndexPage,
  type PublicMenuIndexScope,
} from '../../../models/kitchen/menu/menu-index.model.ts'
import {
  resolveTenantPublicMenuScope,
  resolveDirectoryPublicMenuScope,
  type TenantPublicMenuScope,
} from '../../menu/ownership/public-target.ts'
import {
  menuKitchenIdentity,
  menuKitchenOperationHours,
  readMenuKitchenPlaceData,
} from '../../menu/ownership/kitchen-scope.ts'
import { readMenuOrderingConfig } from '../../menu/ordering/config.ts'
import { guestDiscoverableMenuContexts } from '../../../utils/menu-context.ts'

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
  scopedKitchen?: TenantPublicMenuScope | null,
  hydration: MenuIndexHydration = {}
): PublicMenuIndexItem | null => {
  const status = readRecordString(data, 'status')
  if (status !== 'published') return null

  const source = scopedKitchen
    ? menuSourceFromData(data, {
        kitchenAppId: scopedKitchen.appId,
        kitchenId: scopedKitchen.kitchenId,
        kitchenSlug: scopedKitchen.kitchenSlug,
        ...(hydration.kitchenName
          ? { kitchenName: hydration.kitchenName }
          : {}),
        kitchenMenuId: id,
      })
    : menuSourceFromData(
        data,
        hydration.kitchenName ? { kitchenName: hydration.kitchenName } : {}
      )
  const hasSource = Boolean(
    source.app_id && source.kitchen_id && source.menu_id
  )
  const publicSource = hasSource
    ? {
        app_id: source.app_id || '',
        kitchen_id: source.kitchen_id || '',
        menu_id: source.menu_id || '',
        ...(source.kitchen_slug ? { kitchen_slug: source.kitchen_slug } : {}),
        ...(source.kitchen_name ? { kitchen_name: source.kitchen_name } : {}),
      }
    : null
  const orderingData = scopedKitchen ? data : hydration.menuData
  const ordering = orderingData
    ? readMenuOrderingConfig(
        orderingData,
        undefined,
        hydration.kitchenOperationHours
      )
    : null
  const contexts = guestDiscoverableMenuContexts(ordering)
  const storedKind = scopedKitchen ? 'menu' : readRecordString(data, 'kind')
  const kind = storedKind === 'menu' || storedKind === 'doc'
    ? storedKind
    : undefined
  const description = readRecordString(data, 'description')

  return {
    id,
    kind,
    name: readRecordString(data, 'name') || id,
    ...(description ? { description } : {}),
    status: 'published' as const,
    ...(contexts.length ? { contexts } : {}),
    ...(hydration.kitchen ? { kitchen: hydration.kitchen } : {}),
    ...(ordering?.service_hours
      ? { service_hours: ordering.service_hours }
      : {}),
    ...(publicSource ? { source: publicSource } : {}),
  }
}

type MenuIndexDocument = {
  id: string
  data: Record<string, unknown>
}

type MenuIndexHydration = {
  kitchen?: PublicMenuIndexKitchen
  kitchenName?: string
  kitchenOperationHours?: ReturnType<typeof menuKitchenOperationHours>
  menuData?: Record<string, unknown>
}

const menuIndexHydration = async (
  db: ReturnType<typeof getRuntimeFirestore>,
  documents: MenuIndexDocument[]
) => {
  const sources = documents.map(document => ({
    document,
    source: menuSourceFromData(document.data),
  }))
  const references = new Map<string, ReturnType<typeof db.doc>>()

  for (const { source } of sources) {
    if (!source.kitchen_id) continue

    const rootRef = db.collection('kitchens').doc(source.kitchen_id)
    references.set(rootRef.path, rootRef)

    if (source.app_id) {
      const appRef = db
        .collection(`apps/${source.app_id}/kitchens`)
        .doc(source.kitchen_id)
      references.set(appRef.path, appRef)

      if (source.menu_id) {
        const menuRef = appRef
          .collection(KitchenMenuStorage.collection)
          .doc(source.menu_id)
        references.set(menuRef.path, menuRef)
      }
    }
  }

  if (!references.size) return new Map<string, MenuIndexHydration>()

  // One bounded batch per cursor page keeps the global directory current
  // without either copied Kitchen identity or per-Menu reads.
  const snapshots = await db.getAll(...references.values())
  const dataByPath = new Map(
    snapshots.map(snapshot => [
      snapshot.ref.path,
      snapshot.exists ? snapshot.data() || {} : {},
    ])
  )
  const placeReferences = new Map<string, ReturnType<typeof db.doc>>()
  for (const { source } of sources) {
    if (!source.kitchen_id) continue
    const rootData = dataByPath.get(`kitchens/${source.kitchen_id}`) || {}
    const placeId = readRecordString(rootData, 'place_id')
    if (!placeId) continue
    const placeRef = db.collection(PlaceStorage.collection).doc(placeId)
    placeReferences.set(placeRef.path, placeRef)
  }
  if (placeReferences.size) {
    const placeSnapshots = await db.getAll(...placeReferences.values())
    for (const snapshot of placeSnapshots) {
      dataByPath.set(
        snapshot.ref.path,
        snapshot.exists ? snapshot.data() || {} : {}
      )
    }
  }

  return new Map(
    sources.map(({ document, source }) => {
      if (!source.kitchen_id) {
        return [document.id, {}] as const
      }

      const rootPath = `kitchens/${source.kitchen_id}`
      const appPath = source.app_id
        ? `apps/${source.app_id}/kitchens/${source.kitchen_id}`
        : ''
      const rootData = dataByPath.get(rootPath) || {}
      const placeId = readRecordString(rootData, 'place_id')
      const placeData = placeId
        ? dataByPath.get(`${PlaceStorage.collection}/${placeId}`) || {}
        : {}
      const identity = menuKitchenIdentity(
        rootData,
        appPath ? dataByPath.get(appPath) || {} : {},
        placeData
      )
      const kitchenOperationHours = menuKitchenOperationHours(
        rootData,
        appPath ? dataByPath.get(appPath) || {} : {},
        placeData
      )
      const menuPath = appPath && source.menu_id
        ? `${appPath}/${KitchenMenuStorage.collection}/${source.menu_id}`
        : ''
      const menuData = menuPath ? dataByPath.get(menuPath) : undefined
      const kitchen = identity.name
        ? {
            name: identity.name,
            ...(identity.logoImageUrl
              ? { logo_image_url: identity.logoImageUrl }
              : {}),
            ...(identity.imageUrl
              ? { image_url: identity.imageUrl }
              : {}),
            ...(identity.imageShade
              ? { image_shade: identity.imageShade }
              : {}),
          }
        : undefined

      return [
        document.id,
        {
          ...(kitchen ? { kitchen } : {}),
          ...(identity.name ? { kitchenName: identity.name } : {}),
          ...(kitchenOperationHours.windows.length
            ? { kitchenOperationHours }
            : {}),
          ...(menuData ? { menuData } : {}),
        },
      ] as const
    })
  )
}

const scopedMenuIndexHydration = async (
  db: ReturnType<typeof getRuntimeFirestore>,
  scope: TenantPublicMenuScope
): Promise<MenuIndexHydration> => {
  const [appKitchenSnap, placeData] = await Promise.all([
    db.collection(`apps/${scope.appId}/kitchens`).doc(scope.kitchenId).get(),
    readMenuKitchenPlaceData(scope.rootKitchenData),
  ])
  const appKitchenData = appKitchenSnap.exists
    ? appKitchenSnap.data() || {}
    : {}
  const identity = menuKitchenIdentity(
    scope.rootKitchenData,
    appKitchenData,
    placeData
  )
  const kitchenOperationHours = menuKitchenOperationHours(
    scope.rootKitchenData,
    appKitchenData,
    placeData
  )
  const kitchen = identity.name
    ? {
        name: identity.name,
        ...(identity.logoImageUrl
          ? { logo_image_url: identity.logoImageUrl }
          : {}),
        ...(identity.imageUrl
          ? { image_url: identity.imageUrl }
          : {}),
        ...(identity.imageShade
          ? { image_shade: identity.imageShade }
          : {}),
      }
    : undefined

  return {
    ...(kitchen ? { kitchen } : {}),
    ...(identity.name ? { kitchenName: identity.name } : {}),
    ...(kitchenOperationHours.windows.length
      ? { kitchenOperationHours }
      : {}),
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
  const indexDocuments = pageDocs.map(doc => ({
    id: doc.id,
    data: doc.data(),
  }))
  const hydration = scopedKitchen
    ? new Map<string, MenuIndexHydration>()
    : await menuIndexHydration(db, indexDocuments)
  const scopedHydration = scopedKitchen
    ? await scopedMenuIndexHydration(db, scopedKitchen)
    : null
  const items = pageDocs
    .map((doc) => publicMenuIndexItem(
      doc.id,
      doc.data(),
      scopedKitchen,
      scopedHydration || hydration.get(doc.id)
    ))
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
