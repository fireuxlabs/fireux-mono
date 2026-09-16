import {
  deanosPartyMenuDemoIdentity,
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
  kitchenDemoMediaUrl(deanosPartyMenuDemoIdentity.kitchenId, `menu/${filename}`)

const deanosPartyRootMenu = rootMenu(
  deanosPartyMenuDemoIdentity,
  'Party Menu',
  'A generous buffet spread of smash burger sliders, crispy sides and drinks, sized for the number of guests.'
)

export const deanosPartyDemoMenu: KitchenDemoMenu = {
  rootMenu: deanosPartyRootMenu,
  kitchenMenu: kitchenMenu(deanosPartyMenuDemoIdentity, deanosPartyRootMenu),
  dishes: dishes(deanosPartyMenuDemoIdentity, [
    {
      id: 'classic-smash-slider-platter',
      name: 'Classic smash slider platter',
      description:
        'Seven mini Deanos smash burgers arranged on one party platter.',
      item_kind: 'food',
      image: deanosAsset('party-classic-smash-slider-platter-7.jpg'),
    },
    {
      id: 'hot-honey-chicken-slider-platter',
      name: 'Hot honey chicken slider platter',
      description:
        'Seven mini hot honey chicken burgers arranged on one party platter.',
      item_kind: 'food',
      image: deanosAsset('party-hot-honey-slider-platter-7.jpg'),
    },
    {
      id: 'cauliflower-slider-platter',
      name: 'Crispy cauliflower slider platter',
      description:
        'Seven mini crispy cauliflower burgers arranged on one party platter.',
      item_kind: 'food',
      image: deanosAsset('party-cauliflower-slider-platter-7.jpg'),
    },
    {
      id: 'party-fries-tray',
      name: 'Skin-on fries sharing tray',
      description: 'A buffet tray of golden skin-on fries with flaky sea salt.',
      item_kind: 'food',
      image: deanosAsset('party-fries-sharing-platter.jpg'),
    },
    {
      id: 'party-onion-ring-platter',
      name: 'Crispy onion ring platter',
      description: 'A buffet platter of onion rings in Deanos crispy batter.',
      item_kind: 'food',
      image: deanosAsset('party-onion-ring-sharing-platter.jpg'),
    },
    {
      id: 'party-lemonade',
      name: 'House lemonade dispenser',
      description:
        'Fresh lemon, mint and sparkling water for the buffet table.',
      item_kind: 'drink',
      image: deanosAsset('party-house-lemonade-dispenser.jpg'),
    },
    {
      id: 'party-strawberry-lime-cooler',
      name: 'Strawberry & lime cooler dispenser',
      description:
        'Sparkling strawberry, lime and basil cooler for the buffet table.',
      item_kind: 'drink',
      image: deanosAsset('party-strawberry-lime-dispenser.jpg'),
    },
    {
      id: 'party-cucumber-mint-cooler',
      name: 'Cucumber & mint cooler dispenser',
      description:
        'A crisp cucumber, mint and lime cooler for the buffet table.',
      item_kind: 'drink',
      image: deanosAsset('party-cucumber-mint-dispenser.jpg'),
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
            {
              label: '1 platter · 7 sliders',
              quantity: 7,
              unit: 'sliders',
              price: 48,
            },
            {
              label: '2 platters · 14 sliders',
              quantity: 14,
              unit: 'sliders',
              price: 92,
            },
            {
              label: '3 platters · 21 sliders',
              quantity: 21,
              unit: 'sliders',
              price: 132,
            },
          ],
          sort_order: 1,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'hot-honey-chicken-slider-platter-item',
          section_id: 'slider-platters',
          dish_id: 'hot-honey-chicken-slider-platter',
          price: 52,
          price_options: [
            {
              label: '1 platter · 7 sliders',
              quantity: 7,
              unit: 'sliders',
              price: 52,
            },
            {
              label: '2 platters · 14 sliders',
              quantity: 14,
              unit: 'sliders',
              price: 100,
            },
            {
              label: '3 platters · 21 sliders',
              quantity: 21,
              unit: 'sliders',
              price: 144,
            },
          ],
          sort_order: 2,
        }),
        menuItem(deanosPartyMenuDemoIdentity, {
          id: 'cauliflower-slider-platter-item',
          section_id: 'slider-platters',
          dish_id: 'cauliflower-slider-platter',
          price: 44,
          price_options: [
            {
              label: '1 platter · 7 sliders',
              quantity: 7,
              unit: 'sliders',
              price: 44,
            },
            {
              label: '2 platters · 14 sliders',
              quantity: 14,
              unit: 'sliders',
              price: 84,
            },
            {
              label: '3 platters · 21 sliders',
              quantity: 21,
              unit: 'sliders',
              price: 120,
            },
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
