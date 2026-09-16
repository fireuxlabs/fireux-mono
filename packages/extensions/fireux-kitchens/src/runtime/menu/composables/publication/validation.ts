import {
  collection,
  doc,
  getDoc,
  getDocs,
  type Firestore,
} from 'firebase/firestore'
import type { MenuItem } from '../../utils/menu-item.ts'
import type { MenuSection } from '../../utils/menu-section.ts'
import type { KitchenMenu as Menu } from '../../utils/kitchen-menu.ts'
import { menuItemsPath, menuSectionsPath } from '../firestore/utils/paths'

const clean = (value: unknown) => String(value ?? '').trim()

export async function assertMenuCanPublish(options: {
  appId: string
  db: Firestore
  dishCollectionPath: string
  kitchenCollectionPath?: string
  kitchenId: string
  menuCollectionPath: string
  menuId: string
}) {
  const kitchenId = clean(options.kitchenId)
  const menuId = clean(options.menuId)
  const kitchenCollectionPath = clean(options.kitchenCollectionPath)
  const menuSnap = await getDoc(
    doc(options.db, options.menuCollectionPath, menuId)
  )
  const menu = menuSnap.exists()
    ? { ...(menuSnap.data() as Menu), id: menuSnap.id }
    : null
  if (clean(menu?.doc?.url)) return

  const sectionsPath = menuSectionsPath({
    kitchenCollectionPath,
    kitchenId,
    menuId,
    appId: options.appId,
  })
  if (!sectionsPath) throw new Error('Missing menu sections')

  const sectionsSnap = await getDocs(collection(options.db, sectionsPath))
  const sections = sectionsSnap.docs
    .map((doc) => ({ ...(doc.data() as MenuSection), id: doc.id }))
    .filter((section) => section.status !== 'archived')

  if (!sections.length) throw new Error('Menu needs at least one section')

  let itemCount = 0
  for (const section of sections) {
    const itemsPath = menuItemsPath({
      kitchenCollectionPath,
      kitchenId,
      menuId,
      sectionId: section.id,
      appId: options.appId,
    })
    const itemsSnap = await getDocs(collection(options.db, itemsPath))
    const items = itemsSnap.docs
      .map((doc) => ({ ...(doc.data() as MenuItem), id: doc.id }))
      .filter((item) => item.status !== 'archived')

    itemCount += items.length
    if (items.some((item) => !clean(item.dish_id))) {
      throw new Error('Every menu item needs a dish')
    }

    const dishCollectionPath = clean(options.dishCollectionPath)
    if (!dishCollectionPath) throw new Error('Missing dish collection')

    for (const item of items) {
      const dishId = clean(item.dish_id)
      const dishSnap = await getDoc(doc(options.db, dishCollectionPath, dishId))
      if (!dishSnap.exists()) {
        throw new Error(`Menu item references missing dish: ${dishId}`)
      }
    }
  }

  if (!itemCount) throw new Error('Menu needs at least one item')
}
