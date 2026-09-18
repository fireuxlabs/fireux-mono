import type { KitchenOrderType } from '../models/order-lifecycle.model'
import type { KitchenService } from '../models/service.model'
import { tableServiceChannel, tableChannelEnabled } from './table-service'

/** Operator-facing choices over the existing named Kitchen services. */
export const kitchenServiceOptions = [
  {
    key: 'collection',
    label: 'Collection',
    icon: 'i-lucide-shopping-bag',
    description: 'Customers order online and collect from your venue.',
    types: ['collection'],
  },
  {
    key: 'delivery',
    label: 'Delivery',
    icon: 'i-lucide-truck',
    description: 'Customers order for delivery to an eligible address.',
    types: ['delivery'],
  },
  {
    key: 'pre_order',
    label: 'Pre-order',
    icon: 'i-lucide-calendar-clock',
    description: 'Guests request a meal in advance.',
    types: ['pre_order'],
  },
  {
    key: 'table_service',
    label: 'Table service',
    icon: 'i-lucide-hand-platter',
    description: 'Staff take orders for guests seated at a table.',
    types: ['dine_in'],
  },
  {
    key: 'qr_tables',
    label: 'QR Tables',
    icon: 'i-lucide-qr-code',
    description: 'Guests scan a table code and place their own orders.',
    types: ['dine_in'],
  },
  {
    key: 'counter',
    label: 'Kiosk',
    icon: 'i-lucide-tablet',
    description: 'Order on a venue device, to eat in or take away.',
    types: ['eat_in', 'takeaway'],
  },
] as const satisfies ReadonlyArray<{
  key: string
  label: string
  icon: string
  description: string
  types: readonly KitchenOrderType[]
}>
export type KitchenServiceOption = (typeof kitchenServiceOptions)[number]
export type KitchenServiceOptionKey = KitchenServiceOption['key']

export function servicesForOption(
  services: KitchenService[],
  option: KitchenServiceOption
) {
  return services.filter((service) =>
    service.interactions.some((interaction) =>
      (option.types as readonly string[]).includes(interaction.type)
    )
  )
}
export function serviceOptionEnabled(
  service: KitchenService,
  option: KitchenServiceOption
) {
  return (
    service.enabled &&
    service.interactions.some(
      (interaction) =>
        (option.types as readonly string[]).includes(interaction.type) &&
        interaction.enabled &&
        (interaction.type === 'browse' ||
          !tableServiceChannel(option.key) ||
          tableChannelEnabled(interaction, tableServiceChannel(option.key)!))
    )
  )
}
