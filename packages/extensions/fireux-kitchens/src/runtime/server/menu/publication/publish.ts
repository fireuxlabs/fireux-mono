import type { Firestore } from 'firebase-admin/firestore'
import { serverUpdate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-update'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { ensureKitchenMenuRootEntry } from '../draft/root-entry.ts'
import { completeKitchenMenuPublication } from './run.ts'

type PublishInput = {
  appId: string
  db: Firestore
  kitchenId: string
  kitchenPath: string
  menuId: string
  uid: string
}

type PublishDependencies = {
  ensureRootEntry?: typeof ensureKitchenMenuRootEntry
  updateMenu?: typeof serverUpdate
}

const text = (value: unknown) => String(value ?? '').trim()

export async function publishKitchenMenu(
  input: PublishInput,
  dependencies: PublishDependencies = {}
) {
  const menuRef = input.db.doc(
    `apps/${input.appId}/kitchens/${input.kitchenId}/menus/${input.menuId}`
  )
  const menuSnap = await menuRef.get()
  if (!menuSnap.exists) throw new Error('Menu not found.')

  const menuData = menuSnap.data() || {}
  const sectionsSnap = await menuRef.collection('sections').get()
  const sections = sectionsSnap.docs.filter(
    (section) => text(section.get('status')) !== 'archived'
  )
  if (!sections.length) throw new Error('Menu needs at least one section')

  let itemCount = 0
  for (const section of sections) {
    const itemsSnap = await section.ref.collection('items').get()
    const items = itemsSnap.docs.filter(
      (item) => text(item.get('status')) !== 'archived'
    )
    itemCount += items.length
    for (const item of items) {
      const dishId = text(item.get('dish_id'))
      if (!dishId) throw new Error('Every menu item needs a dish')
      const dishSnap = await input.db
        .doc(`apps/${input.appId}/kitchens/${input.kitchenId}/dishes/${dishId}`)
        .get()
      if (!dishSnap.exists) {
        throw new Error(`Menu item references missing dish: ${dishId}`)
      }
    }
  }
  if (!itemCount) throw new Error('Menu needs at least one item')

  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  const publishedMenuData = { ...menuData, status: 'published', updated: stamp }
  const updateMenu = dependencies.updateMenu || serverUpdate
  const ensureRootEntry =
    dependencies.ensureRootEntry || ensureKitchenMenuRootEntry
  const root = await completeKitchenMenuPublication({
    updateScopedMenu: () =>
      updateMenu(
        serverKitchenMenusTarget(input.appId, input.kitchenId),
        input.menuId,
        { status: 'published', updated: stamp }
      ),
    ensureRootEntry: () =>
      ensureRootEntry(input.db, {
        appId: input.appId,
        kitchenId: input.kitchenId,
        kitchenPath: input.kitchenPath,
        menuId: input.menuId,
        menuData: publishedMenuData,
        stamp,
      }),
  })

  return { menuId: input.menuId, root }
}
