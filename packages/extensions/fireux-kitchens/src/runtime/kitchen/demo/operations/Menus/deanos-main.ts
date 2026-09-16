import {
  deanosKitchenDemoIdentity,
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

const deanosRootMenu = rootMenu(
  deanosKitchenDemoIdentity,
  'Main Menu',
  'Lace-edged smash burgers, crispy chicken, loaded sides and hand-spun shakes.'
)

const deanosAsset = (filename: string) =>
  kitchenDemoMediaUrl(deanosKitchenDemoIdentity.kitchenId, `menu/${filename}`)

export const deanosKitchenDemoMenu: KitchenDemoMenu = {
  rootMenu: deanosRootMenu,
  kitchenMenu: kitchenMenu(deanosKitchenDemoIdentity, deanosRootMenu),
  dishes: dishes(deanosKitchenDemoIdentity, [
    {
      id: 'deanos-classic',
      name: 'Deanos Classic',
      description:
        'Smashed beef, American cheese, shredded lettuce, pickles and Deanos sauce.',
      item_kind: 'food',
      image: deanosAsset('deanos-classic.jpg'),
    },
    {
      id: 'double-trouble',
      name: 'Double Trouble',
      description:
        'Two smashed patties, American cheese, caramelised onions, pickles and smoky sauce.',
      item_kind: 'food',
      image: deanosAsset('double-trouble.jpg'),
    },
    {
      id: 'swiss-melt',
      name: 'Swiss Melt',
      description:
        'Double smashed beef, Swiss cheese, brown mushrooms, onions and peppercorn mayo.',
      item_kind: 'food',
      image: deanosAsset('swiss-melt.jpg'),
    },
    {
      id: 'hot-honey-chicken',
      name: 'Hot Honey Chicken',
      description:
        'Buttermilk fried chicken, crunchy slaw, pickles, hot honey and chilli mayo.',
      item_kind: 'food',
      image: deanosAsset('hot-honey-chicken.jpg'),
    },
    {
      id: 'ranch-chicken',
      name: 'Crispy Ranch Chicken',
      description: 'Fried chicken, lettuce, tomato, pickles and herbed ranch.',
      item_kind: 'food',
      image: deanosAsset('ranch-chicken.jpg'),
    },
    {
      id: 'crispy-cauliflower',
      name: 'Crispy Cauliflower',
      description:
        'Crispy cauliflower, red cabbage slaw, pickles and smoky vegan mayo.',
      item_kind: 'food',
      image: deanosAsset('crispy-cauliflower.jpg'),
    },
    {
      id: 'skin-on-fries',
      name: 'Skin-on fries',
      description: 'Golden skin-on fries with flaky sea salt.',
      item_kind: 'food',
      image: deanosAsset('skin-on-fries.jpg'),
    },
    {
      id: 'dirty-deanos-fries',
      name: 'Dirty Deanos fries',
      description:
        'Fries loaded with chopped smash beef, cheddar, pickles, spring onion and Deanos sauce.',
      item_kind: 'food',
      image: deanosAsset('dirty-deanos-fries.jpg'),
    },
    {
      id: 'onion-rings',
      name: 'Crispy onion rings',
      description: 'A tall stack of onion rings in Deanos crispy batter.',
      item_kind: 'food',
      image: deanosAsset('onion-rings.jpg'),
    },
    {
      id: 'salted-caramel-shake',
      name: 'Salted caramel shake',
      description: 'Vanilla soft serve, caramel and flaky sea salt.',
      item_kind: 'drink',
      image: deanosAsset('salted-caramel-shake.jpg'),
    },
    {
      id: 'cherry-vanilla-shake',
      name: 'Cherry vanilla shake',
      description: 'Vanilla soft serve blended with dark cherry.',
      item_kind: 'drink',
      image: deanosAsset('cherry-vanilla-shake.jpg'),
    },
    {
      id: 'house-lemonade',
      name: 'House lemonade',
      description: 'Fresh lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: deanosAsset('house-lemonade.jpg'),
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
          price: 16,
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
