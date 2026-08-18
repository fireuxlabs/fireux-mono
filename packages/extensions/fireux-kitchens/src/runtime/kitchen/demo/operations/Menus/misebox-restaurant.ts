import { miseboxRestaurantKitchenDemoIdentity } from '../../core/fixtures'
import type { KitchenDemoMenu } from '../../core/types'
import { kitchenMenu, rootMenu } from './builders'
import { miseboxRestaurantDemoDishes } from './misebox-restaurant-dishes'
import { miseboxRestaurantDemoMenuSections } from './misebox-restaurant-sections'

const miseboxRestaurantRootMenu = rootMenu(
  miseboxRestaurantKitchenDemoIdentity,
  'Misebox Restaurant seasonal menu',
  'A polished seasonal menu from the hearth, garden and bar for guest Browse and Kiosk presentation.'
)

export const miseboxRestaurantKitchenDemoMenu: KitchenDemoMenu = {
  rootMenu: miseboxRestaurantRootMenu,
  kitchenMenu: kitchenMenu(
    miseboxRestaurantKitchenDemoIdentity,
    miseboxRestaurantRootMenu,
    [
      {
        type: 'eat_in',
        fulfilment: {
          handoff_instructions: 'Watch the screen for your tray number.',
        },
      },
      {
        type: 'takeaway',
        fulfilment: {
          handoff_instructions: 'Collect your bag when your number is called.',
        },
      },
    ]
  ),
  dishes: miseboxRestaurantDemoDishes,
  menuSections: miseboxRestaurantDemoMenuSections,
}
