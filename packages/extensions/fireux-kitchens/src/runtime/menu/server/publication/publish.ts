import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import { assertKitchenMenuCanPublish } from './validation'

export async function publishKitchenMenu(input: {
  appId: string
  kitchenId: string
  menuId: string
  uid: string
}) {
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenWriterAccount(input, input.uid, tx)
    const target = serverKitchenMenusTarget(input.kitchenId)
    const menu = await tx.read(target, input.menuId)
    if (!menu.exists) throw new Error('Menu not found.')
    const menuData = menu.data || {}
    await assertKitchenMenuCanPublish(tx, { ...input, menuData })
    const stamp =
      menuData.status === 'published' && menuData.updated
        ? menuData.updated
        : serverAuditStamp({ by: input.uid, appId: input.appId })
    if (menuData.status !== 'published')
      tx.update(target, input.menuId, {
        status: 'published',
        updated: stamp,
      })
    return { menuId: input.menuId }
  })
}
