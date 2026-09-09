import type { KitchenMenu } from '../models/kitchen-menu.model'

export const KitchenSystemMenuKinds = ['food', 'drinks'] as const

export type KitchenSystemMenuKind = (typeof KitchenSystemMenuKinds)[number]

const names: Record<KitchenSystemMenuKind, string> = {
  food: 'Food',
  drinks: 'Drinks',
}

export function buildKitchenSystemMenu<TCreated, TUpdated>(input: {
  kitchenId: string
  kind: KitchenSystemMenuKind
  created: TCreated
  updated: TUpdated
}): Omit<KitchenMenu, 'created' | 'updated'> & {
  created: TCreated
  updated: TUpdated
} {
  return {
    id: input.kind,
    kitchen_id: input.kitchenId,
    system_kind: input.kind,
    name: names[input.kind],
    description: '',
    status: 'draft',
    sort_order: input.kind === 'food' ? 10 : 20,
    doc_url: '',
    doc_name: '',
    doc_type: '',
    doc_storage_path: '',
    kiosk_skin_id: '',
    ordering: {
      enabled: false,
      order_types: [],
      service_hours: { inherit_kitchen_operation_hours: true },
    },
    choices: [],
    created: input.created,
    updated: input.updated,
  }
}
