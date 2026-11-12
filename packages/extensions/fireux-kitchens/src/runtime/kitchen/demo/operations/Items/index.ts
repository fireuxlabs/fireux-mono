import type { Item } from '../../../utils/item.ts'
import {
  deanosKitchenDemoIdentity,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from '../../core/fixtures'
import {
  deanosKitchenDemoMenu,
  deanosPartyDemoMenu,
  deanosXmasDemoMenu,
  miseboxRestaurantKitchenDemoMenu,
  pizzaTheActionKitchenDemoMenu,
} from '../Menus'

/**
 * Canonical Item records keyed by their real selected-Kitchen collection.
 *
 * This is the deterministic file-backed provider input. Consumers must pass
 * these raw records through the same Item normalizer and collection contract
 * used for Firestore records.
 */
export const kitchenDemoItemRecordsByKitchenId: Readonly<
  Record<string, readonly Item[]>
> = {
  [deanosKitchenDemoIdentity.kitchenId]: [
    ...deanosKitchenDemoMenu.dishes,
    ...deanosPartyDemoMenu.dishes,
    ...deanosXmasDemoMenu.dishes,
  ],
  [miseboxRestaurantKitchenDemoIdentity.kitchenId]:
    miseboxRestaurantKitchenDemoMenu.dishes,
  [pizzaTheActionKitchenDemoIdentity.kitchenId]:
    pizzaTheActionKitchenDemoMenu.dishes,
}
