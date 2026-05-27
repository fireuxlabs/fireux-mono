import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { unref } from 'vue'
import type { Menu, MenuItem, MenuSection, MenuStatus, MenuUpdateInput } from '../../../../../models/menu.model'
import {
  menuItemsPath,
  menuPath,
  menuSectionsPath,
} from '../utils/paths'
import { resolveKitchenCollectionBasePath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

const clean = (value: unknown) => String(value ?? '').trim()
const GLOBAL_COLLECTION_PATH = 'menus'

export function useMenuUpdate(
  options: {
    scope?: 'root' | 'kitchen'
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const resolveDb = useFirestoreResolver(options.databaseId)

  const collectionPath = (kitchenId: string) =>
    options.scope === 'kitchen' || clean(kitchenId)
      ? menuPath({
          kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
          kitchenId,
        })
      : GLOBAL_COLLECTION_PATH

  const dishesPath = (kitchenId: string) => {
    const basePath = resolveKitchenCollectionBasePath(
      clean(unref(options.kitchenCollectionPath))
    )
    const id = clean(kitchenId)
    return basePath && id ? `${basePath}/${id}/dishes` : ''
  }

  async function updateMenu(kitchenId: string, menuId: string, patch: MenuUpdateInput) {
    const path = collectionPath(kitchenId)
    const id = clean(menuId)
    if (!path || !id) throw new Error('Menu id is required')
    await updateDocument<Menu>(path, id, patch)
  }

  async function setMenuStatus(kitchenId: string, menuId: string, status: MenuStatus) {
    if (status === 'published' && (options.scope === 'kitchen' || clean(kitchenId))) {
      await assertMenuCanPublish(kitchenId, menuId)
    }
    await updateMenu(kitchenId, menuId, { status })
  }

  async function assertMenuCanPublish(kitchenId: string, menuId: string) {
    const sectionsPath = menuSectionsPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      menuId,
    })
    if (!sectionsPath) throw new Error('Missing menu sections')

    const sectionsSnap = await getDocs(collection(resolveDb(), sectionsPath))
    const sections = sectionsSnap.docs
      .map((doc) => ({ ...(doc.data() as MenuSection), id: doc.id }))
      .filter((section) => section.status !== 'archived')

    if (!sections.length) throw new Error('Menu needs at least one section')

    let itemCount = 0
    for (const section of sections) {
      const itemsPath = menuItemsPath({
        kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
        kitchenId,
        menuId,
        sectionId: section.id,
      })
      const itemsSnap = await getDocs(collection(resolveDb(), itemsPath))
      const items = itemsSnap.docs
        .map((doc) => ({ ...(doc.data() as MenuItem), id: doc.id }))
        .filter((item) => item.status !== 'archived')

      itemCount += items.length
      if (items.some((item) => !clean(item.dish_id))) {
        throw new Error('Every menu item needs a dish')
      }

      const dishCollectionPath = dishesPath(kitchenId)
      if (!dishCollectionPath) throw new Error('Missing dish collection')

      for (const item of items) {
        const dishId = clean(item.dish_id)
        const dishSnap = await getDoc(doc(resolveDb(), dishCollectionPath, dishId))
        if (!dishSnap.exists()) {
          throw new Error(`Menu item references missing dish: ${dishId}`)
        }
      }
    }

    if (!itemCount) throw new Error('Menu needs at least one item')
  }

  return {
    updateMenu,
    setMenuStatus,
    publishMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'published'),
    archiveMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'archived'),
  }
}
