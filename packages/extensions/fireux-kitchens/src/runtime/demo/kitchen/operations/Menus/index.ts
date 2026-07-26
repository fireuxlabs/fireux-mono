// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: define current-model Dish and Menu fixtures with valid cross-record references.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: give Deanos and Garden Room distinct, reference-complete Menus.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: separate the smash-burger and polished restaurant Menus.
// Concurrent edit — 2026-07-22 15:09 CEST — Misebox Restaurant Menu pass: expand the polished Demo to seven fully pictured sections.
// Concurrent edit — 2026-07-22 15:27 CEST — Demo image review: align each generated photograph with its Dish identity and copy.
// Concurrent edit — 2026-07-22 18:03 CEST — Deanos Menu pass: build a focused four-section fast-food Menu with coherent Dish photography.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add a complete green-and-yellow pizzeria Menu in the shared Demo shape.
import { DishModel, type Dish } from '../../../../models/kitchen/dish.model'
import {
  KitchenMenuModel,
  type KitchenMenu,
  type MenuOrderTypeConfig,
} from '../../../../models/kitchen/menu/kitchen-menu.model'
import {
  MenuItemModel,
  type MenuItem,
} from '../../../../models/kitchen/menu/menu-item.model'
import {
  MenuSectionModel,
  type MenuSection,
} from '../../../../models/kitchen/menu/menu-section.model'
import type { Menu } from '../../../../models/kitchen/menu/menu.model'
import {
  deanosKitchenDemoIdentity,
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
  kitchenDemoAssetBase,
  kitchenDemoCreated,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from '../../core/fixtures'
import type {
  KitchenDemoIdentity,
  KitchenDemoMenu,
  KitchenDemoMenuSection,
} from '../../core/types'

type DishDefinition = Pick<
  Dish,
  'id' | 'name' | 'description' | 'item_kind' | 'image'
> & Partial<Pick<Dish, 'is_deal'>>

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
  is_deal: definition.is_deal ?? false,
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
  'Main Menu',
  'Lace-edged smash burgers, crispy chicken, loaded sides and hand-spun shakes.'
)

const deanosAssetBase = `${kitchenDemoAssetBase}/deanos`

