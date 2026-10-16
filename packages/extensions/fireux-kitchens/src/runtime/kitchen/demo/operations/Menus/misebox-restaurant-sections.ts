import { miseboxRestaurantKitchenDemoIdentity } from '../../core/fixtures'
import type { KitchenDemoMenuSection } from '../../core/types'
import { menuItem, menuSection } from './builders'

export const miseboxRestaurantDemoMenuSections = [
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'from-the-oven',
      'From the oven',
      1
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'margherita-item',
        section_id: 'from-the-oven',
        dish_id: 'fire-roasted-margherita',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'charred-mushroom-flatbread-item',
        section_id: 'from-the-oven',
        dish_id: 'charred-mushroom-flatbread',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'ember-roasted-chicken-item',
        section_id: 'from-the-oven',
        dish_id: 'ember-roasted-chicken',
        sort_order: 3,
      }),
    ],
  },
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'meal-deals',
      'Meal deals',
      2
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'garden-lunch-deal-item',
        section_id: 'meal-deals',
        dish_id: 'garden-lunch-deal',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'hearth-chicken-deal-item',
        section_id: 'meal-deals',
        dish_id: 'hearth-chicken-deal',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'market-bowl-deal-item',
        section_id: 'meal-deals',
        dish_id: 'market-bowl-deal',
        sort_order: 3,
      }),
    ],
  },
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'bowls',
      'Bowls',
      3
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'garden-curry-item',
        section_id: 'bowls',
        dish_id: 'garden-curry',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'roasted-squash-grains-item',
        section_id: 'bowls',
        dish_id: 'roasted-squash-grains',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'green-tahini-falafel-bowl-item',
        section_id: 'bowls',
        dish_id: 'green-tahini-falafel-bowl',
        sort_order: 3,
      }),
    ],
  },
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'plates',
      'Plates',
      4
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'market-garden-salad-item',
        section_id: 'plates',
        dish_id: 'market-garden-salad',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'herb-roasted-trout-item',
        section_id: 'plates',
        dish_id: 'herb-roasted-trout',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'ember-aubergine-item',
        section_id: 'plates',
        dish_id: 'ember-aubergine',
        sort_order: 3,
      }),
    ],
  },
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'sides',
      'Sides',
      5
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'rosemary-roast-potatoes-item',
        section_id: 'sides',
        dish_id: 'rosemary-roast-potatoes',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'charred-tenderstem-broccoli-item',
        section_id: 'sides',
        dish_id: 'charred-tenderstem-broccoli',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'warm-garlic-flatbread-item',
        section_id: 'sides',
        dish_id: 'warm-garlic-flatbread',
        sort_order: 3,
      }),
    ],
  },
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'desserts',
      'Desserts',
      6
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'burnt-basque-cheesecake-item',
        section_id: 'desserts',
        dish_id: 'burnt-basque-cheesecake',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'wood-fired-stone-fruit-item',
        section_id: 'desserts',
        dish_id: 'wood-fired-stone-fruit',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'dark-chocolate-sea-salt-pot-item',
        section_id: 'desserts',
        dish_id: 'dark-chocolate-sea-salt-pot',
        sort_order: 3,
      }),
    ],
  },
  {
    section: menuSection(
      miseboxRestaurantKitchenDemoIdentity,
      'drinks',
      'Drinks',
      7
    ),
    items: [
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'elderflower-spritz-item',
        section_id: 'drinks',
        dish_id: 'elderflower-spritz',
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'blood-orange-soda-item',
        section_id: 'drinks',
        dish_id: 'blood-orange-soda',
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'cucumber-mint-cooler-item',
        section_id: 'drinks',
        dish_id: 'cucumber-mint-cooler',
        sort_order: 3,
      }),
    ],
  },
] satisfies KitchenDemoMenuSection[]
