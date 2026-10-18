import type { KitchenOrderType } from '../models/offering-interaction-types.model'
import type { KitchenOffering } from '../models/offering.model'
import { tableServiceChannel, tableChannelEnabled } from './table-service'

/** Operator-facing choices over the existing named Kitchen offerings. */
export const kitchenOfferingOptions = [
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
    label: 'QR table ordering',
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
export type KitchenOfferingOption = (typeof kitchenOfferingOptions)[number]
export type KitchenOfferingOptionKey = KitchenOfferingOption['key']

export function offeringsForOption(
  offerings: KitchenOffering[],
  option: KitchenOfferingOption
) {
  return offerings.filter((offering) =>
    offering.interactions.some((interaction) =>
      (option.types as readonly string[]).includes(interaction.type)
    )
  )
}
export function offeringOptionEnabled(
  offering: KitchenOffering,
  option: KitchenOfferingOption
) {
  return (
    offering.enabled &&
    offering.interactions.some(
      (interaction) =>
        (option.types as readonly string[]).includes(interaction.type) &&
        interaction.enabled &&
        (interaction.type === 'browse' ||
          !tableServiceChannel(option.key) ||
          tableChannelEnabled(interaction, tableServiceChannel(option.key)!))
    )
  )
}

/** Status of this service within one overview group; never a group-wide switch. */
export function offeringOptionStatus(
  offering: KitchenOffering,
  option: KitchenOfferingOption
) {
  if (!offeringOptionEnabled(offering, option)) return 'Off'
  const active = offering.interactions.filter(
    (row) =>
      (option.types as readonly string[]).includes(row.type) && row.enabled
  )
  return active.length &&
    active.every((row) => row.type !== 'browse' && row.availability?.paused)
    ? 'Paused'
    : 'On'
}

/** Misebox supplies the fixed service types; saved records configure each one. */
export function serviceOptionStatus(
  offerings: KitchenOffering[],
  option: KitchenOfferingOption
) {
  const statuses = offerings.map((row) => offeringOptionStatus(row, option))
  return statuses.includes('On')
    ? 'Enabled'
    : statuses.includes('Paused')
      ? 'Paused'
      : 'Not enabled'
}