export const deanosKitchenDemoMenu: KitchenDemoMenu = {
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
      description: 'Smashed beef, American cheese, shredded lettuce, pickles and Deanos sauce.',
      item_kind: 'food',
      image: `${deanosAssetBase}/deanos-classic.jpg`,
    },
    {
      id: 'double-trouble',
      name: 'Double Trouble',
      description: 'Two smashed patties, American cheese, caramelised onions, pickles and smoky sauce.',
      item_kind: 'food',
      image: `${deanosAssetBase}/double-trouble.jpg`,
    },
    {
      id: 'swiss-melt',
      name: 'Swiss Melt',
      description: 'Double smashed beef, Swiss cheese, brown mushrooms, onions and peppercorn mayo.',
      item_kind: 'food',
      image: `${deanosAssetBase}/swiss-melt.jpg`,
    },
    {
      id: 'hot-honey-chicken',
      name: 'Hot Honey Chicken',
      description: 'Buttermilk fried chicken, crunchy slaw, pickles, hot honey and chilli mayo.',
      item_kind: 'food',
      image: `${deanosAssetBase}/hot-honey-chicken.jpg`,
    },
    {
      id: 'ranch-chicken',
      name: 'Crispy Ranch Chicken',
      description: 'Fried chicken, lettuce, tomato, pickles and herbed ranch.',
      item_kind: 'food',
      image: `${deanosAssetBase}/ranch-chicken.jpg`,
    },
    {
      id: 'crispy-cauliflower',
      name: 'Crispy Cauliflower',
      description: 'Crispy cauliflower, red cabbage slaw, pickles and smoky vegan mayo.',
      item_kind: 'food',
      image: `${deanosAssetBase}/crispy-cauliflower.jpg`,
    },
    {
      id: 'skin-on-fries',
      name: 'Skin-on fries',
      description: 'Golden skin-on fries with flaky sea salt.',
      item_kind: 'food',
      image: `${deanosAssetBase}/skin-on-fries.jpg`,
    },
    {
      id: 'dirty-deanos-fries',
      name: 'Dirty Deanos fries',
      description: 'Fries loaded with chopped smash beef, cheddar, pickles, spring onion and Deanos sauce.',
      item_kind: 'food',
      image: `${deanosAssetBase}/dirty-deanos-fries.jpg`,
    },
    {
      id: 'onion-rings',
      name: 'Crispy onion rings',
      description: 'A tall stack of onion rings in Deanos crispy batter.',
      item_kind: 'food',
      image: `${deanosAssetBase}/onion-rings.jpg`,
    },
    {
      id: 'salted-caramel-shake',
      name: 'Salted caramel shake',
      description: 'Vanilla soft serve, caramel and flaky sea salt.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/salted-caramel-shake.jpg`,
    },
    {
      id: 'cherry-vanilla-shake',
      name: 'Cherry vanilla shake',
      description: 'Vanilla soft serve blended with dark cherry.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/cherry-vanilla-shake.jpg`,
    },
    {
      id: 'house-lemonade',
      name: 'House lemonade',
      description: 'Fresh lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/house-lemonade.jpg`,
    },
  ]),
  menuSections: [
    {
      section: menuSection(
        deanosKitchenDemoIdentity,
        'smash-burgers',
        'Smash burgers',
        1
      ),
      items: [
        menuItem(deanosKitchenDemoIdentity, {
          id: 'deanos-classic-item',
          section_id: 'smash-burgers',
          dish_id: 'deanos-classic',
          price: 19,
          sort_order: 1,
          price_options: [
            { label: 'Single', quantity: 1, unit: 'burger', price: 16 },
            { label: 'Double', quantity: 1, unit: 'burger', price: 19 },
          ],
          add_ons: [
            { id: 'extra-cheddar', label: 'Extra cheddar', price: 2 },
            { id: 'smoked-bacon', label: 'Smoked bacon', price: 3 },
          ],
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'double-trouble-item',
          section_id: 'smash-burgers',
          dish_id: 'double-trouble',
          price: 24,
          sort_order: 2,
          add_ons: [
            { id: 'jalapenos', label: 'Jalapeños', price: 1.5 },
            { id: 'smoked-bacon', label: 'Smoked bacon', price: 3 },
          ],
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'swiss-melt-item',
          section_id: 'smash-burgers',
          dish_id: 'swiss-melt',
          price: 22,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        deanosKitchenDemoIdentity,
        'chicken-and-plant',
        'Chicken & plant',
        2
      ),
      items: [
        menuItem(deanosKitchenDemoIdentity, {
          id: 'hot-honey-chicken-item',
          section_id: 'chicken-and-plant',
          dish_id: 'hot-honey-chicken',
          price: 20,
          sort_order: 1,
          add_ons: [
            { id: 'extra-hot-honey', label: 'Extra hot honey', price: 1.5 },
            { id: 'smoked-bacon', label: 'Smoked bacon', price: 3 },
          ],
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'ranch-chicken-item',
          section_id: 'chicken-and-plant',
          dish_id: 'ranch-chicken',
          price: 19,
          sort_order: 2,
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'crispy-cauliflower-item',
          section_id: 'chicken-and-plant',
          dish_id: 'crispy-cauliflower',
          price: 18,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        deanosKitchenDemoIdentity,
        'fries-and-sides',
        'Fries & sides',
        3
      ),
      items: [
        menuItem(deanosKitchenDemoIdentity, {
          id: 'skin-on-fries-item',
          section_id: 'fries-and-sides',
          dish_id: 'skin-on-fries',
          price: 6,
          sort_order: 1,
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'dirty-deanos-fries-item',
          section_id: 'fries-and-sides',
          dish_id: 'dirty-deanos-fries',
          price: 13,
          sort_order: 2,
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'onion-rings-item',
          section_id: 'fries-and-sides',
          dish_id: 'onion-rings',
          price: 7,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        deanosKitchenDemoIdentity,
        'shakes-and-drinks',
        'Shakes & drinks',
        4
      ),
      items: [
        menuItem(deanosKitchenDemoIdentity, {
          id: 'salted-caramel-shake-item',
          section_id: 'shakes-and-drinks',
          dish_id: 'salted-caramel-shake',
          price: 8,
          sort_order: 1,
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'cherry-vanilla-shake-item',
          section_id: 'shakes-and-drinks',
          dish_id: 'cherry-vanilla-shake',
          price: 8,
          sort_order: 2,
        }),
        menuItem(deanosKitchenDemoIdentity, {
          id: 'house-lemonade-item',
          section_id: 'shakes-and-drinks',
          dish_id: 'house-lemonade',
          price: 5,
          sort_order: 3,
        }),
      ],
    },
  ],
}

const deanosPartyRootMenu = rootMenu(
  deanosPartyMenuDemoIdentity,
  'Party Menu',
  'A generous buffet spread of smash burger sliders, crispy sides and drinks, sized for the number of guests.'
)

export const deanosPartyDemoMenu: KitchenDemoMenu = {
  rootMenu: deanosPartyRootMenu,
  kitchenMenu: kitchenMenu(
    deanosPartyMenuDemoIdentity,
    deanosPartyRootMenu,
    [
      {
        type: 'eat_in',
        fulfilment: {
          handoff_instructions: 'Watch the screen for your party tray number.',
        },
      },
      {
        type: 'collection',
        asap_enabled: true,
        fulfilment: {
          handoff_instructions: 'Collect your party order from the counter.',
        },
        customer: {
          required_fields: ['name', 'phone'],
        },
      },
    ]
  ),
  dishes: dishes(deanosPartyMenuDemoIdentity, [
    {
      id: 'classic-smash-slider-platter',
      name: 'Classic smash slider platter',
      description: 'Seven mini Deanos smash burgers arranged on one party platter.',
      item_kind: 'food',
      image: `${deanosAssetBase}/party-classic-smash-slider-platter-7.jpg`,
    },
    {
      id: 'hot-honey-chicken-slider-platter',
      name: 'Hot honey chicken slider platter',
      description: 'Seven mini hot honey chicken burgers arranged on one party platter.',
      item_kind: 'food',
      image: `${deanosAssetBase}/party-hot-honey-slider-platter-7.jpg`,
    },
    {
      id: 'cauliflower-slider-platter',
      name: 'Crispy cauliflower slider platter',
      description: 'Seven mini crispy cauliflower burgers arranged on one party platter.',
      item_kind: 'food',
      image: `${deanosAssetBase}/party-cauliflower-slider-platter-7.jpg`,
    },
    {
      id: 'party-fries-tray',
      name: 'Skin-on fries sharing tray',
      description: 'A buffet tray of golden skin-on fries with flaky sea salt.',
      item_kind: 'food',
      image: `${deanosAssetBase}/party-fries-sharing-platter.jpg`,
    },
    {
      id: 'party-onion-ring-platter',
      name: 'Crispy onion ring platter',
      description: 'A buffet platter of onion rings in Deanos crispy batter.',
      item_kind: 'food',
      image: `${deanosAssetBase}/party-onion-ring-sharing-platter.jpg`,
    },
    {
      id: 'party-lemonade',
      name: 'House lemonade dispenser',
      description: 'Fresh lemon, mint and sparkling water for the buffet table.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/party-house-lemonade-dispenser.jpg`,
    },
    {
      id: 'party-strawberry-lime-cooler',
      name: 'Strawberry & lime cooler dispenser',
      description: 'Sparkling strawberry, lime and basil cooler for the buffet table.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/party-strawberry-lime-dispenser.jpg`,
    },
    {
      id: 'party-cucumber-mint-cooler',
      name: 'Cucumber & mint cooler dispenser',
      description: 'A crisp cucumber, mint and lime cooler for the buffet table.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/party-cucumber-mint-dispenser.jpg`,
    },
  ]),
  menuSections: [
    {
      section: menuSection(
        deanosPartyMenuDemoIdentity,
        'slider-platters',
        'Slider spread',
        1
      ),
      items: [
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'classic-smash-slider-platter-item',
          section_id: 'slider-platters',
          dish_id: 'classic-smash-slider-platter',
          price: 48,
          price_options: [
            { label: '1 platter · 7 sliders', quantity: 7, unit: 'sliders', price: 48 },
            { label: '2 platters · 14 sliders', quantity: 14, unit: 'sliders', price: 92 },
            { label: '3 platters · 21 sliders', quantity: 21, unit: 'sliders', price: 132 },
          ],
          sort_order: 1,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'hot-honey-chicken-slider-platter-item',
          section_id: 'slider-platters',
          dish_id: 'hot-honey-chicken-slider-platter',
          price: 52,
          price_options: [
            { label: '1 platter · 7 sliders', quantity: 7, unit: 'sliders', price: 52 },
            { label: '2 platters · 14 sliders', quantity: 14, unit: 'sliders', price: 100 },
            { label: '3 platters · 21 sliders', quantity: 21, unit: 'sliders', price: 144 },
          ],
          sort_order: 2,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'cauliflower-slider-platter-item',
          section_id: 'slider-platters',
          dish_id: 'cauliflower-slider-platter',
          price: 44,
          price_options: [
            { label: '1 platter · 7 sliders', quantity: 7, unit: 'sliders', price: 44 },
            { label: '2 platters · 14 sliders', quantity: 14, unit: 'sliders', price: 84 },
            { label: '3 platters · 21 sliders', quantity: 21, unit: 'sliders', price: 120 },
          ],
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        deanosPartyMenuDemoIdentity,
        'party-sides',
        'Buffet sides',
        2
      ),
      items: [
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'party-fries-tray-item',
          section_id: 'party-sides',
          dish_id: 'party-fries-tray',
          price: 32,
          price_options: [
            { label: '8 people', quantity: 8, unit: 'people', price: 32 },
            { label: '16 people', quantity: 16, unit: 'people', price: 60 },
            { label: '24 people', quantity: 24, unit: 'people', price: 84 },
          ],
          sort_order: 1,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'party-onion-ring-platter-item',
          section_id: 'party-sides',
          dish_id: 'party-onion-ring-platter',
          price: 30,
          price_options: [
            { label: '8 people', quantity: 8, unit: 'people', price: 30 },
            { label: '16 people', quantity: 16, unit: 'people', price: 56 },
            { label: '24 people', quantity: 24, unit: 'people', price: 78 },
          ],
          sort_order: 2,
        }),
      ],
    },
    {
      section: menuSection(
        deanosPartyMenuDemoIdentity,
        'party-drinks',
        'Drinks station',
        3
      ),
      items: [
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'party-lemonade-item',
          section_id: 'party-drinks',
          dish_id: 'party-lemonade',
          price: 28,
          price_options: [
            { label: '8 people', quantity: 8, unit: 'people', price: 28 },
            { label: '16 people', quantity: 16, unit: 'people', price: 52 },
            { label: '24 people', quantity: 24, unit: 'people', price: 72 },
          ],
          sort_order: 1,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'party-strawberry-lime-cooler-item',
          section_id: 'party-drinks',
          dish_id: 'party-strawberry-lime-cooler',
          price: 32,
          price_options: [
            { label: '8 people', quantity: 8, unit: 'people', price: 32 },
            { label: '16 people', quantity: 16, unit: 'people', price: 60 },
            { label: '24 people', quantity: 24, unit: 'people', price: 84 },
          ],
          sort_order: 2,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'party-cucumber-mint-cooler-item',
          section_id: 'party-drinks',
          dish_id: 'party-cucumber-mint-cooler',
          price: 30,
          price_options: [
            { label: '8 people', quantity: 8, unit: 'people', price: 30 },
            { label: '16 people', quantity: 16, unit: 'people', price: 56 },
            { label: '24 people', quantity: 24, unit: 'people', price: 78 },
          ],
          sort_order: 3,
        }),
      ],
    },
  ],
}

const deanosXmasRootMenu = rootMenu(
  deanosXmasMenuDemoIdentity,
  'Xmas Menu',
  'Christmas burgers stacked with all the trimmings, indulgent festive sides and a winter shake.'
)

export const deanosXmasDemoMenu: KitchenDemoMenu = {
  rootMenu: deanosXmasRootMenu,
  kitchenMenu: kitchenMenu(
    deanosXmasMenuDemoIdentity,
    deanosXmasRootMenu,
    [
      {
        type: 'eat_in',
        fulfilment: {
          handoff_instructions: 'Watch the screen for your festive order number.',
        },
      },
      {
        type: 'collection',
        asap_enabled: true,
        fulfilment: {
          handoff_instructions: 'Collect your festive order from the counter.',
        },
        customer: {
          required_fields: ['name', 'phone'],
        },
      },
    ]
  ),
  dishes: dishes(deanosXmasMenuDemoIdentity, [
    {
      id: 'deanos-christmas-stack',
      name: 'The Deanos Christmas Stack',
      description: 'Double smashed beef, smoked bacon, fried Camembert, cranberry relish, rocket and mustard mayo.',
      item_kind: 'food',
      image: `${deanosAssetBase}/xmas-christmas-stack-santa.jpg`,
    },
    {
      id: 'turkey-dinner-burger',
      name: 'The Turkey Dinner Burger',
      description: 'Roast turkey, sage and onion stuffing, melted Brie, cranberry relish, gravy mayo and a pig in blanket.',
      item_kind: 'food',
      image: `${deanosAssetBase}/xmas-turkey-dinner-burger-reindeer.jpg`,
    },
    {
      id: 'pigs-in-blankets-waffle-fries',
      name: 'Pigs in blankets waffle fries',
      description: 'Crispy waffle fries loaded with chopped pigs in blankets, cheese sauce, rich gravy, cranberry relish and crispy onions.',
      item_kind: 'food',
      image: `${deanosAssetBase}/xmas-pigs-in-blankets-waffle-fries-elf.jpg`,
    },
    {
      id: 'fried-brie-bites',
      name: 'Fried Brie bites',
      description: 'Golden crumbed Brie bites served with cranberry and chilli dip.',
      item_kind: 'food',
      image: `${deanosAssetBase}/xmas-fried-brie-bites-snowman.jpg`,
    },
    {
      id: 'stuffed-mini-yorkshires',
      name: 'Stuffed mini Yorkshires',
      description: 'Mini Yorkshire puddings filled with pulled turkey, sage stuffing, cranberry relish and gravy.',
      item_kind: 'food',
      image: `${deanosAssetBase}/xmas-stuffed-mini-yorkshires-gingerbread.jpg`,
    },
    {
      id: 'gingerbread-caramel-shake',
      name: 'Gingerbread caramel shake',
      description: 'Vanilla soft serve, salted caramel, gingerbread spice and biscuit crumb.',
      item_kind: 'drink',
      image: `${deanosAssetBase}/xmas-gingerbread-caramel-shake-subtle.jpg`,
    },
  ]),
  menuSections: [
    {
      section: menuSection(
        deanosXmasMenuDemoIdentity,
        'festive-burgers',
        'Festive burgers',
        1
      ),
      items: [
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'deanos-christmas-stack-item',
          section_id: 'festive-burgers',
          dish_id: 'deanos-christmas-stack',
          price: 22,
          sort_order: 1,
        }),
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'turkey-dinner-burger-item',
          section_id: 'festive-burgers',
          dish_id: 'turkey-dinner-burger',
          price: 21,
          sort_order: 2,
        }),
      ],
    },
    {
      section: menuSection(
        deanosXmasMenuDemoIdentity,
        'christmas-sides',
        'Christmas sides',
        2
      ),
      items: [
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'pigs-in-blankets-waffle-fries-item',
          section_id: 'christmas-sides',
          dish_id: 'pigs-in-blankets-waffle-fries',
          price: 15,
          sort_order: 1,
        }),
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'fried-brie-bites-item',
          section_id: 'christmas-sides',
          dish_id: 'fried-brie-bites',
          price: 7,
          sort_order: 2,
        }),
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'stuffed-mini-yorkshires-item',
          section_id: 'christmas-sides',
          dish_id: 'stuffed-mini-yorkshires',
          price: 8,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        deanosXmasMenuDemoIdentity,
        'winter-shakes',
        'Winter shakes',
        3
      ),
      items: [
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'gingerbread-caramel-shake-item',
          section_id: 'winter-shakes',
          dish_id: 'gingerbread-caramel-shake',
          price: 9,
          sort_order: 1,
        }),
      ],
    },
  ],
}

