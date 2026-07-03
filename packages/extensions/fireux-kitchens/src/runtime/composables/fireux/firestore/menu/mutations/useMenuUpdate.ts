import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { DishStorage } from '../../../../../models/kitchen/dish.model'
import type { MenuItem } from '../../../../../models/kitchen/menu/menu-item.model'
import type { MenuSection } from '../../../../../models/kitchen/menu/menu-section.model'
import { type Menu, type MenuStatus, type MenuUpdateInput } from '../../../../../models/kitchen/menu/menu.model'
import { MenuSourceUploadStorage } from '../../../../../models/kitchen/menu/menu-source-upload.model'
import {
  menuItemsPath,
  menuPath,
  menuSectionsPath,
} from '../utils/paths'
import { resolveKitchenCollectionBasePath } from '../../kitchen/utils/paths/useKitchenChildCollection'

const clean = (value: unknown) => String(value ?? '').trim()
const withoutId = <T extends Record<string, unknown>>(data: T) => {
  const next = { ...data }
  delete next.id
  return next
}

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

  async function renameMenu(kitchenId: string, menuId: string, nextMenuId: string) {
    const path = collectionPath(kitchenId)
    const oldId = clean(menuId)
    const nextId = normalizeSlug(nextMenuId)
    if (!path || !oldId) throw new Error('Menu id is required')
    if (!nextId) throw new Error('New menu id is required')
    if (nextId === oldId) return { id: oldId, changed: false }

    const db = resolveDb()
    const user = await useRequireUser()
    const oldMenuRef = doc(db, path, oldId)
    const nextMenuRef = doc(db, path, nextId)
    const [oldMenuSnap, nextMenuSnap] = await Promise.all([
      getDoc(oldMenuRef),
      getDoc(nextMenuRef),
    ])

    if (!oldMenuSnap.exists()) throw new Error(`Menu not found: ${oldId}`)
    if (nextMenuSnap.exists()) throw new Error(`Menu already exists: ${nextId}`)

    const sectionsPath = menuSectionsPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      menuId: oldId,
      appId,
    })
    const sectionsSnap = await getDocs(collection(db, sectionsPath))
    const sectionsWithItems = await Promise.all(
      sectionsSnap.docs.map(async (sectionSnap) => {
        const itemsPath = menuItemsPath({
          kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
          kitchenId,
          menuId: oldId,
          sectionId: sectionSnap.id,
          appId,
        })
        const itemsSnap = await getDocs(collection(db, itemsPath))

        return {
          section: sectionSnap,
          items: itemsSnap.docs,
        }
      })
    )
    const uploadPath = `${resolveKitchenCollectionBasePath(
      clean(unref(options.kitchenCollectionPath)),
      appId
    )}/${clean(kitchenId)}/${MenuSourceUploadStorage.collection}`
    const oldUploadRef = doc(db, uploadPath, oldId)
    const nextUploadRef = doc(db, uploadPath, nextId)
    const [oldUploadSnap, nextUploadSnap] = await Promise.all([
      getDoc(oldUploadRef),
      getDoc(nextUploadRef),
    ])
    const batch = writeBatch(db)
    let batchOps = 0
    const updated = {
      at: serverTimestamp(),
      by: user.uid,
    }

    const nextBatchOp = () => {
      batchOps += 1
      if (batchOps > 450) {
        throw new Error('Menu is too large to rename in one operation.')
      }

      return batch
    }

    nextBatchOp().set(nextMenuRef, {
      ...withoutId(oldMenuSnap.data() as Record<string, unknown>),
      updated,
    })

    for (const { section, items } of sectionsWithItems) {
      const nextSectionRef = doc(
        db,
        menuSectionsPath({
          kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
          kitchenId,
          menuId: nextId,
          appId,
        }),
        section.id
      )
      nextBatchOp().set(nextSectionRef, {
        ...withoutId(section.data() as Record<string, unknown>),
        menu_id: nextId,
        updated,
      })

      for (const item of items) {
        const nextItemRef = doc(
          db,
          menuItemsPath({
            kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
            kitchenId,
            menuId: nextId,
            sectionId: section.id,
            appId,
          }),
          item.id
        )
        nextBatchOp().set(nextItemRef, {
          ...withoutId(item.data() as Record<string, unknown>),
          menu_id: nextId,
          updated,
        })
      }
    }

    if (oldUploadSnap.exists() && !nextUploadSnap.exists()) {
      nextBatchOp().set(nextUploadRef, {
        ...withoutId(oldUploadSnap.data() as Record<string, unknown>),
        updated,
      })
    }

    if (oldUploadSnap.exists() && !nextUploadSnap.exists()) {
      nextBatchOp().delete(oldUploadRef)
    }

    for (const { section, items } of sectionsWithItems) {
      for (const item of items) {
        nextBatchOp().delete(item.ref)
      }
      nextBatchOp().delete(section.ref)
    }
    nextBatchOp().delete(oldMenuRef)

    await batch.commit()

    return { id: nextId, changed: true }
  }

  async function setMenuStatus(kitchenId: string, menuId: string, status: MenuStatus) {
    if (status === 'published') {
      await assertMenuCanPublish(kitchenId, menuId)
    }
    await updateMenu(kitchenId, menuId, { status })
  }

  async function assertMenuCanPublish(kitchenId: string, menuId: string) {
    const menuSnap = await getDoc(doc(resolveDb(), collectionPath(kitchenId), clean(menuId)))
    const menu = menuSnap.exists()
      ? { ...(menuSnap.data() as Menu), id: menuSnap.id }
      : null
    if (clean(menu?.doc_url)) return

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
    renameMenu,
    setMenuStatus,
    publishMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'published'),
    archiveMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'archived'),
  }
}
