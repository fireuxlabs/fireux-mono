import {
  pizzaTheActionKitchenDemoIdentity,
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

const pizzaTheActionRootMenu = rootMenu(
  pizzaTheActionKitchenDemoIdentity,
  'Pizza the Action menu',
  'Big-flavour pizzas, crispy sides and bright Italian drinks, made for sharing.'
)

const pizzaTheActionAsset = (filename: string) =>
  kitchenDemoMediaUrl(
    pizzaTheActionKitchenDemoIdentity.kitchenId,
    `menu/${filename}`
  )

export const pizzaTheActionKitchenDemoMenu: KitchenDemoMenu = {
  rootMenu: pizzaTheActionRootMenu,
  kitchenMenu: kitchenMenu(
    pizzaTheActionKitchenDemoIdentity,
    pizzaTheActionRootMenu
  ),
  dishes: dishes(pizzaTheActionKitchenDemoIdentity, [
    {
      id: 'action-margherita',
      name: 'Action Margherita',
      description:
        'San Marzano tomato, fior di latte, basil and extra-virgin olive oil.',
      item_kind: 'food',
      image: pizzaTheActionAsset('action-margherita.jpg'),
      price: 18,
      price_options: [
        { label: '28 cm', quantity: 1, unit: 'pizza', price: 18 },
        { label: '36 cm', quantity: 1, unit: 'pizza', price: 25 },
      ],
      add_ons: [
        { id: 'burrata', label: 'Burrata', price: 5 },
        { id: 'house-chilli-oil', label: 'House chilli oil', price: 1.5 },
      ],
    },
    {
      id: 'pepperoni-punch',
      name: 'Pepperoni Punch',
      description:
        'Cup-and-char pepperoni, mozzarella, chilli honey and oregano.',
      item_kind: 'food',
      image: pizzaTheActionAsset('pepperoni-punch.jpg'),
      price: 23,
      price_options: [],
      add_ons: [
        { id: 'jalapenos', label: 'Jalapeños', price: 1.5 },
        { id: 'extra-hot-honey', label: 'Extra hot honey', price: 2 },
      ],
    },
    {
      id: 'prosciutto-rocket',
      name: 'Prosciutto & Rocket',
      description:
        'Prosciutto crudo, fior di latte, wild rocket, parmesan and lemon oil.',
      item_kind: 'food',
      image: pizzaTheActionAsset('prosciutto-rocket.jpg'),
      price: 24,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'green-machine',
      name: 'Green Machine',
      description:
        'Courgette, spinach pesto, fior di latte, peas, basil and pecorino.',
      item_kind: 'food',
      image: pizzaTheActionAsset('green-machine.jpg'),
      price: 22,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'truffle-shroom',
      name: 'Truffle Shroom',
      description:
        'Roasted mushrooms, taleggio, mozzarella, thyme and black truffle cream.',
      item_kind: 'food',
      image: pizzaTheActionAsset('truffle-shroom.jpg'),
      price: 24,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'nduja-burrata',
      name: 'Nduja & Burrata',
      description: 'Spicy nduja, tomato, torn burrata, basil and chilli oil.',
      item_kind: 'food',
      image: pizzaTheActionAsset('nduja-burrata.jpg'),
      price: 25,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'garlic-knots',
      name: 'Garlic knots',
      description:
        'Wood-fired dough knots with roast garlic butter, parsley and parmesan.',
      item_kind: 'food',
      image: pizzaTheActionAsset('garlic-knots.jpg'),
      price: 8,
      price_options: [],
      add_ons: [{ id: 'marinara-dip', label: 'Warm marinara dip', price: 2 }],
    },
    {
      id: 'courgette-fritti',
      name: 'Courgette fritti',
      description:
        'Crispy courgette ribbons with lemon, sea salt and basil mayo.',
      item_kind: 'food',
      image: pizzaTheActionAsset('courgette-fritti.jpg'),
      price: 9,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'chopped-italian-salad',
      name: 'Chopped Italian salad',
      description:
        'Little gem, tomato, cucumber, olives, peppers, parmesan and oregano dressing.',
      item_kind: 'food',
      image: pizzaTheActionAsset('chopped-italian-salad.jpg'),
      price: 11,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'pistachio-tiramisu',
      name: 'Pistachio tiramisu',
      description: 'Espresso-soaked sponge, mascarpone and roasted pistachio.',
      item_kind: 'food',
      image: pizzaTheActionAsset('pistachio-tiramisu.jpg'),
      price: 10,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'amalfi-lemon-soda',
      name: 'Amalfi lemon soda',
      description: 'Sparkling lemon soda with fresh citrus and mint.',
      item_kind: 'drink',
      image: pizzaTheActionAsset('amalfi-lemon-soda.jpg'),
      price: 6,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'blood-orange-spritz',
      name: 'Blood orange spritz',
      description: 'Blood orange, bitter botanicals and sparkling water.',
      item_kind: 'drink',
      image: pizzaTheActionAsset('blood-orange-spritz.jpg'),
      price: 7,
      price_options: [],
      add_ons: [],
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
          sort_order: 1,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'pepperoni-punch-item',
          section_id: 'pizza-classics',
          dish_id: 'pepperoni-punch',
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'prosciutto-rocket-item',
          section_id: 'pizza-classics',
          dish_id: 'prosciutto-rocket',
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
          sort_order: 1,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'truffle-shroom-item',
          section_id: 'house-pizzas',
          dish_id: 'truffle-shroom',
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'nduja-burrata-item',
          section_id: 'house-pizzas',
          dish_id: 'nduja-burrata',
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
          sort_order: 1,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'courgette-fritti-item',
          section_id: 'sides',
          dish_id: 'courgette-fritti',
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'chopped-italian-salad-item',
          section_id: 'sides',
          dish_id: 'chopped-italian-salad',
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
          sort_order: 1,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'amalfi-lemon-soda-item',
          section_id: 'sweet-and-drinks',
          dish_id: 'amalfi-lemon-soda',
          sort_order: 2,
        }),
        menuItem(pizzaTheActionKitchenDemoIdentity, {
          id: 'blood-orange-spritz-item',
          section_id: 'sweet-and-drinks',
          dish_id: 'blood-orange-spritz',
          sort_order: 3,
        }),
      ],
    },
  ],
}