const pizzaTheActionRootMenu = rootMenu(
  pizzaTheActionKitchenDemoIdentity,
  'Pizza the Action menu',
  'Big-flavour pizzas, crispy sides and bright Italian drinks, made for sharing.'
)

const pizzaTheActionAssetBase = `${kitchenDemoAssetBase}/pizza-the-action`

export const pizzaTheActionKitchenDemoMenu: KitchenDemoMenu = {
  rootMenu: pizzaTheActionRootMenu,
  kitchenMenu: kitchenMenu(
    pizzaTheActionKitchenDemoIdentity,
    pizzaTheActionRootMenu,
    [
      {
        type: 'eat_in',
        fulfilment: {
          handoff_instructions: 'Watch the screen for your table order number.',
        },
      },
      {
        type: 'takeaway',
        fulfilment: {
          handoff_instructions: 'Collect your pizza when your number is called.',
        },
      },
      {
        type: 'collection',
        asap_enabled: true,
        fulfilment: {
          handoff_instructions: 'Collect from the pizza counter.',
        },
        customer: {
          required_fields: ['name', 'phone'],
        },
      },
    ]
  ),
  dishes: dishes(pizzaTheActionKitchenDemoIdentity, [
    {
      id: 'action-margherita',
      name: 'Action Margherita',
      description: 'San Marzano tomato, fior di latte, basil and extra-virgin olive oil.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/action-margherita.jpg`,
    },
    {
      id: 'pepperoni-punch',
      name: 'Pepperoni Punch',
      description: 'Cup-and-char pepperoni, mozzarella, chilli honey and oregano.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/pepperoni-punch.jpg`,
    },
    {
      id: 'prosciutto-rocket',
      name: 'Prosciutto & Rocket',
      description: 'Prosciutto crudo, fior di latte, wild rocket, parmesan and lemon oil.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/prosciutto-rocket.jpg`,
    },
    {
      id: 'green-machine',
      name: 'Green Machine',
      description: 'Courgette, spinach pesto, fior di latte, peas, basil and pecorino.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/green-machine.jpg`,
    },
    {
      id: 'truffle-shroom',
      name: 'Truffle Shroom',
      description: 'Roasted mushrooms, taleggio, mozzarella, thyme and black truffle cream.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/truffle-shroom.jpg`,
    },
    {
      id: 'nduja-burrata',
      name: 'Nduja & Burrata',
      description: 'Spicy nduja, tomato, torn burrata, basil and chilli oil.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/nduja-burrata.jpg`,
    },
    {
      id: 'garlic-knots',
      name: 'Garlic knots',
      description: 'Wood-fired dough knots with roast garlic butter, parsley and parmesan.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/garlic-knots.jpg`,
    },
    {
      id: 'courgette-fritti',
      name: 'Courgette fritti',
      description: 'Crispy courgette ribbons with lemon, sea salt and basil mayo.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/courgette-fritti.jpg`,
    },
    {
      id: 'chopped-italian-salad',
      name: 'Chopped Italian salad',
      description: 'Little gem, tomato, cucumber, olives, peppers, parmesan and oregano dressing.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/chopped-italian-salad.jpg`,
    },
    {
      id: 'pistachio-tiramisu',
      name: 'Pistachio tiramisu',
      description: 'Espresso-soaked sponge, mascarpone and roasted pistachio.',
      item_kind: 'food',
      image: `${pizzaTheActionAssetBase}/pistachio-tiramisu.jpg`,
    },
    {
      id: 'amalfi-lemon-soda',
      name: 'Amalfi lemon soda',
      description: 'Sparkling lemon soda with fresh citrus and mint.',
      item_kind: 'drink',
      image: `${pizzaTheActionAssetBase}/amalfi-lemon-soda.jpg`,
    },
    {
      id: 'blood-orange-spritz',
      name: 'Blood orange spritz',
      description: 'Blood orange, bitter botanicals and sparkling water.',
      item_kind: 'drink',
      image: `${pizzaTheActionAssetBase}/blood-orange-spritz.jpg`,
    },
  ]),
  menuSections: [
    {
      section: menuSection(
        pizzaTheActionKitchenDemoIdentity,
        'pizza-classics',
        'Pizza classics',
        1
      ),
      items: [
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'action-margherita-item',
          section_id: 'pizza-classics',
          dish_id: 'action-margherita',
          price: 18,
          sort_order: 1,
          price_options: [
            { label: '28 cm', quantity: 1, unit: 'pizza', price: 18 },
            { label: '36 cm', quantity: 1, unit: 'pizza', price: 25 },
          ],
          add_ons: [
            { id: 'burrata', label: 'Burrata', price: 5 },
            { id: 'house-chilli-oil', label: 'House chilli oil', price: 1.5 },
          ],
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'pepperoni-punch-item',
          section_id: 'pizza-classics',
          dish_id: 'pepperoni-punch',
          price: 23,
          sort_order: 2,
          add_ons: [
            { id: 'jalapenos', label: 'Jalapeños', price: 1.5 },
            { id: 'extra-hot-honey', label: 'Extra hot honey', price: 2 },
          ],
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'prosciutto-rocket-item',
          section_id: 'pizza-classics',
          dish_id: 'prosciutto-rocket',
          price: 24,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        pizzaTheActionKitchenDemoIdentity,
        'house-pizzas',
        'House pizzas',
        2
      ),
      items: [
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'green-machine-item',
          section_id: 'house-pizzas',
          dish_id: 'green-machine',
          price: 22,
          sort_order: 1,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'truffle-shroom-item',
          section_id: 'house-pizzas',
          dish_id: 'truffle-shroom',
          price: 24,
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'nduja-burrata-item',
          section_id: 'house-pizzas',
          dish_id: 'nduja-burrata',
          price: 25,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        pizzaTheActionKitchenDemoIdentity,
        'sides',
        'Sides',
        3
      ),
      items: [
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'garlic-knots-item',
          section_id: 'sides',
          dish_id: 'garlic-knots',
          price: 8,
          sort_order: 1,
          add_ons: [
            { id: 'marinara-dip', label: 'Warm marinara dip', price: 2 },
          ],
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'courgette-fritti-item',
          section_id: 'sides',
          dish_id: 'courgette-fritti',
          price: 9,
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'chopped-italian-salad-item',
          section_id: 'sides',
          dish_id: 'chopped-italian-salad',
          price: 11,
          sort_order: 3,
        }),
      ],
    },
    {
      section: menuSection(
        pizzaTheActionKitchenDemoIdentity,
        'sweet-and-drinks',
        'Sweet & drinks',
        4
      ),
      items: [
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'pistachio-tiramisu-item',
          section_id: 'sweet-and-drinks',
          dish_id: 'pistachio-tiramisu',
          price: 10,
          sort_order: 1,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'amalfi-lemon-soda-item',
          section_id: 'sweet-and-drinks',
          dish_id: 'amalfi-lemon-soda',
          price: 6,
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'blood-orange-spritz-item',
          section_id: 'sweet-and-drinks',
          dish_id: 'blood-orange-spritz',
          price: 7,
          sort_order: 3,
        }),
      ],
    },
  ],
}

