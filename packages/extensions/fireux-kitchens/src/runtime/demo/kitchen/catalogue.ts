// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: define a current-model Dish and Menu catalogue with valid cross-record references.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: give Deanos and Garden Room distinct, reference-complete catalogues.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: separate the smash-burger and polished restaurant catalogues.
import { DishModel, type Dish } from '../../models/kitchen/dish.model'
import {
  KitchenMenuModel,
  type KitchenMenu,
  type MenuOrderTypeConfig,
} from '../../models/kitchen/menu/kitchen-menu.model'
import {
  MenuItemModel,
  type MenuItem,
} from '../../models/kitchen/menu/menu-item.model'
import {
  MenuSectionModel,
  type MenuSection,
} from '../../models/kitchen/menu/menu-section.model'
import type { Menu } from '../../models/kitchen/menu/menu.model'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoAssetBase,
  kitchenDemoCreated,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
} from './fixtures'
import type {
  KitchenDemoCatalogue,
  KitchenDemoIdentity,
  KitchenDemoMenuSection,
} from './types'

type DishDefinition = Pick<
  Dish,
  'id' | 'name' | 'description' | 'item_kind' | 'image'
>

type MenuItemInput = Pick<
  MenuItem,
  'id' | 'section_id' | 'dish_id' | 'price' | 'sort_order'
> & Partial<Pick<MenuItem, 'price_options' | 'add_ons'>>

const dishes = (
  identity: KitchenDemoIdentity,
  definitions: DishDefinition[]
): Dish[] => definitions.map((definition) => ({
  ...DishModel,
  ...definition,
  slug: definition.id,
  is_deal: false,
  kitchen_id: identity.kitchenId,
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
}))

