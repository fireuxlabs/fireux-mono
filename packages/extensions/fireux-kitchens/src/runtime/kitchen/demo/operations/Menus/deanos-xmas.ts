import {
  deanosXmasMenuDemoIdentity,
  kitchenDemoMediaUrl,
} from '../../core/fixtures'
import type { KitchenDemoMenu } from '../../core/types'
import {
  dishes,
  kitchenMenu,
  menuItem,
  menuSection,
  rootMenu,
} from './builders'

const deanosAsset = (filename: string) =>
  kitchenDemoMediaUrl(deanosXmasMenuDemoIdentity.kitchenId, `menu/${filename}`)

const deanosXmasRootMenu = rootMenu(
  deanosXmasMenuDemoIdentity,
  'Xmas Menu',
  'Christmas burgers stacked with all the trimmings, indulgent festive sides and a winter shake.'
)

export const deanosXmasDemoMenu: KitchenDemoMenu = {
  rootMenu: deanosXmasRootMenu,
  kitchenMenu: kitchenMenu(deanosXmasMenuDemoIdentity, deanosXmasRootMenu),
  dishes: dishes(deanosXmasMenuDemoIdentity, [
    {
      id: 'deanos-christmas-stack',
      name: 'The Deanos Christmas Stack',
      description:
        'Double smashed beef, smoked bacon, fried Camembert, cranberry relish, rocket and mustard mayo.',
      item_kind: 'food',
      image: deanosAsset('xmas-christmas-stack-santa.jpg'),
      price: 22,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'turkey-dinner-burger',
      name: 'The Turkey Dinner Burger',
      description:
        'Roast turkey, sage and onion stuffing, melted Brie, cranberry relish, gravy mayo and a pig in blanket.',
      item_kind: 'food',
      image: deanosAsset('xmas-turkey-dinner-burger-reindeer.jpg'),
      price: 21,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'pigs-in-blankets-waffle-fries',
      name: 'Pigs in blankets waffle fries',
      description:
        'Crispy waffle fries loaded with chopped pigs in blankets, cheese sauce, rich gravy, cranberry relish and crispy onions.',
      item_kind: 'food',
      image: deanosAsset('xmas-pigs-in-blankets-waffle-fries-elf.jpg'),
      price: 15,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'fried-brie-bites',
      name: 'Fried Brie bites',
      description:
        'Golden crumbed Brie bites served with cranberry and chilli dip.',
      item_kind: 'food',
      image: deanosAsset('xmas-fried-brie-bites-snowman.jpg'),
      price: 7,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'stuffed-mini-yorkshires',
      name: 'Stuffed mini Yorkshires',
      description:
        'Mini Yorkshire puddings filled with pulled turkey, sage stuffing, cranberry relish and gravy.',
      item_kind: 'food',
      image: deanosAsset('xmas-stuffed-mini-yorkshires-gingerbread.jpg'),
      price: 8,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'gingerbread-caramel-shake',
      name: 'Gingerbread caramel shake',
      description:
        'Vanilla soft serve, salted caramel, gingerbread spice and biscuit crumb.',
      item_kind: 'drink',
      image: deanosAsset('xmas-gingerbread-caramel-shake-subtle.jpg'),
      price: 9,
      price_options: [],
      add_ons: [],
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
          sort_order: 1,
        }),
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'turkey-dinner-burger-item',
          section_id: 'festive-burgers',
          dish_id: 'turkey-dinner-burger',
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
          sort_order: 1,
        }),
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'fried-brie-bites-item',
          section_id: 'christmas-sides',
          dish_id: 'fried-brie-bites',
          sort_order: 2,
        }),
        menuItem(deanosXmasMenuDemoIdentity, {
          id: 'stuffed-mini-yorkshires-item',
          section_id: 'christmas-sides',
          dish_id: 'stuffed-mini-yorkshires',
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
          sort_order: 1,
        }),
      ],
    },
  ],
}
