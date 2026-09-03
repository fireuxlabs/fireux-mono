import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from 'fireux-core/runtime/types/firestore-mutations'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import {
  buildKitchenSystemMenu,
  type KitchenSystemMenuKind,
} from '../../../../menu/utils/kitchen-system-menus.ts'

export function createKitchenSystemMenus(input: {
  mutations: GuardedServerTransaction
  target: FirestoreMutationTarget<string, 'server'>
  kitchenId: string
  menus: Array<{ id: string; exists: boolean }>
  created: FireuxStamped['created']
  updated: FireuxStamped['updated']
}) {
  for (const menu of input.menus) {
    if (menu.exists) {
      throw new Error('A default Menu exists without its Kitchen.')
    }
    input.mutations.create(
      input.target,
      menu.id,
      buildKitchenSystemMenu({
        kitchenId: input.kitchenId,
        kind: menu.id as KitchenSystemMenuKind,
        created: input.created,
        updated: input.updated,
      })
    )
  }
}
