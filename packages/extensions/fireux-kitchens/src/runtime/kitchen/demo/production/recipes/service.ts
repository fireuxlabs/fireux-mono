import type { KitchenDemoProductionRecipe } from '../types'

export const deanosKitchenDemoServiceRecipes: KitchenDemoProductionRecipe[] = [
  {
      id: 'deanos-burger-sauce',
      name: 'Deanos burger sauce',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 700, unit: 'ml' },
        { ingredientId: 'ketchup', quantity: 180, unit: 'ml' },
        { ingredientId: 'yellow-mustard', quantity: 80, unit: 'ml' },
        {
          ingredientId: 'pickles',
          quantity: 30,
          unit: 'g',
          preparation: 'brine from the supplied sliced pickles',
        },
        { ingredientId: 'smoked-paprika', quantity: 10, unit: 'g' },
      ],
      method: ['Whisk until smooth.', 'Rest chilled before service.'],
    },
  {
      id: 'caramelised-onions',
      name: 'Caramelised onions',
      yield: { quantity: 1500, unit: 'g' },
      ingredients: [
        {
          ingredientId: 'onion',
          quantity: 2000,
          unit: 'g',
          preparation: 'thinly sliced',
        },
        { ingredientId: 'butter', quantity: 100, unit: 'g' },
        { ingredientId: 'brown-sugar', quantity: 80, unit: 'g' },
        { ingredientId: 'cider-vinegar', quantity: 100, unit: 'ml' },
        { ingredientId: 'fine-salt', quantity: 20, unit: 'g' },
      ],
      method: [
        'Cook onions slowly until soft.',
        'Caramelise, season and cool safely.',
      ],
    },
  {
      id: 'hot-honey-glaze',
      name: 'Hot-honey glaze',
      yield: { quantity: 750, unit: 'ml' },
      ingredients: [
        { ingredientId: 'honey', quantity: 500, unit: 'g' },
        { ingredientId: 'chilli-sauce', quantity: 150, unit: 'ml' },
        { ingredientId: 'cider-vinegar', quantity: 75, unit: 'ml' },
        { ingredientId: 'butter', quantity: 100, unit: 'g' },
      ],
      method: [
        'Warm gently and whisk together.',
        'Hold ready for finishing chicken.',
      ],
    },
  {
      id: 'ranch-dressing',
      name: 'Ranch dressing',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 600, unit: 'ml' },
        { ingredientId: 'buttermilk', quantity: 300, unit: 'ml' },
        {
          ingredientId: 'chives',
          quantity: 30,
          unit: 'g',
          preparation: 'finely chopped',
        },
        {
          ingredientId: 'dill',
          quantity: 20,
          unit: 'g',
          preparation: 'finely chopped',
        },
        {
          ingredientId: 'garlic',
          quantity: 20,
          unit: 'g',
          preparation: 'crushed',
        },
        {
          ingredientId: 'lemon',
          quantity: 100,
          unit: 'g',
          preparation: 'juice and zest',
        },
      ],
      method: ['Whisk the base until smooth.', 'Fold through herbs and chill.'],
    },
  {
      id: 'dirty-fries-cheese-sauce',
      name: 'Dirty-fries cheese sauce',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        {
          ingredientId: 'cheddar-cheese',
          quantity: 400,
          unit: 'g',
          preparation: 'grated',
        },
        { ingredientId: 'milk', quantity: 700, unit: 'ml' },
        { ingredientId: 'butter', quantity: 80, unit: 'g' },
        { ingredientId: 'flour', quantity: 80, unit: 'g' },
        { ingredientId: 'mustard', quantity: 40, unit: 'g' },
      ],
      method: [
        'Cook a smooth white-sauce base.',
        'Melt in cheese and hold warm.',
      ],
    },
  {
      id: 'deanos-crispy-batter',
      name: 'Deanos crispy batter',
      yield: { quantity: 40, unit: 'portion' },
      ingredients: [
        { ingredientId: 'flour', quantity: 800, unit: 'g' },
        { ingredientId: 'cornflour', quantity: 400, unit: 'g' },
        { ingredientId: 'baking-powder', quantity: 30, unit: 'g' },
        { ingredientId: 'fine-salt', quantity: 20, unit: 'g' },
        {
          ingredientId: 'sparkling-water',
          quantity: 1800,
          unit: 'ml',
          preparation: 'ice cold',
        },
      ],
      method: [
        'Combine dry ingredients.',
        'Whisk with cold water immediately before frying.',
      ],
    },
  {
      id: 'peppercorn-mayo',
      name: 'Peppercorn mayo',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 900, unit: 'ml' },
        {
          ingredientId: 'black-pepper',
          quantity: 30,
          unit: 'g',
          preparation: 'coarsely cracked',
        },
        { ingredientId: 'lemon', quantity: 100, unit: 'g', preparation: 'juice' },
      ],
      method: [
        'Fold the cracked pepper through the mayonnaise.',
        'Balance with lemon and chill before service.',
      ],
    },
  {
      id: 'smoky-vegan-mayo',
      name: 'Smoky vegan mayo',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'vegan-mayonnaise', quantity: 900, unit: 'ml' },
        { ingredientId: 'smoked-paprika', quantity: 15, unit: 'g' },
        { ingredientId: 'lemon', quantity: 100, unit: 'g', preparation: 'juice' },
      ],
      method: [
        'Whisk the paprika into the vegan mayonnaise.',
        'Balance with lemon and chill before service.',
      ],
    },
  {
      id: 'smoky-burger-sauce',
      name: 'Smoky burger sauce',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 700, unit: 'ml' },
        { ingredientId: 'ketchup', quantity: 150, unit: 'ml' },
        { ingredientId: 'yellow-mustard', quantity: 80, unit: 'ml' },
        { ingredientId: 'chilli-sauce', quantity: 50, unit: 'ml' },
        { ingredientId: 'smoked-paprika', quantity: 20, unit: 'g' },
      ],
      method: [
        'Whisk until smooth.',
        'Rest chilled so the smoky flavour develops.',
      ],
    },
  {
      id: 'buttermilk-chicken',
      name: 'Buttermilk chicken',
      yield: { quantity: 2000, unit: 'g' },
      ingredients: [
        {
          ingredientId: 'chicken-breast',
          quantity: 1600,
          unit: 'g',
          preparation: 'trimmed and portioned',
        },
        { ingredientId: 'buttermilk', quantity: 600, unit: 'ml' },
        { ingredientId: 'flour', quantity: 300, unit: 'g' },
        { ingredientId: 'cornflour', quantity: 100, unit: 'g' },
        { ingredientId: 'fine-salt', quantity: 20, unit: 'g' },
        { ingredientId: 'smoked-paprika', quantity: 10, unit: 'g' },
      ],
      method: [
        'Marinate the chicken in buttermilk.',
        'Coat with the seasoned flour and portion ready to fry.',
      ],
    },
  {
      id: 'red-cabbage-slaw',
      name: 'Red cabbage slaw',
      yield: { quantity: 1000, unit: 'g' },
      ingredients: [
        {
          ingredientId: 'red-cabbage',
          quantity: 850,
          unit: 'g',
          preparation: 'finely shredded',
        },
        { ingredientId: 'cider-vinegar', quantity: 80, unit: 'ml' },
        { ingredientId: 'sugar', quantity: 50, unit: 'g' },
        { ingredientId: 'fine-salt', quantity: 20, unit: 'g' },
      ],
      method: [
        'Massage the cabbage with the seasoning.',
        'Dress, rest and hold chilled.',
      ],
    },
  {
      id: 'chilli-mayo',
      name: 'Chilli mayo',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 850, unit: 'ml' },
        { ingredientId: 'chilli-sauce', quantity: 150, unit: 'ml' },
      ],
      method: ['Whisk until even.', 'Hold chilled for service.'],
    }
]

