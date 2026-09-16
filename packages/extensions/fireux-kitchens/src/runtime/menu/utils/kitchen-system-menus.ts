import type { KitchenMenu } from '../models/kitchen-menu.model'

export const KitchenSystemMenuKinds = ['food', 'drinks'] as const

export type KitchenSystemMenuKind = (typeof KitchenSystemMenuKinds)[number]

const names: Record<KitchenSystemMenuKind, string> = {
  food: 'Food',
  drinks: 'Drinks',
}

export function buildKitchenSystemMenu<TCreated, TUpdated>(input: {
  kind: KitchenSystemMenuKind
  created: TCreated
  updated: TUpdated
}): Omit<KitchenMenu, 'id' | 'created' | 'updated'> & {
  created: TCreated
  updated: TUpdated
} {
  return {
    name: names[input.kind],
    description: '',
    status: 'draft',
    sort_order: input.kind === 'food' ? 10 : 20,
    ordering: {
      enabled: false,
      order_types: [],
      service_hours: { inherit_kitchen_operation_hours: true },
    },
    created: input.created,
    updated: input.updated,
  }
}
