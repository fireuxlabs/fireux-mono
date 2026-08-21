import {
  ingredientComponent,
  prepItemComponent,
  recipeComponent,
} from '../components'
import type { KitchenDemoDishSpec } from '../types'

export const deanosKitchenDemoCoreSpecs: KitchenDemoDishSpec[] = [
  {
    id: 'deanos-classic-spec',
    dishId: 'deanos-classic',
    station: 'grill',
    summary: 'Classic smash burger built hot, crisp and balanced.',
    assembly: [
      'Toast the bun.',
      'Smash and season the patty; melt the cheese.',
      'Add sauce, lettuce and pickles, then close and wrap.',
    ],
    components: [
      prepItemComponent('deanos-classic-bun', 'split-burger-bun', 1, 'each'),
      prepItemComponent('deanos-classic-patty', 'smash-patty-80g', 1, 'each'),
      ingredientComponent(
        'deanos-classic-cheese',
        'american-cheese',
        1,
        'each'
      ),
      prepItemComponent(
        'deanos-classic-lettuce',
        'washed-shredded-lettuce',
        20,
        'g'
      ),
      ingredientComponent('deanos-classic-pickles', 'pickles', 15, 'g'),
      recipeComponent('deanos-classic-sauce', 'deanos-burger-sauce', 25, 'ml'),
    ],
  },
  {
    id: 'double-trouble-spec',
    dishId: 'double-trouble',
    station: 'grill',
    summary:
      'Two smashed patties layered with cheese, caramelised onions and smoky sauce.',
    assembly: [
      'Toast the bun.',
      'Cook two patties and melt cheese over each.',
      'Stack with caramelised onions, smoky sauce and pickles, then close and wrap.',
    ],
    components: [
      prepItemComponent('double-trouble-bun', 'split-burger-bun', 1, 'each'),
      prepItemComponent('double-trouble-patties', 'smash-patty-80g', 2, 'each'),
      ingredientComponent(
        'double-trouble-cheese',
        'american-cheese',
        2,
        'each'
      ),
      recipeComponent('double-trouble-onions', 'caramelised-onions', 40, 'g'),
      ingredientComponent('double-trouble-pickles', 'pickles', 15, 'g'),
      recipeComponent('double-trouble-sauce', 'smoky-burger-sauce', 25, 'ml'),
    ],
  },
  {
    id: 'swiss-melt-spec',
    dishId: 'swiss-melt',
    station: 'grill',
    summary:
      'Smash burger finished with Swiss cheese, mushrooms and peppercorn mayo.',
    assembly: [
      'Toast the bun.',
      'Cook the patties and brown mushrooms; melt Swiss cheese.',
      'Add peppercorn mayo and onions, then close and wrap.',
    ],
    components: [
      prepItemComponent('swiss-melt-bun', 'split-burger-bun', 1, 'each'),
      prepItemComponent('swiss-melt-patties', 'smash-patty-80g', 2, 'each'),
      prepItemComponent('swiss-melt-cheese', 'sliced-swiss-cheese', 40, 'g'),
      prepItemComponent(
        'swiss-melt-mushrooms',
        'sliced-brown-mushrooms',
        50,
        'g'
      ),
      recipeComponent('swiss-melt-onions', 'caramelised-onions', 40, 'g'),
      recipeComponent('swiss-melt-mayo', 'peppercorn-mayo', 25, 'ml'),
    ],
  },
  {
    id: 'hot-honey-chicken-spec',
    dishId: 'hot-honey-chicken',
    station: 'fryers',
    summary: 'Buttermilk chicken with crunchy slaw, hot honey and chilli mayo.',
    assembly: [
      'Toast the bun and fry the chicken.',
      'Coat the chicken with hot-honey glaze.',
      'Add slaw, pickles and chilli mayo, then close and wrap.',
    ],
    components: [
      prepItemComponent('hot-honey-chicken-bun', 'split-burger-bun', 1, 'each'),
      recipeComponent(
        'hot-honey-chicken-fillet',
        'buttermilk-chicken',
        160,
        'g'
      ),
      recipeComponent('hot-honey-chicken-slaw', 'red-cabbage-slaw', 50, 'g'),
      ingredientComponent('hot-honey-chicken-pickles', 'pickles', 15, 'g'),
      recipeComponent('hot-honey-chicken-glaze', 'hot-honey-glaze', 30, 'ml'),
      recipeComponent('hot-honey-chicken-mayo', 'chilli-mayo', 25, 'ml'),
    ],
  },
  {
    id: 'ranch-chicken-spec',
    dishId: 'ranch-chicken',
    station: 'fryers',
    summary: 'Crisp chicken burger finished with cool herb ranch.',
    assembly: [
      'Toast the bun and fry the chicken.',
      'Add ranch dressing, lettuce, tomato and pickles.',
      'Close, secure and wrap.',
    ],
    components: [
      prepItemComponent('ranch-chicken-bun', 'split-burger-bun', 1, 'each'),
      recipeComponent('ranch-chicken-fillet', 'buttermilk-chicken', 160, 'g'),
      prepItemComponent(
        'ranch-chicken-lettuce',
        'washed-shredded-lettuce',
        20,
        'g'
      ),
      prepItemComponent('ranch-chicken-tomato', 'sliced-tomato', 30, 'g'),
      ingredientComponent('ranch-chicken-pickles', 'pickles', 15, 'g'),
      recipeComponent('ranch-chicken-dressing', 'ranch-dressing', 30, 'ml'),
    ],
  },
  {
    id: 'crispy-cauliflower-spec',
    dishId: 'crispy-cauliflower',
    station: 'fryers',
    summary:
      'Freshly battered cauliflower built as a crisp plant-based burger.',
    assembly: [
      'Coat and fry the cauliflower until crisp.',
      'Toast the bun and add smoky vegan mayo.',
      'Add red cabbage slaw and pickles, then close and wrap.',
    ],
    components: [
      prepItemComponent(
        'crispy-cauliflower-bun',
        'split-burger-bun',
        1,
        'each'
      ),
      prepItemComponent(
        'crispy-cauliflower-florets',
        'cauliflower-florets',
        150,
        'g'
      ),
      recipeComponent(
        'crispy-cauliflower-batter',
        'deanos-crispy-batter',
        1,
        'portion'
      ),
      recipeComponent('crispy-cauliflower-slaw', 'red-cabbage-slaw', 50, 'g'),
      ingredientComponent('crispy-cauliflower-pickles', 'pickles', 15, 'g'),
      recipeComponent('crispy-cauliflower-mayo', 'smoky-vegan-mayo', 30, 'ml'),
    ],
  },
  {
    id: 'skin-on-fries-spec',
    dishId: 'skin-on-fries',
    station: 'fryers',
    summary: 'Crisp fries seasoned immediately after cooking.',
    assembly: [
      'Fry from chilled until crisp.',
      'Drain and season evenly.',
      'Serve in the correct portion carton.',
    ],
    components: [
      ingredientComponent('skin-on-fries-fries', 'skin-on-fries', 180, 'g'),
      ingredientComponent('skin-on-fries-salt', 'sea-salt', 2, 'g'),
    ],
  },
  {
    id: 'dirty-deanos-fries-spec',
    dishId: 'dirty-deanos-fries',
    station: 'fryers',
    summary: 'Fries loaded with warm cheese sauce and burger garnish.',
    assembly: [
      'Cook and season the fries and chopped smash beef.',
      'Spoon over hot cheese sauce.',
      'Finish with burger sauce, pickles, spring onion and crispy onions.',
    ],
    components: [
      ingredientComponent('dirty-fries-fries', 'skin-on-fries', 200, 'g'),
      ingredientComponent('dirty-fries-salt', 'sea-salt', 2, 'g'),
      prepItemComponent('dirty-fries-beef', 'smash-patty-80g', 1, 'each'),
      recipeComponent(
        'dirty-fries-cheese-sauce',
        'dirty-fries-cheese-sauce',
        80,
        'ml'
      ),
      recipeComponent(
        'dirty-fries-burger-sauce',
        'deanos-burger-sauce',
        20,
        'ml'
      ),
      ingredientComponent('dirty-fries-pickles', 'pickles', 15, 'g'),
      prepItemComponent(
        'dirty-fries-spring-onion',
        'sliced-spring-onion',
        8,
        'g'
      ),
      ingredientComponent(
        'dirty-fries-crispy-onions',
        'crispy-onions',
        10,
        'g'
      ),
    ],
  },
  {
    id: 'onion-rings-spec',
    dishId: 'onion-rings',
    station: 'fryers',
    portion: '120 g',
    summary: 'Cold-battered onion rings fried until light and crisp.',
    assembly: [
      'Coat onion rings in fresh batter.',
      'Fry until crisp and golden.',
      'Drain, season and serve.',
    ],
    components: [
      prepItemComponent('onion-rings-onions', 'sliced-onion-rings', 120, 'g'),
      recipeComponent(
        'onion-rings-batter',
        'deanos-crispy-batter',
        1,
        'portion'
      ),
      ingredientComponent('onion-rings-salt', 'sea-salt', 2, 'g'),
    ],
  },
  {
    id: 'salted-caramel-shake-spec',
    dishId: 'salted-caramel-shake',
    station: 'drinks',
    summary: 'Thick vanilla shake blended with house salted caramel.',
    assembly: [
      'Measure shake base and caramel sauce.',
      'Blend until smooth.',
      'Pour, top and finish with caramel and sea salt.',
    ],
    components: [
      prepItemComponent(
        'salted-caramel-shake-soft-serve',
        'service-ready-vanilla-soft-serve',
        250,
        'ml'
      ),
      ingredientComponent('salted-caramel-shake-milk', 'milk', 100, 'ml'),
      recipeComponent(
        'salted-caramel-shake-sauce',
        'salted-caramel-sauce',
        45,
        'ml'
      ),
      ingredientComponent('salted-caramel-shake-salt', 'sea-salt', 1, 'g'),
    ],
  },
  {
    id: 'cherry-vanilla-shake-spec',
    dishId: 'cherry-vanilla-shake',
    station: 'drinks',
    summary: 'Vanilla shake layered with bright cherry syrup.',
    assembly: [
      'Measure shake base and cherry syrup.',
      'Blend until smooth.',
      'Pour, top and finish with cherry syrup.',
    ],
    components: [
      prepItemComponent(
        'cherry-shake-soft-serve',
        'service-ready-vanilla-soft-serve',
        250,
        'ml'
      ),
      ingredientComponent('cherry-shake-milk', 'milk', 100, 'ml'),
      recipeComponent('cherry-shake-syrup', 'cherry-vanilla-syrup', 50, 'ml'),
    ],
  },
  {
    id: 'house-lemonade-spec',
    dishId: 'house-lemonade',
    station: 'drinks',
    summary: 'House cordial lengthened with sparkling water and fresh lemon.',
    assembly: [
      'Measure cordial over ice.',
      'Add sparkling water and stir.',
      'Finish with mint and a fresh lemon slice.',
    ],
    components: [
      recipeComponent(
        'house-lemonade-cordial',
        'house-lemonade-cordial',
        100,
        'ml'
      ),
      ingredientComponent('house-lemonade-water', 'sparkling-water', 250, 'ml'),
      ingredientComponent('house-lemonade-ice', 'ice', 150, 'g'),
      prepItemComponent('house-lemonade-mint', 'washed-mint', 2, 'g'),
      prepItemComponent('house-lemonade-lemon', 'lemon-garnish', 1, 'each'),
    ],
  },
]
