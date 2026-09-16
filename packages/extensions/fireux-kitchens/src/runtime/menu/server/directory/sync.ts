import type { Firestore } from 'firebase-admin/firestore'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { ensureKitchenMenuRootEntry } from '../draft/root-entry.ts'

export async function syncKitchenMenuDirectory(input: {
  appId: string
  db: Firestore
  kitchenId: string
  menuId: string
  uid: string
}) {
  const menuRef = input.db.doc(
    `kitchens/${input.kitchenId}/menus/${input.menuId}`
  )
  const menu = await menuRef.get()
  if (!menu.exists) throw new Error('Menu not found.')
  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  return ensureKitchenMenuRootEntry(input.db, {
    appId: input.appId,
    kitchenId: input.kitchenId,
    kitchenPath: `kitchens/${input.kitchenId}`,
    menuId: input.menuId,
    menuData: menu.data() || {},
    stamp,
  })
}
