import { unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { DishStorage } from '../../../kitchen/utils/dish'
import { resolveKitchenCollectionBasePath } from '../../../kitchen/utils/kitchen-collection-path'
import { menuPath } from '../firestore/utils/paths'
import { useMenuUpdate } from '../firestore/mutations/useMenuUpdate'
import { assertMenuCanPublish } from './validation'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuPublication(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { appId } = useFireUXConfig()
  const { currentUser } = useAuth()
  const resolveDb = useFirestoreResolver(options.databaseId)
  const { updateMenu } = useMenuUpdate(options)

  async function publishMenu(kitchenId: string, menuId: string) {
    const kitchenCollectionPath = clean(unref(options.kitchenCollectionPath))
    const basePath = resolveKitchenCollectionBasePath(
      kitchenCollectionPath,
      appId
    )
    const id = clean(kitchenId)
    await assertMenuCanPublish({
      appId,
      db: resolveDb(),
      dishCollectionPath:
        basePath && id ? `${basePath}/${id}/${DishStorage.collection}` : '',
      kitchenCollectionPath,
      kitchenId,
      menuCollectionPath: menuPath({ kitchenCollectionPath, kitchenId, appId }),
      menuId,
    })
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before publishing this Menu.')
    await $fetch('/api/workspace/kitchen/menus/publish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, menuId },
    })
  }

  async function unpublishMenu(kitchenId: string, menuId: string) {
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before unpublishing this menu.')
    await $fetch('/api/workspace/kitchen/menus/unpublish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, menuId },
    })
  }

  async function archiveMenu(kitchenId: string, menuId: string) {
    await updateMenu(kitchenId, menuId, { status: 'archived' })
  }

  return { publishMenu, unpublishMenu, archiveMenu }
}
