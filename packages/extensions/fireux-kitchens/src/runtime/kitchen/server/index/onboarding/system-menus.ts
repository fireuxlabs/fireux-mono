import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from 'fireux-core/runtime/types/firestore-mutations'
import type { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  buildKitchenSystemMenu,
  type KitchenSystemMenuKind,
} from '../../../../menu/utils/kitchen-system-menus.ts'

export function createKitchenSystemMenus(input: {
  mutations: GuardedServerTransaction
  target: FirestoreMutationTarget<string, 'server'>
  kitchenId: string
  menus: Array<{ id: string; exists: boolean }>
  created: ReturnType<typeof serverAuditStamp>
  updated?: ReturnType<typeof serverAuditStamp>
}) {
  for (const menu of input.menus) {
    if (menu.exists) {
      throw new Error('A default Menu exists without its Kitchen.')
    }
    input.mutations.create(
      input.target,
      menu.id,
      buildKitchenSystemMenu({
        kind: menu.id as KitchenSystemMenuKind,
        created: input.created,
        updated: input.updated ?? input.created,
      })
    )
  }
}
