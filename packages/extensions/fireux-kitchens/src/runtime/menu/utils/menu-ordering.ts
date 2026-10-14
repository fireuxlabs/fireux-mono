import { normalizeKitchenOfferings } from '../../kitchen/utils/offering-policy'
import { tableChannelEnabled } from '../../kitchen/utils/table-service'
import type { MenuOrderTypeConfig } from '../models/menu-ordering.model'
import type { MenuOrderingConfig } from '../models/menu-ordering.model'

/** Derived availability for one catalogue; stored Menu data is never an ordering authority. */
export function kitchenMenuOrdering(
  value: unknown,
  menuId: string
): MenuOrderingConfig {
  const order_types = normalizeKitchenOfferings(value)
    .filter(
      (offering) =>
        offering.enabled &&
        offering.menu_ids.includes(menuId) &&
        offering.hours?.windows.length
    )
    .flatMap((offering) =>
      offering.interactions.flatMap((interaction) => {
        if (interaction.type === 'browse' || !interaction.enabled) return []
        const { enabled, ...policy } = interaction
        return [
          {
            ...policy,
            kitchen_offering_id: offering.id,
            kitchen_offering_name: offering.name,
            ...(offering.hours
              ? { offering_hours: { operation_hours: offering.hours } }
              : {}),
          },
        ]
      })
    )
  return { enabled: false, order_types }
}

/** Services supported by the public Website flow, explicitly granted by Kitchen offerings. */
export function publicMenuOrderTypes(ordering: MenuOrderingConfig): MenuOrderTypeConfig[] {
  return ordering.order_types.filter(config =>
    ['collection', 'delivery', 'dine_in'].includes(config.type) &&
    !config.availability?.paused &&
    tableChannelEnabled(config, 'table_qr')
  )
}
