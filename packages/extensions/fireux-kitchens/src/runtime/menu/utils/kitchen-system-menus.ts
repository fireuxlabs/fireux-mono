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
    slug: input.kind,
    name: names[input.kind],
    description: '',
    status: 'draft',
    sort_order: input.kind === 'food' ? 10 : 20,
    created: input.created,
    updated: input.updated,
  }
}
