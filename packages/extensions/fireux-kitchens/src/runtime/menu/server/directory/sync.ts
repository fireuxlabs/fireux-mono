import type { Firestore } from 'firebase-admin/firestore'
import { serverUpdate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-update'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { ensureKitchenMenuRootEntry } from '../draft/root-entry.ts'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export async function syncKitchenMenuDirectory(input: {
  appId: string
  db: Firestore
  kitchenId: string
  menuId: string
  previousMenuId?: string
  uid: string
}) {
  const menuRef = input.db.doc(
    `kitchens/${input.kitchenId}/menus/${input.menuId}`
  )
  const menu = await menuRef.get()
  if (!menu.exists) throw new Error('Menu not found.')
  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  const previousMenuId = text(input.previousMenuId)
  if (previousMenuId && previousMenuId !== input.menuId) {
    const roots = await input.db
      .collection('menus')
      .where('source.kitchen_id', '==', input.kitchenId)
      .get()
    const previous = roots.docs.find((document) => {
      const source = record(document.get('source'))
      return (
        text(source.app_id) === input.appId &&
        text(source.menu_id) === previousMenuId
      )
    })
    if (previous) {
      await serverUpdate(FIRESTORE_MUTATION_TARGETS.menus, previous.id, {
        source: {
          ...record(previous.get('source')),
          menu_id: input.menuId,
        },
        updated: stamp,
      })
    }
  }
  return ensureKitchenMenuRootEntry(input.db, {
    appId: input.appId,
    kitchenId: input.kitchenId,
    kitchenPath: `kitchens/${input.kitchenId}`,
    menuId: input.menuId,
    menuData: menu.data() || {},
    stamp,
  })
}
