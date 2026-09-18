import { readKitchenServices } from '../../kitchen/utils/kitchen-services'
import type { MenuOrderingConfig } from '../models/menu-ordering.model'

/** Derived availability for one catalogue; stored Menu data is never an ordering authority. */
export function kitchenMenuOrdering(
  value: unknown,
  menuId: string
): MenuOrderingConfig {
  const order_types = readKitchenServices(value)
    .filter(
      (service) =>
        service.enabled &&
        service.menu_ids.includes(menuId) &&
        service.hours?.windows.length
    )
    .flatMap((service) =>
      service.interactions.flatMap((interaction) => {
        if (interaction.type === 'browse' || !interaction.enabled) return []
        const { enabled, ...policy } = interaction
        return [
          {
            ...policy,
            kitchen_service_id: service.id,
            kitchen_service_name: service.name,
            ...(service.hours
              ? { service_hours: { operation_hours: service.hours } }
              : {}),
          },
        ]
      })
    )
  return { enabled: order_types.length > 0, order_types }
}
