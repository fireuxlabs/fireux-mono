import {
  ingredientComponent,
  prepItemComponent,
  recipeComponent,
} from '../components'
import type { KitchenDemoDishSpec } from '../types'

export const deanosKitchenDemoSeasonalSpecs: KitchenDemoDishSpec[] = [
  {
    id: 'deanos-christmas-stack-spec',
    dishId: 'deanos-christmas-stack',
    station: 'grill',
    summary:
      'Double smash burger with bacon, fried Camembert and festive garnish.',
    assembly: [
      'Toast the bun and cook the patties.',
      'Add bacon and fried Camembert.',
      'Finish with cranberry relish, rocket and mustard mayo.',
    ],
    components: [
      prepItemComponent('christmas-stack-bun', 'split-burger-bun', 1, 'each'),
      prepItemComponent(
        'christmas-stack-patties',
        'smash-patty-80g',
        2,
        'each'
      ),
      prepItemComponent(
        'christmas-stack-bacon',
        'cooked-smoked-bacon',
        30,
        'g'
      ),
      recipeComponent(
        'christmas-stack-camembert',
        'fried-camembert',
        1,
        'portion'
      ),
      ingredientComponent(
        'christmas-stack-cranberry',
        'cranberry-relish',
        30,
        'g'
      ),
      prepItemComponent('christmas-stack-rocket', 'washed-rocket', 20, 'g'),
      recipeComponent('christmas-stack-mayo', 'mustard-mayo', 25, 'ml'),
    ],
  },
  {
    id: 'turkey-dinner-burger-spec',
    dishId: 'turkey-dinner-burger',
    station: 'grill',
    summary: 'Roast turkey burger carrying the full Christmas dinner garnish.',
    assembly: [
      'Toast the bun and warm the turkey and stuffing.',
      'Melt the Brie over the turkey.',
      'Add cranberry relish, gravy mayo and a pig in blanket.',
    ],
    components: [
      prepItemComponent('turkey-burger-bun', 'split-burger-bun', 1, 'each'),
      prepItemComponent('turkey-burger-turkey', 'roast-turkey', 120, 'g'),
      recipeComponent('turkey-burger-stuffing', 'sage-onion-stuffing', 50, 'g'),
      prepItemComponent('turkey-burger-brie', 'sliced-brie', 40, 'g'),
      ingredientComponent(
        'turkey-burger-cranberry',
        'cranberry-relish',
        30,
        'g'
      ),
      recipeComponent('turkey-burger-gravy-mayo', 'gravy-mayo', 25, 'ml'),
      recipeComponent('turkey-burger-pig', 'pigs-in-blankets', 1, 'each'),
    ],
  },
  {
    id: 'pigs-in-blankets-waffle-fries-spec',
    dishId: 'pigs-in-blankets-waffle-fries',
    station: 'fryers',
    summary: 'Waffle fries loaded with festive meat, sauces and crisp garnish.',
    assembly: [
      'Fry and season the waffle fries.',
      'Add chopped pigs in blankets, cheese sauce and gravy.',
      'Finish with cranberry relish and crispy onions.',
    ],
    components: [
      ingredientComponent('pigs-waffle-fries', 'waffle-fries', 200, 'g'),
      ingredientComponent('pigs-waffle-salt', 'sea-salt', 2, 'g'),
      recipeComponent('pigs-waffle-pigs', 'pigs-in-blankets', 3, 'each'),
      recipeComponent(
        'pigs-waffle-cheese-sauce',
        'dirty-fries-cheese-sauce',
        80,
        'ml'
      ),
      ingredientComponent('pigs-waffle-gravy', 'gravy', 60, 'ml'),
      ingredientComponent('pigs-waffle-cranberry', 'cranberry-relish', 30, 'g'),
      ingredientComponent(
        'pigs-waffle-crispy-onions',
        'crispy-onions',
        10,
        'g'
      ),
    ],
  },
  {
    id: 'fried-brie-bites-spec',
    dishId: 'fried-brie-bites',
    station: 'fryers',
    portion: '6 bites',
    summary: 'Golden crumbed Brie with cranberry and chilli dip.',
    assembly: [
      'Fry the Brie bites until crisp.',
      'Drain and season.',
      'Serve with cranberry and chilli dip.',
    ],
    components: [
      recipeComponent('fried-brie-bites', 'fried-brie-bites', 6, 'each'),
      recipeComponent('fried-brie-dip', 'cranberry-chilli-dip', 30, 'ml'),
    ],
  },
  {
    id: 'stuffed-mini-yorkshires-spec',
    dishId: 'stuffed-mini-yorkshires',
    station: 'fryers',
    portion: '3 each',
    summary:
      'Mini Yorkshire puddings filled with turkey and Christmas trimmings.',
    assembly: [
      'Warm the Yorkshire puddings.',
      'Fill with turkey and stuffing.',
      'Finish with cranberry relish and gravy.',
    ],
    components: [
      ingredientComponent(
        'mini-yorkshires',
        'mini-yorkshire-puddings',
        3,
        'each'
      ),
      prepItemComponent('mini-yorkshire-turkey', 'roast-turkey', 90, 'g'),
      recipeComponent(
        'mini-yorkshire-stuffing',
        'sage-onion-stuffing',
        45,
        'g'
      ),
      ingredientComponent(
        'mini-yorkshire-cranberry',
        'cranberry-relish',
        30,
        'g'
      ),
      ingredientComponent('mini-yorkshire-gravy', 'gravy', 60, 'ml'),
    ],
  },
  {
    id: 'gingerbread-caramel-shake-spec',
    dishId: 'gingerbread-caramel-shake',
    station: 'drinks',
    summary: 'Vanilla shake blended with salted caramel and gingerbread.',
    assembly: [
      'Measure the shake base, caramel and spice.',
      'Blend until smooth.',
      'Finish with biscuit crumb.',
    ],
    components: [
      prepItemComponent(
        'gingerbread-shake-soft-serve',
        'service-ready-vanilla-soft-serve',
        250,
        'ml'
      ),
      ingredientComponent('gingerbread-shake-milk', 'milk', 100, 'ml'),
      recipeComponent(
        'gingerbread-shake-caramel',
        'salted-caramel-sauce',
        45,
        'ml'
      ),
      ingredientComponent(
        'gingerbread-shake-spice',
        'gingerbread-spice',
        2,
        'g'
      ),
      ingredientComponent(
        'gingerbread-shake-biscuit',
        'gingerbread-biscuits',
        15,
        'g'
      ),
    ],
  },
]
