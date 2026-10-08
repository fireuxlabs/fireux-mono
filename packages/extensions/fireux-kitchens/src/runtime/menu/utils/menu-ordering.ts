import { normalizeKitchenOfferings } from '../../kitchen/utils/offering-policy'
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
  return { enabled: order_types.length > 0, order_types }
}