const rootMenu = (
  identity: KitchenDemoIdentity,
  name: string,
  description: string
): Menu => ({
  id: identity.menuId,
  kind: 'menu',
  name,
  description,
  status: 'published',
  source: {
    app_id: identity.appId,
    kitchen_id: identity.kitchenId,
    menu_id: identity.menuId,
  },
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

const kitchenMenu = (
  identity: KitchenDemoIdentity,
  menu: Menu,
  orderTypes: MenuOrderTypeConfig[]
): KitchenMenu => ({
  ...KitchenMenuModel,
  id: identity.menuId,
  kitchen_id: identity.kitchenId,
  name: menu.name,
  description: menu.description || '',
  status: 'published',
  ordering: {
    enabled: orderTypes.length > 0,
    order_types: orderTypes,
    service_hours: {
      inherit_kitchen_operation_hours: true,
    },
  },
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

const menuSection = (
  identity: KitchenDemoIdentity,
  id: string,
  label: string,
  sortOrder: number
): MenuSection => ({
  ...MenuSectionModel,
  id,
  kitchen_id: identity.kitchenId,
  menu_id: identity.menuId,
  label,
  sort_order: sortOrder,
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

const menuItem = (
  identity: KitchenDemoIdentity,
  input: MenuItemInput
): MenuItem => ({
  ...MenuItemModel,
  ...input,
  kitchen_id: identity.kitchenId,
  menu_id: identity.menuId,
  price_options: input.price_options || [],
  add_ons: input.add_ons || [],
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

const deanosRootMenu = rootMenu(
  deanosKitchenDemoIdentity,
  'Deanos Smash Burger menu',
  'Smash burgers, fries and drinks for a fast neighbourhood service.'
)

export const deanosKitchenDemoCatalogue: KitchenDemoCatalogue = {
  rootMenu: deanosRootMenu,
  kitchenMenu: kitchenMenu(deanosKitchenDemoIdentity, deanosRootMenu, [
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
    {
      type: 'collection',
      asap_enabled: true,
      fulfilment: {
        handoff_instructions: 'Collect from the counter.',
      },
      customer: {
        required_fields: ['name', 'phone'],
      },
    },
  ]),
  dishes: dishes(deanosKitchenDemoIdentity, [
    {
      id: 'deanos-classic',
      name: 'Deanos Classic',
      description: 'Beef patty, cheddar, lettuce, pickles and house sauce.',
      item_kind: 'food',
      image: '',
    },
    {
      id: 'crispy-chicken-burger',
      name: 'Crispy chicken burger',
      description: 'Buttermilk chicken, slaw, pickles and hot honey mayo.',
      item_kind: 'food',
      image: '',
    },
    {
      id: 'skin-on-fries',
      name: 'Skin-on fries',
      description: 'Crisp fries with sea salt.',
      item_kind: 'food',
      image: '',
    },
    {
      id: 'house-lemonade',
      name: 'House lemonade',
      description: 'Fresh lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: '',
    },
  ]),
  menuSections: [
    {
      section: menuSection(deanosKitchenDemoIdentity, 'burgers', 'Burgers', 1),
      items: [
        menuItem(deanosKitchenDemoIdentity, {
          id: 'deanos-classic-item',
          section_id: 'burgers',
          dish_id: 'deanos-classic',
          price: 19,
          sort_order: 1,
          add_ons: [
            { id: 'extra-cheddar', label: 'Extra cheddar', price: 2 },
            { id: 'smoked-bacon', label: 'Smoked bacon', price: 3 },
          ],
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'crispy-chicken-item',
          section_id: 'burgers',
          dish_id: 'crispy-chicken-burger',
          price: 20,
          sort_order: 2,
        }),
      ],
    },
    {
      section: menuSection(
        deanosKitchenDemoIdentity,
        'sides-and-drinks',
        'Sides & drinks',
        2
      ),
      items: [
        menuItem(deanosKitchenDemoIdentity, {
          id: 'skin-on-fries-item',
          section_id: 'sides-and-drinks',
          dish_id: 'skin-on-fries',
          price: 6,
          sort_order: 1,
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'house-lemonade-item',
          section_id: 'sides-and-drinks',
          dish_id: 'house-lemonade',
          price: 5,
          sort_order: 2,
        }),
      ],
    },
  ],
}

const miseboxRestaurantRootMenu = rootMenu(
  miseboxRestaurantKitchenDemoIdentity,
  'Misebox Restaurant seasonal menu',
  'A polished, partially photographed menu for guest Browse and Kiosk presentation.'
)

export const miseboxRestaurantKitchenDemoCatalogue: KitchenDemoCatalogue = {
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
  dishes: dishes(miseboxRestaurantKitchenDemoIdentity, [
    {
      id: 'fire-roasted-margherita',
      name: 'Fire-roasted margherita',
      description: 'San Marzano tomato, fior di latte, basil and extra-virgin olive oil.',
      item_kind: 'food',
      image: `${kitchenDemoAssetBase}/margherita.jpg`,
    },
    {
      id: 'garden-curry',
      name: 'Garden curry',
      description: 'Roasted seasonal vegetables, coconut curry, fragrant rice and fresh herbs.',
      item_kind: 'food',
      image: `${kitchenDemoAssetBase}/garden-curry.jpg`,
    },
    {
      id: 'market-garden-salad',
      name: 'Market garden salad',
      description: 'Leaves, charred vegetables, soft herbs, toasted seeds and lemon dressing.',
      item_kind: 'food',
      image: `${kitchenDemoAssetBase}/market-garden-salad.jpg`,
    },
    {
      id: 'roasted-squash-grains',
      name: 'Roasted squash & grains',
      description: 'Ancient grains, maple-roasted squash, feta, pumpkin seeds and green tahini.',
      item_kind: 'food',
      image: '',
    },
    {
      id: 'elderflower-spritz',
      name: 'Elderflower spritz',
      description: 'Elderflower, lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: '',
    },
  ]),
  menuSections: [
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
      ],
    },
    {
      section: menuSection(
        miseboxRestaurantKitchenDemoIdentity,
        'bowls-and-plates',
        'Bowls & plates',
        2
      ),
      items: [
        menuItem(miseboxRestaurantKitchenDemoIdentity, {
          id: 'garden-curry-item',
          section_id: 'bowls-and-plates',
          dish_id: 'garden-curry',
          price: 22,
          sort_order: 1,
          add_ons: [{ id: 'crispy-tofu', label: 'Crispy tofu', price: 4 }],
        }),
        menuItem(miseboxRestaurantKitchenDemoIdentity, {
          id: 'market-garden-salad-item',
          section_id: 'bowls-and-plates',
          dish_id: 'market-garden-salad',
          price: 17,
          sort_order: 2,
        }),
        menuItem(miseboxRestaurantKitchenDemoIdentity, {
          id: 'roasted-squash-grains-item',
          section_id: 'bowls-and-plates',
          dish_id: 'roasted-squash-grains',
          price: 21,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        miseboxRestaurantKitchenDemoIdentity,
        'drinks',
        'Drinks',
        3
      ),
      items: [
        menuItem(miseboxRestaurantKitchenDemoIdentity, {
          id: 'elderflower-spritz-item',
          section_id: 'drinks',
          dish_id: 'elderflower-spritz',
          price: 7,
          sort_order: 1,
        }),
      ],
    },
  ] satisfies KitchenDemoMenuSection[],
}
