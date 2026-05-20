import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { unref, type Ref } from 'vue'
import type { Menu, MenuItem, MenuSection, MenuStatus } from '../../../../../../../models/menu.model'
import {
  kitchenMenuItemsPath,
  kitchenMenusPath,
  kitchenMenuSectionsPath,
} from '../paths'
import { resolveKitchenCollectionBasePath } from '../../collections/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) => clean(unref(value))

export function useKitchenMenuUpdate(options: Options = {}) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const resolveDb = useFirestoreResolver(options.databaseId)

  const menusPath = (kitchenId: string) =>
    kitchenMenusPath({
      kitchenCollectionPath: optionPath(options.kitchenCollectionPath),
      kitchenId,
    })

  const dishesPath = (kitchenId: string) => {
    const basePath = resolveKitchenCollectionBasePath(optionPath(options.kitchenCollectionPath))
    const id = clean(kitchenId)
    return basePath && id ? `${basePath}/${id}/dishes` : ''
  }

  const updateMenu = async (
    kitchenId: string,
    menuId: string,
    patch: Partial<Menu>
  ) => {
    const collectionPath = menusPath(kitchenId)
    const id = clean(menuId)
    if (!collectionPath || !id) throw new Error('Missing menu')
    await updateDocument<Menu>(collectionPath, id, patch)
  }

  const setMenuStatus = async (
    kitchenId: string,
    menuId: string,
    status: MenuStatus
  ) => {
    if (status === 'published') {
      await assertMenuCanPublish(kitchenId, menuId)
    }
    await updateMenu(kitchenId, menuId, { status })
  }

  const assertMenuCanPublish = async (kitchenId: string, menuId: string) => {
    const sectionsPath = kitchenMenuSectionsPath({
      kitchenCollectionPath: optionPath(options.kitchenCollectionPath),
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
      const itemsPath = kitchenMenuItemsPath({
        kitchenCollectionPath: optionPath(options.kitchenCollectionPath),
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
