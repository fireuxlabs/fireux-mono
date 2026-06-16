import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { DishStorage } from '../../../../../models/dish.model'
import type { MenuItem } from '../../../../../models/menu-item.model'
import type { MenuSection } from '../../../../../models/menu-section.model'
import { type Menu, type MenuStatus, type MenuUpdateInput } from '../../../../../models/menu.model'
import { resolveMenuMaturity } from '../utils/view/useMenuMaturity'
import {
  menuItemsPath,
  menuPath,
  menuSectionsPath,
} from '../utils/paths'
import { resolveKitchenCollectionBasePath } from '../../kitchen/utils/paths/useKitchenChildCollection'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const resolveDb = useFirestoreResolver(options.databaseId)
  const { appId } = useFireUXConfig()

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

  async function updateMenu(kitchenId: string, menuId: string, patch: MenuUpdateInput) {
    const path = collectionPath(kitchenId)
    const id = clean(menuId)
    if (!path || !id) throw new Error('Menu id is required')
    await updateDocument<Menu>(path, id, patch)
  }

  async function setMenuStatus(kitchenId: string, menuId: string, status: MenuStatus) {
    if (status === 'published') {
      await assertMenuCanPublish(kitchenId, menuId)
    }
    await updateMenu(kitchenId, menuId, { status })
  }

  async function assertMenuCanPublish(kitchenId: string, menuId: string) {
    const menuSnap = await getDoc(doc(resolveDb(), collectionPath(kitchenId), clean(menuId)))
    const menuMaturity = resolveMenuMaturity({
      menu: menuSnap.exists()
        ? { ...(menuSnap.data() as Menu), id: menuSnap.id }
        : null,
      structuredItemsCount: 0,
    })
    if (menuMaturity.hasSource) return

    const sectionsPath = menuSectionsPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      menuId,
      appId,
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
        appId,
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
