import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useRuntimeConfig } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { DishStorage } from '../../../../kitchen/models/dish.model.ts'
import { type MenuStatus } from '../../../models/menu.model.ts'
import {
  type KitchenMenu as Menu,
  type KitchenMenuUpdateInput as MenuUpdateInput,
} from '../../../models/kitchen-menu.model.ts'
import { menuPath } from '../utils/paths'
import { resolveKitchenCollectionBasePath } from '../../../../kitchen/composables/firestore/utils/paths/useKitchenChildCollection'
import { assertMenuCanPublish } from './assertMenuCanPublish'
import { renameKitchenMenuDocuments } from './renameKitchenMenuDocuments'
import { syncMenuDirectory } from './syncMenuDirectory'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const resolveDb = useFirestoreResolver(options.databaseId)
  const fireux = useFireUXConfig()
  const { appId } = fireux
  const runtimeConfig = useRuntimeConfig()
  const { currentUser } = useAuth()
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

    await syncMenuDirectory({ kitchenId, menuId: id })
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

    const result = await renameKitchenMenuDocuments({
      appId,
      db: resolveDb(),
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      menuCollectionPath: path,
      menuId: oldId,
      nextMenuId: nextId,
    })
    await syncMenuDirectory({
      kitchenId,
      menuId: nextId,
      previousMenuId: oldId,
    })
    return result
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
      const token = await currentUser.value?.getIdToken()
      if (!token) throw new Error('Sign in before publishing this Menu.')
      await $fetch('/api/workspace/kitchen/menus/publish', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId, menuId },
      })
      return
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
