import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import { KitchenMenuStorage } from '../../models/kitchen-menu.model.ts'
import type { MenuDirectoryKitchen } from '../../models/menu-directory.model.ts'
import {
  menuKitchenIdentity,
  menuKitchenOperationHours,
  readMenuKitchenPlaceData,
} from '../ownership/kitchen-scope'
import { menuSourceFromData } from '../payload/source'
import type { TenantMenuScope } from '../ownership/target'
import type { MenuDirectoryDocument } from './projection'

export type MenuDirectoryContext = {
  kitchen?: MenuDirectoryKitchen
  kitchenName?: string
  kitchenOperationHours?: ReturnType<typeof menuKitchenOperationHours>
  menuData?: Record<string, unknown>
}

export async function readMenuDirectoryContext(
  db: ReturnType<typeof getRuntimeFirestore>,
  documents: MenuDirectoryDocument[]
) {
  const sources = documents.map((document) => ({
    document,
    source: menuSourceFromData(document.data),
  }))
  const references = new Map<string, ReturnType<typeof db.doc>>()
  for (const { source } of sources) {
    if (!source.kitchen_id) continue
    const rootRef = db.collection('kitchens').doc(source.kitchen_id)
    references.set(rootRef.path, rootRef)
    if (source.menu_id) {
      const menuRef = rootRef
        .collection(KitchenMenuStorage.collection)
        .doc(source.menu_id)
      references.set(menuRef.path, menuRef)
    }
  }
  if (!references.size) return new Map<string, MenuDirectoryContext>()
  const snapshots = await db.getAll(...references.values())
  const dataByPath = new Map(
    snapshots.map((snapshot) => [
      snapshot.ref.path,
      snapshot.exists ? snapshot.data() || {} : {},
    ])
  )
  const placeReferences = new Map<string, ReturnType<typeof db.doc>>()
  for (const { source } of sources) {
    if (!source.kitchen_id) continue
    const placeRef = db
      .collection(PlaceStorage.collection)
      .doc(source.kitchen_id)
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
      if (!source.kitchen_id) return [document.id, {}] as const
      const rootPath = `kitchens/${source.kitchen_id}`
      const rootData = dataByPath.get(rootPath) || {}
      const placeData =
        dataByPath.get(`${PlaceStorage.collection}/${source.kitchen_id}`) || {}
      const identity = menuKitchenIdentity(rootData, placeData)
      const kitchenOperationHours = menuKitchenOperationHours(
        rootData,
        placeData
      )
      const menuPath = source.menu_id
        ? `${rootPath}/${KitchenMenuStorage.collection}/${source.menu_id}`
        : ''
      const menuData = menuPath ? dataByPath.get(menuPath) : undefined
      const kitchen = identity.name
        ? {
            name: identity.name,
            ...(identity.logoImageUrl
              ? { logo_image_url: identity.logoImageUrl }
              : {}),
            ...(identity.imageUrl ? { image_url: identity.imageUrl } : {}),
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

export async function readScopedMenuDirectoryContext(
  _db: ReturnType<typeof getRuntimeFirestore>,
  scope: TenantMenuScope
): Promise<MenuDirectoryContext> {
  const placeData = await readMenuKitchenPlaceData(scope.kitchenId)
  const identity = menuKitchenIdentity(scope.rootKitchenData, placeData)
  const kitchenOperationHours = menuKitchenOperationHours(
    scope.rootKitchenData,
    placeData
  )
  const kitchen = identity.name
    ? {
        name: identity.name,
        ...(identity.logoImageUrl
          ? { logo_image_url: identity.logoImageUrl }
          : {}),
        ...(identity.imageUrl ? { image_url: identity.imageUrl } : {}),
        ...(identity.imageShade ? { image_shade: identity.imageShade } : {}),
      }
    : undefined
  return {
    ...(kitchen ? { kitchen } : {}),
    ...(identity.name ? { kitchenName: identity.name } : {}),
    ...(kitchenOperationHours.windows.length ? { kitchenOperationHours } : {}),
  }
}