const miseboxRestaurantRootMenu = rootMenu(
  miseboxRestaurantKitchenDemoIdentity,
  'Misebox Restaurant seasonal menu',
  'A polished seasonal menu from the hearth, garden and bar for guest Browse and Kiosk presentation.'
)

const miseboxRestaurantAssetBase =
  `${kitchenDemoAssetBase}/misebox-restaurant`

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
  dishes: dishes(miseboxRestaurantKitchenDemoIdentity, [
    {
      id: 'fire-roasted-margherita',
      name: 'Fire-roasted margherita',
      description: 'San Marzano tomato, fior di latte, basil and extra-virgin olive oil.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/fire-roasted-margherita.jpg`,
    },
    {
      id: 'charred-mushroom-flatbread',
      name: 'Charred mushroom flatbread',
      description: 'Wood-fired flatbread with thyme-roasted mushrooms, taleggio and pickled shallots.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/charred-mushroom-flatbread.jpg`,
    },
    {
      id: 'ember-roasted-chicken',
      name: 'Ember-roasted chicken',
      description: 'Herb-brined chicken roasted over embers with lemon, charred shallots and roasting juices.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/ember-roasted-chicken.jpg`,
    },
    {
      id: 'garden-lunch-deal',
      name: 'Garden lunch deal',
      description: 'A fixed lunch bundle with charred mushroom flatbread, rosemary roast potatoes and an elderflower spritz.',
      item_kind: 'food',
      is_deal: true,
      image: `${miseboxRestaurantAssetBase}/garden-lunch-deal.jpg`,
    },
    {
      id: 'hearth-chicken-deal',
      name: 'Hearth chicken deal',
      description: 'A fixed bundle with ember-roasted chicken, garden slaw and a blood orange soda.',
      item_kind: 'food',
      is_deal: true,
      image: `${miseboxRestaurantAssetBase}/hearth-chicken-deal.jpg`,
    },
    {
      id: 'market-bowl-deal',
      name: 'Market bowl deal',
      description: 'A fixed bundle with green tahini falafel bowl, charred tenderstem broccoli and a cucumber & mint cooler.',
      item_kind: 'food',
      is_deal: true,
      image: `${miseboxRestaurantAssetBase}/market-bowl-deal.jpg`,
    },
    {
      id: 'garden-curry',
      name: 'Garden curry',
      description: 'Roasted seasonal vegetables, coconut curry, fragrant rice and fresh herbs.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/garden-curry.jpg`,
    },
    {
      id: 'roasted-squash-grains',
      name: 'Roasted squash & grains',
      description: 'Ancient grains, maple-roasted squash, feta, pumpkin seeds and green tahini.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/roasted-squash-grains.jpg`,
    },
    {
      id: 'green-tahini-falafel-bowl',
      name: 'Green tahini falafel bowl',
      description: 'Crisp herb falafel, lemon grains, cucumber, pickled cabbage and vivid green tahini.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/green-tahini-falafel-bowl.jpg`,
    },
    {
      id: 'market-garden-salad',
      name: 'Market garden salad',
      description: 'Leaves, charred vegetables, soft herbs, toasted seeds and lemon dressing.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/market-garden-salad.jpg`,
    },
    {
      id: 'herb-roasted-trout',
      name: 'Herb-roasted trout',
      description: 'Roasted trout fillet with crushed potatoes, shaved fennel, greens and lemon butter.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/herb-roasted-trout.jpg`,
    },
    {
      id: 'ember-aubergine',
      name: 'Ember aubergine',
      description: 'Fire-softened aubergine with whipped feta, lentils, pomegranate, mint and almonds.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/ember-aubergine.jpg`,
    },
    {
      id: 'rosemary-roast-potatoes',
      name: 'Rosemary roast potatoes',
      description: 'Crisp oven-roasted potatoes with rosemary, flaky sea salt and lemon zest.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/rosemary-roast-potatoes.jpg`,
    },
    {
      id: 'charred-tenderstem-broccoli',
      name: 'Charred tenderstem broccoli',
      description: 'Tenderstem broccoli with lemon, chilli and toasted almond flakes.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/charred-tenderstem-broccoli.jpg`,
    },
    {
      id: 'warm-garlic-flatbread',
      name: 'Warm garlic flatbread',
      description: 'Wood-fired flatbread brushed with confit garlic butter and parsley.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/warm-garlic-flatbread.jpg`,
    },
    {
      id: 'burnt-basque-cheesecake',
      name: 'Burnt Basque cheesecake',
      description: 'Deeply caramelised cheesecake with a soft centre and seasonal berry compote.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/burnt-basque-cheesecake.jpg`,
    },
    {
      id: 'wood-fired-stone-fruit',
      name: 'Wood-fired stone fruit',
      description: 'Warm stone fruit with vanilla mascarpone, pistachios, basil and honey.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/wood-fired-stone-fruit.jpg`,
    },
    {
      id: 'dark-chocolate-sea-salt-pot',
      name: 'Dark chocolate & sea salt pot',
      description: 'Silky dark chocolate custard with soft cream, sea salt and cocoa nibs.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/dark-chocolate-sea-salt-pot.jpg`,
    },
    {
      id: 'elderflower-spritz',
      name: 'Elderflower spritz',
      description: 'Elderflower, lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: `${miseboxRestaurantAssetBase}/elderflower-spritz.jpg`,
    },
    {
      id: 'blood-orange-soda',
      name: 'Blood orange soda',
      description: 'Blood orange, pink grapefruit and sparkling mineral water.',
      item_kind: 'drink',
      image: `${miseboxRestaurantAssetBase}/blood-orange-soda.jpg`,
    },
    {
      id: 'cucumber-mint-cooler',
      name: 'Cucumber & mint cooler',
      description: 'Pressed cucumber, lime, fresh mint and chilled soda water.',
      item_kind: 'drink',
      image: `${miseboxRestaurantAssetBase}/cucumber-mint-cooler.jpg`,
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
  ] satisfies KitchenDemoMenuSection[],
}
