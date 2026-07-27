import type { KitchenDemoMenuMode } from '../../../../utils/kitchen/demo-menu-cascade'
import {
  deanosKitchenDemoIdentity,
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
} from '../../core/fixtures'

/**
 * Deanos is being operated in summer: the Main Menu drives daily prep,
 * Party work appears only when an order triggers it, and Xmas is off.
 */
export const deanosKitchenDemoMenuModes = {
  [deanosKitchenDemoIdentity.menuId]: 'on',
  [deanosPartyMenuDemoIdentity.menuId]: 'order_led',
  [deanosXmasMenuDemoIdentity.menuId]: 'off',
} as const satisfies Readonly<Record<string, KitchenDemoMenuMode>>
