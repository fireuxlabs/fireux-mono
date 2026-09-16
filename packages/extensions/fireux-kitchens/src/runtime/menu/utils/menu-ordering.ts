import { readKitchenOrdering } from '../../kitchen/utils/kitchen-ordering'
import type { MenuOrderingConfig } from '../models/menu-ordering.model'

/** Derived availability for one catalogue; stored Menu data is never an ordering authority. */
export function kitchenMenuOrdering(
  value: unknown,
  menuId: string
): MenuOrderingConfig {
  const order_types = readKitchenOrdering(value)
    .services.filter(
      (service) => service.enabled && service.menu_ids.includes(menuId)
    )
    .map(({ enabled, menu_ids, ...policy }) => policy)
  return { enabled: order_types.length > 0, order_types }
}
