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
        price: 18,
        sort_order: 1,
        price_options: [
          { label: 'Regular', quantity: 1, unit: 'pizza', price: 18 },
          { label: 'Large', quantity: 1, unit: 'pizza', price: 24 },
        ],
        add_ons: [
          { id: 'chilli-oil', label: 'House chilli oil', price: 1.5 },
          { id: 'buffalo-mozzarella', label: 'Buffalo mozzarella', price: 4 },
        ],
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'charred-mushroom-flatbread-item',
        section_id: 'from-the-oven',
        dish_id: 'charred-mushroom-flatbread',
        price: 23,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'ember-roasted-chicken-item',
        section_id: 'from-the-oven',
        dish_id: 'ember-roasted-chicken',
        price: 29,
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
        price: 31,
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'hearth-chicken-deal-item',
        section_id: 'meal-deals',
        dish_id: 'hearth-chicken-deal',
        price: 39,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'market-bowl-deal-item',
        section_id: 'meal-deals',
        dish_id: 'market-bowl-deal',
        price: 34,
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
        price: 22,
        sort_order: 1,
        add_ons: [{ id: 'crispy-tofu', label: 'Crispy tofu', price: 4 }],
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'roasted-squash-grains-item',
        section_id: 'bowls',
        dish_id: 'roasted-squash-grains',
        price: 21,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'green-tahini-falafel-bowl-item',
        section_id: 'bowls',
        dish_id: 'green-tahini-falafel-bowl',
        price: 23,
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
        price: 17,
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'herb-roasted-trout-item',
        section_id: 'plates',
        dish_id: 'herb-roasted-trout',
        price: 28,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'ember-aubergine-item',
        section_id: 'plates',
        dish_id: 'ember-aubergine',
        price: 24,
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
        price: 8,
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'charred-tenderstem-broccoli-item',
        section_id: 'sides',
        dish_id: 'charred-tenderstem-broccoli',
        price: 9,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'warm-garlic-flatbread-item',
        section_id: 'sides',
        dish_id: 'warm-garlic-flatbread',
        price: 7,
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
        price: 11,
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'wood-fired-stone-fruit-item',
        section_id: 'desserts',
        dish_id: 'wood-fired-stone-fruit',
        price: 12,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'dark-chocolate-sea-salt-pot-item',
        section_id: 'desserts',
        dish_id: 'dark-chocolate-sea-salt-pot',
        price: 10,
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
        price: 7,
        sort_order: 1,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'blood-orange-soda-item',
        section_id: 'drinks',
        dish_id: 'blood-orange-soda',
        price: 7,
        sort_order: 2,
      }),
      menuItem(miseboxRestaurantKitchenDemoIdentity, {
        id: 'cucumber-mint-cooler-item',
        section_id: 'drinks',
        dish_id: 'cucumber-mint-cooler',
        price: 7,
        sort_order: 3,
      }),
    ],
  },
] satisfies KitchenDemoMenuSection[]
