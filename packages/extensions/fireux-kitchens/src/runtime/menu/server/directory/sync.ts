import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import { ensureKitchenMenuRootEntry } from './root-entry'

export async function syncKitchenMenuDirectory(input: {
  appId: string
  kitchenId: string
  menuId: string
  uid: string
}) {
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenWriterAccount(input, input.uid, tx)
    const menu = await tx.read(
      serverKitchenMenusTarget(input.kitchenId),
      input.menuId
    )
    if (!menu.exists) throw new Error('Menu not found.')
    return ensureKitchenMenuRootEntry(tx, {
      ...input,
      menuData: menu.data || {},
      stamp: serverAuditStamp({ by: input.uid, appId: input.appId }),
    })
  })
}
