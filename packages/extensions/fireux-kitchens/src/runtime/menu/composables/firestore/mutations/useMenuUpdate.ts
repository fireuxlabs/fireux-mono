import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { DishStorage } from '../../../../kitchen/utils/dish.ts'
import { type MenuStatus } from '../../../utils/menu.ts'
import {
  type KitchenMenu as Menu,
  type KitchenMenuUpdateInput as MenuUpdateInput,
} from '../../../utils/kitchen-menu.ts'
import { menuPath } from '../utils/paths'
import { resolveKitchenCollectionBasePath } from '../../../../kitchen/utils/kitchen-collection-path'
import { assertMenuCanPublish } from './assertMenuCanPublish'
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
  const { currentUser } = useAuth()
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
    const { name, ...remaining } = patch
    if (Object.hasOwn(remaining, 'slug')) throw new Error('Menu slug changes require a name change.')
    const renamed = name !== undefined ? await renameMenu(kitchenId, id, name) : undefined
    if (Object.keys(remaining).length) await updateDocument<Menu>(path, id, remaining)

    await syncMenuDirectory({ kitchenId, menuId: id })
    return renamed
  }

  async function renameMenu(kitchenId: string, menuId: string, name: string) {
    requireWritableData()
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in to edit this Menu.')
    return $fetch<{ id: string; slug: string }>('/api/workspace/kitchen/menus/rename', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, menuId, name },
    })
  }

  async function setMenuStatus(
    kitchenId: string,
    menuId: string,
    status: MenuStatus
  ) {
    if (status === 'published') {
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
    unpublishMenu: async (kitchenId: string, menuId: string) => {
      const token = await currentUser.value?.getIdToken()
      if (!token) throw new Error('Sign in before unpublishing this menu.')
      await $fetch('/api/workspace/kitchen/menus/unpublish', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId, menuId },
      })
    },
    archiveMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'archived'),
  }
}
