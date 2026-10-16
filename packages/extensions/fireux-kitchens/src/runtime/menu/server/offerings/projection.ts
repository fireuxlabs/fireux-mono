import { kitchenMenuOrdering } from '../../utils/menu-ordering'
import type { MenuOrderingConfig } from '../../models/menu-ordering.model'

/** Derive service eligibility and serving times without loading payment or delivery policy. */
export function readKitchenMenuOrdering(
  kitchenOfferings: unknown,
  menuId: string
): MenuOrderingConfig {
  return kitchenMenuOrdering(kitchenOfferings, menuId)
}

export function isMenuOrderingEnabled(_ordering: MenuOrderingConfig) {
  return false
}
