import { createError } from 'h3'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import { assertKitchenMenuCanPublish } from './validation'

type PublishKitchenMenuInput = {
  appId: string
  kitchenId: string
  menuId: string
  uid: string
}

export function publishKitchenMenu(input: PublishKitchenMenuInput) {
  return runGuardedServerTransaction({ kind: 'runtime' }, (tx) =>
    stagePublishKitchenMenu(tx, input)
  )
}

export async function stagePublishKitchenMenu(
  tx: GuardedServerTransaction,
  input: PublishKitchenMenuInput
) {
  await requireKitchenWriterAccount(input, input.uid, tx)
  const target = serverKitchenMenusTarget(input.kitchenId)
  const menu = await tx.read(target, input.menuId)
  if (!menu.exists) throw new Error('Menu not found.')
  const menuData = menu.data || {}
  if (menuData.status === 'archived')
    throw createError({
      statusCode: 409,
      statusMessage: 'Restore this Menu to draft before publishing it.',
    })
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
}
