import { deanosPartyDemoMenu } from '../operations/Menus/deanos-party'
import {
  ingredientComponent,
  prepItemComponent,
  recipeComponent,
} from './components'
import type { KitchenDemoMenuItemComponentDelta } from './types'

const deanosPartyMenuItemComponentMultipliers: KitchenDemoMenuItemComponentDelta[] =
  deanosPartyDemoMenu.menuSections.flatMap(({ section, items }) =>
    items.flatMap((item) => {
      const dish = deanosPartyDemoMenu.dishes.find(
        (dish) => dish.id === item.dish_id
      )
      const options = dish?.price_options || []
      const baseOption = options[0]
      if (!baseOption || baseOption.quantity <= 0) return []
      return options.slice(1).map((option) => ({
        id: `${item.id}-${option.label
          .toLowerCase()
          .replaceAll(/[^a-z0-9]+/g, '-')}`,
        menuId: deanosPartyDemoMenu.kitchenMenu.id,
        sectionId: section.id,
        menuItemId: item.id,
        choice: {
          kind: 'price_option' as const,
          id: option.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
          label: option.label,
        },
        components: [],
        componentMultiplier: option.quantity / baseOption.quantity,
      }))
    })
  )

export const deanosKitchenDemoMenuItemComponentDeltas: KitchenDemoMenuItemComponentDelta[] =
  [
    ...deanosPartyMenuItemComponentMultipliers,
    {
      id: 'deanos-classic-double',
      menuId: 'deanos-menu',
      sectionId: 'smash-burgers',
      menuItemId: 'deanos-classic-item',
      choice: { kind: 'price_option', id: 'double', label: 'Double' },
      components: [
        prepItemComponent(
          'deanos-classic-double-patty',
          'smash-patty-80g',
          1,
          'each'
        ),
        ingredientComponent(
          'deanos-classic-double-cheese',
          'american-cheese',
          1,
          'each'
        ),
      ],
    },
    {
      id: 'deanos-classic-extra-cheddar',
      menuId: 'deanos-menu',
      sectionId: 'smash-burgers',
      menuItemId: 'deanos-classic-item',
      choice: { kind: 'add_on', id: 'extra-cheddar' },
      components: [
        prepItemComponent(
          'deanos-classic-extra-cheddar',
          'sliced-cheddar',
          20,
          'g'
        ),
      ],
    },
    {
      id: 'deanos-classic-smoked-bacon',
      menuId: 'deanos-menu',
      sectionId: 'smash-burgers',
      menuItemId: 'deanos-classic-item',
      choice: { kind: 'add_on', id: 'smoked-bacon' },
      components: [
        prepItemComponent(
          'deanos-classic-smoked-bacon',
          'cooked-smoked-bacon',
          30,
          'g'
        ),
      ],
    },
    {
      id: 'double-trouble-jalapenos',
      menuId: 'deanos-menu',
      sectionId: 'smash-burgers',
      menuItemId: 'double-trouble-item',
      choice: { kind: 'add_on', id: 'jalapenos' },
      components: [
        ingredientComponent('double-trouble-jalapenos', 'jalapeno', 15, 'g'),
      ],
    },
    {
      id: 'double-trouble-smoked-bacon',
      menuId: 'deanos-menu',
      sectionId: 'smash-burgers',
      menuItemId: 'double-trouble-item',
      choice: { kind: 'add_on', id: 'smoked-bacon' },
      components: [
        prepItemComponent(
          'double-trouble-smoked-bacon',
          'cooked-smoked-bacon',
          30,
          'g'
        ),
      ],
    },
    {
      id: 'hot-honey-chicken-extra-hot-honey',
      menuId: 'deanos-menu',
      sectionId: 'chicken-and-plant',
      menuItemId: 'hot-honey-chicken-item',
      choice: { kind: 'add_on', id: 'extra-hot-honey' },
      components: [
        recipeComponent(
          'hot-honey-chicken-extra-hot-honey',
          'hot-honey-glaze',
          20,
          'ml'
        ),
      ],
    },
    {
      id: 'hot-honey-chicken-smoked-bacon',
      menuId: 'deanos-menu',
      sectionId: 'chicken-and-plant',
      menuItemId: 'hot-honey-chicken-item',
      choice: { kind: 'add_on', id: 'smoked-bacon' },
      components: [
        prepItemComponent(
          'hot-honey-chicken-smoked-bacon',
          'cooked-smoked-bacon',
          30,
          'g'
        ),
      ],
    },
  ]
