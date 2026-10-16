import { randomUUID } from 'node:crypto'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from 'fireux-core/runtime/types/firestore-mutations'
import type { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  buildKitchenSystemMenu,
  KitchenSystemMenuKinds,
} from '../../../../menu/utils/kitchen-system-menus.ts'

export function createKitchenSystemMenus(input: {
  mutations: GuardedServerTransaction
  target: FirestoreMutationTarget<string, 'server'>
  kitchenId: string
  menus: Array<{ id: string }>
  created: ReturnType<typeof serverAuditStamp>
  updated?: ReturnType<typeof serverAuditStamp>
}) {
  if (input.menus.length) throw new Error('A Menu exists without its Kitchen.')
  for (const kind of KitchenSystemMenuKinds) {
    input.mutations.create(
      input.target,
      randomUUID(),
      buildKitchenSystemMenu({
        kind,
        created: input.created,
        updated: input.updated ?? input.created,
      })
    )
  }
}

/** Management initialization preserves every existing Menu, including archived defaults. */
export async function readKitchenManagementMenus(
  mutations: GuardedServerTransaction,
  target: FirestoreMutationTarget<string, 'server'>
) {
  const records: Array<{ id: string; data: Record<string, unknown> }> = []
  let afterId: string | undefined
  while (true) {
    const page = await mutations.readAll(target, 1000, afterId)
    records.push(...page)
    if (page.length < 1000) return records
    afterId = page.at(-1)!.id
  }
}
