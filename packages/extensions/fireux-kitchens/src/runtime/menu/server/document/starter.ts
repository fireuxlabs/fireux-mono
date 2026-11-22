import { randomUUID } from 'node:crypto'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from 'fireux-core/runtime/types/firestore-mutations'
import type { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import type { Menu } from '../../models/menu.model'
import { starterMenu } from '../../content/starter-menu'

export const KitchenSystemMenuKinds = [starterMenu.slug] as const

export type KitchenSystemMenuKind = (typeof KitchenSystemMenuKinds)[number]

const names: Record<KitchenSystemMenuKind, string> = {
  main: starterMenu.name,
}

export function buildKitchenSystemMenu<TCreated, TUpdated>(input: {
  kind: KitchenSystemMenuKind
  created: TCreated
  updated: TUpdated
}): Omit<Menu, 'id' | 'created' | 'updated'> & {
  created: TCreated
  updated: TUpdated
} {
  return {
    slug: input.kind,
    name: names[input.kind],
    description: '',
    status: 'draft',
    format: 'interactive',
    sort_order: 10,
    created: input.created,
    updated: input.updated,
  }
}

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
