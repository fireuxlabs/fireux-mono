import type { Firestore } from 'firebase-admin/firestore'
import { serverUpdate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-update'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { ensureKitchenMenuRootEntry } from '../directory/root-entry.ts'
import { assertKitchenMenuCanPublish } from './validation'

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

export async function publishKitchenMenu(
  input: PublishInput,
  dependencies: PublishDependencies = {}
) {
  const menuRef = input.db.doc(
    `kitchens/${input.kitchenId}/menus/${input.menuId}`
  )
  const menuSnap = await menuRef.get()
  if (!menuSnap.exists) throw new Error('Menu not found.')

  const menuData = menuSnap.data() || {}
  await assertKitchenMenuCanPublish({
    db: input.db,
    kitchenId: input.kitchenId,
    menuRef,
    menuData,
  })

  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  const publishedMenuData = { ...menuData, status: 'published', updated: stamp }
  const updateMenu = dependencies.updateMenu || serverUpdate
  const ensureRootEntry =
    dependencies.ensureRootEntry || ensureKitchenMenuRootEntry
  await updateMenu(serverKitchenMenusTarget(input.kitchenId), input.menuId, {
    status: 'published',
    updated: stamp,
  })
  const root = await ensureRootEntry(input.db, {
    appId: input.appId,
    kitchenId: input.kitchenId,
    kitchenPath: input.kitchenPath,
    menuId: input.menuId,
    menuData: publishedMenuData,
    stamp,
  })

  return { menuId: input.menuId, root }
}
