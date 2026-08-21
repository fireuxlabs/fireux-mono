import type { Dish } from '../../../models/dish.model.ts'
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
 * Canonical Dish records keyed by their real selected-Kitchen collection.
 *
 * This is the deterministic file-backed provider input. Consumers must pass
 * these raw records through the same Dish normalizer and collection contract
 * used for Firestore records.
 */
export const kitchenDemoDishRecordsByKitchenId: Readonly<
  Record<string, readonly Dish[]>
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
