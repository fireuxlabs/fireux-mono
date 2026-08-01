import {
  ingredientComponent,
  prepItemComponent,
  recipeComponent,
} from '../components'
import type { KitchenDemoDishSpec } from '../types'

export const deanosKitchenDemoPartySpecs: KitchenDemoDishSpec[] = [
  {
      id: 'classic-smash-slider-platter-spec',
      dishId: 'classic-smash-slider-platter',
      station: 'grill',
      portion: '7 sliders',
      summary: 'Seven mini classic smash burgers assembled as one party platter.',
      assembly: [
        'Toast the slider buns.',
        'Cook the patties and melt the cheese.',
        'Dress, close and arrange seven sliders on the platter.',
      ],
      components: [
        prepItemComponent('classic-slider-buns', 'split-slider-bun', 7, 'each'),
        prepItemComponent(
          'classic-slider-patties',
          'slider-patty-60g',
          7,
          'each'
        ),
        ingredientComponent(
          'classic-slider-cheese',
          'american-cheese',
          7,
          'each'
        ),
        prepItemComponent(
          'classic-slider-lettuce',
          'washed-shredded-lettuce',
          105,
          'g'
        ),
        ingredientComponent('classic-slider-pickles', 'pickles', 105, 'g'),
        recipeComponent('classic-slider-sauce', 'deanos-burger-sauce', 175, 'ml'),
      ],
    },
  {
      id: 'hot-honey-chicken-slider-platter-spec',
      dishId: 'hot-honey-chicken-slider-platter',
      station: 'fryers',
      portion: '7 sliders',
      summary: 'Seven hot-honey chicken sliders assembled as one party platter.',
      assembly: [
        'Toast the slider buns and fry the chicken.',
        'Glaze with hot honey.',
        'Add slaw, pickles and chilli mayo, then arrange the platter.',
      ],
      components: [
        prepItemComponent('hot-honey-slider-buns', 'split-slider-bun', 7, 'each'),
        recipeComponent(
          'hot-honey-slider-chicken',
          'buttermilk-chicken',
          560,
          'g'
        ),
        recipeComponent('hot-honey-slider-slaw', 'red-cabbage-slaw', 350, 'g'),
        ingredientComponent('hot-honey-slider-pickles', 'pickles', 105, 'g'),
        recipeComponent('hot-honey-slider-glaze', 'hot-honey-glaze', 210, 'ml'),
        recipeComponent('hot-honey-slider-mayo', 'chilli-mayo', 175, 'ml'),
      ],
    },
  {
      id: 'cauliflower-slider-platter-spec',
      dishId: 'cauliflower-slider-platter',
      station: 'fryers',
      portion: '7 sliders',
      summary: 'Seven crispy cauliflower sliders assembled as one party platter.',
      assembly: [
        'Batter and fry the cauliflower.',
        'Toast the slider buns.',
        'Add slaw, pickles and smoky vegan mayo, then arrange the platter.',
      ],
      components: [
        prepItemComponent(
          'cauliflower-slider-buns',
          'split-slider-bun',
          7,
          'each'
        ),
        prepItemComponent(
          'cauliflower-slider-florets',
          'cauliflower-florets',
          700,
          'g'
        ),
        recipeComponent(
          'cauliflower-slider-batter',
          'deanos-crispy-batter',
          7,
          'portion'
        ),
        recipeComponent('cauliflower-slider-slaw', 'red-cabbage-slaw', 350, 'g'),
        ingredientComponent('cauliflower-slider-pickles', 'pickles', 105, 'g'),
        recipeComponent('cauliflower-slider-mayo', 'smoky-vegan-mayo', 175, 'ml'),
      ],
    },
  {
      id: 'party-fries-tray-spec',
      dishId: 'party-fries-tray',
      station: 'fryers',
      portion: 'Serves 8',
      summary: 'A sharing tray of crisp skin-on fries.',
      assembly: [
        'Fry until crisp.',
        'Drain and season evenly.',
        'Transfer to the sharing tray.',
      ],
      components: [
        ingredientComponent('party-fries', 'skin-on-fries', 1200, 'g'),
        ingredientComponent('party-fries-salt', 'sea-salt', 12, 'g'),
      ],
    },
  {
      id: 'party-onion-ring-platter-spec',
      dishId: 'party-onion-ring-platter',
      station: 'fryers',
      portion: 'Serves 8',
      summary: 'A sharing platter of freshly battered onion rings.',
      assembly: [
        'Coat the onion rings in fresh batter.',
        'Fry until crisp and golden.',
        'Season and arrange on the platter.',
      ],
      components: [
        prepItemComponent('party-onion-rings', 'sliced-onion-rings', 960, 'g'),
        recipeComponent(
          'party-onion-ring-batter',
          'deanos-crispy-batter',
          8,
          'portion'
        ),
        ingredientComponent('party-onion-ring-salt', 'sea-salt', 16, 'g'),
      ],
    },
  {
      id: 'party-lemonade-spec',
      dishId: 'party-lemonade',
      station: 'drinks',
      portion: 'Serves 8',
      summary: 'House lemonade built in a chilled party dispenser.',
      assembly: [
        'Fill the dispenser with ice.',
        'Add cordial and sparkling water.',
        'Finish with mint and lemon.',
      ],
      components: [
        recipeComponent(
          'party-lemonade-cordial',
          'house-lemonade-cordial',
          800,
          'ml'
        ),
        ingredientComponent(
          'party-lemonade-water',
          'sparkling-water',
          2000,
          'ml'
        ),
        ingredientComponent('party-lemonade-ice', 'ice', 1200, 'g'),
        prepItemComponent('party-lemonade-mint', 'washed-mint', 16, 'g'),
        prepItemComponent('party-lemonade-lemon', 'lemon-garnish', 8, 'each'),
      ],
    },
  {
      id: 'party-strawberry-lime-cooler-spec',
      dishId: 'party-strawberry-lime-cooler',
      station: 'drinks',
      portion: 'Serves 8',
      summary: 'Sparkling strawberry and lime cooler built for the buffet table.',
      assembly: [
        'Fill the dispenser with ice.',
        'Add cooler base and sparkling water.',
        'Finish with fresh basil.',
      ],
      components: [
        recipeComponent(
          'strawberry-cooler-base',
          'strawberry-lime-cooler-base',
          800,
          'ml'
        ),
        ingredientComponent(
          'strawberry-cooler-water',
          'sparkling-water',
          2000,
          'ml'
        ),
        ingredientComponent('strawberry-cooler-ice', 'ice', 1200, 'g'),
        prepItemComponent('strawberry-cooler-basil', 'washed-basil', 16, 'g'),
      ],
    },
  {
      id: 'party-cucumber-mint-cooler-spec',
      dishId: 'party-cucumber-mint-cooler',
      station: 'drinks',
      portion: 'Serves 8',
      summary: 'Cucumber, mint and lime cooler built for the buffet table.',
      assembly: [
        'Fill the dispenser with ice.',
        'Add cooler base and sparkling water.',
        'Finish with cucumber and mint.',
      ],
      components: [
        recipeComponent(
          'cucumber-cooler-base',
          'cucumber-mint-cooler-base',
          800,
          'ml'
        ),
        ingredientComponent(
          'cucumber-cooler-water',
          'sparkling-water',
          2000,
          'ml'
        ),
        ingredientComponent('cucumber-cooler-ice', 'ice', 1200, 'g'),
        prepItemComponent(
          'cucumber-cooler-cucumber',
          'sliced-cucumber',
          200,
          'g'
        ),
        prepItemComponent('cucumber-cooler-mint', 'washed-mint', 16, 'g'),
      ],
    }
]

