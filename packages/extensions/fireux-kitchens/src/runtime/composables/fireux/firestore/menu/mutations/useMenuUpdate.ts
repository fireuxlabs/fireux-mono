import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useRuntimeConfig } from '#imports'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { DishStorage } from '../../../../../models/kitchen/dish.model'
import {
  MenuStorage as RootMenuStorage,
  type MenuStatus,
} from '../../../../../models/kitchen/menu/menu.model'
import {
  type KitchenMenu as Menu,
  type KitchenMenuUpdateInput as MenuUpdateInput,
} from '../../../../../models/kitchen/menu/kitchen-menu.model'
import { menuPath } from '../utils/paths'
import {
  menuRootEntryPatch,
  menuRootEntryPatchFromSourceMenu,
  menuRootEntrySourceIsCurrent,
  readMenuRootEntryDocs,
  readSingleStaleMenuRootEntryDoc,
} from '../utils/root-entry'
import { resolveKitchenCollectionBasePath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { assertMenuCanPublish } from './assertMenuCanPublish'
import { renameKitchenMenuDocuments } from './renameKitchenMenuDocuments'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const resolveDb = useFirestoreResolver(options.databaseId)
  const fireux = useFireUXConfig()
  const { appId } = fireux
  const runtimeConfig = useRuntimeConfig()
  const tenantReservedRouteKeys = () => {
    const keys = runtimeConfig.public?.fireux?.reservedRouteKeys
    return Array.isArray(keys) ? keys : []
  }
  const assertTenantMenuRoute = (menuId: string) => {
    if (!fireux.isTenant) return

    const validation = validatePublicSlug(menuId, {
      label: 'Menu path',
      namespace: 'this tenant app',
      reservedScope: 'root',
      runtimeReservedRouteKeys: tenantReservedRouteKeys(),
    })
    if (!validation.isValid) {
      throw new Error(validation.message || 'Menu path is not available.')
    }
  }

  const collectionPath = (kitchenId: string) =>
    menuPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      appId,
    })

  const dishesPath = (kitchenId: string) => {
    const basePath = resolveKitchenCollectionBasePath(
      clean(unref(options.kitchenCollectionPath)),
      appId
    )
    const id = clean(kitchenId)
    return basePath && id ? `${basePath}/${id}/${DishStorage.collection}` : ''
  }

  async function updateMenu(
    kitchenId: string,
    menuId: string,
    patch: MenuUpdateInput
  ) {
    requireWritableData()
    const path = collectionPath(kitchenId)
    const id = clean(menuId)
    if (!path || !id) throw new Error('Menu id is required')
    await updateDocument<Menu>(path, id, patch)

    let rootMenuPatch = menuRootEntryPatch(patch as Record<string, unknown>)
    if (!Object.keys(rootMenuPatch).length) return

    const db = resolveDb()
    let rootMenuDocs = await readMenuRootEntryDocs({
      db,
      appId,
      kitchenId,
      menuId: id,
    })
    if (!rootMenuDocs.length) {
      rootMenuDocs = await readSingleStaleMenuRootEntryDoc({
        db,
        appId,
        kitchenId,
        scopedMenuCollectionPath: path,
        menuId: id,
      })
      if (rootMenuDocs.length) {
        const menuSnap = await getDoc(doc(db, path, id))
        if (menuSnap.exists()) {
          rootMenuPatch = menuRootEntryPatchFromSourceMenu({
            scopedMenuCollectionPath: path,
            menuId: id,
            data: menuSnap.data() as Record<string, unknown>,
          })
        }
      }
    }
    const needsSourceRepair = rootMenuDocs.some(
      (docSnap) =>
        !menuRootEntrySourceIsCurrent(
          docSnap.data() as Record<string, unknown>,
          {
            scopedMenuCollectionPath: path,
            menuId: id,
          }
        )
    )

    if (needsSourceRepair) {
      const menuSnap = await getDoc(doc(db, path, id))
      if (menuSnap.exists()) {
        rootMenuPatch = {
          ...rootMenuPatch,
          ...menuRootEntryPatchFromSourceMenu({
            scopedMenuCollectionPath: path,
            menuId: id,
            data: menuSnap.data() as Record<string, unknown>,
          }),
        }
      }
    }

    await Promise.all(
      rootMenuDocs.map((docSnap) =>
        updateDocument<Record<string, unknown>>(
          RootMenuStorage.rootCollection,
          docSnap.id,
          rootMenuPatch
        )
      )
    )
  }

  async function renameMenu(
    kitchenId: string,
    menuId: string,
    nextMenuId: string
  ) {
    requireWritableData()
    const path = collectionPath(kitchenId)
    const oldId = clean(menuId)
    const nextId = normalizeSlug(nextMenuId)
    if (!path || !oldId) throw new Error('Menu id is required')
    if (!nextId) throw new Error('New menu id is required')
    assertTenantMenuRoute(nextId)
    if (nextId === oldId) return { id: oldId, changed: false }

    return renameKitchenMenuDocuments({
      appId,
      db: resolveDb(),
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      menuCollectionPath: path,
      menuId: oldId,
      nextMenuId: nextId,
    })
  }

  async function setMenuStatus(
    kitchenId: string,
    menuId: string,
    status: MenuStatus
  ) {
    if (status === 'published') {
      assertTenantMenuRoute(clean(menuId))
      await assertMenuCanPublish({
        appId,
        db: resolveDb(),
        dishCollectionPath: dishesPath(kitchenId),
        kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
        kitchenId,
        menuCollectionPath: collectionPath(kitchenId),
        menuId,
      })
    }
    await updateMenu(kitchenId, menuId, { status })
  }

  return {
    updateMenu,
    renameMenu,
    setMenuStatus,
    publishMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'published'),
    archiveMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'archived'),
  }
}
