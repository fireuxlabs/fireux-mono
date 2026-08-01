import type { KitchenDemoProductionRecipe } from '../types'

export const deanosKitchenDemoSeasonalRecipes: KitchenDemoProductionRecipe[] = [
  {
      id: 'pigs-in-blankets',
      name: 'Pigs in blankets',
      yield: { quantity: 20, unit: 'each' },
      ingredients: [
        { ingredientId: 'chipolatas', quantity: 1000, unit: 'g' },
        {
          ingredientId: 'smoked-bacon',
          quantity: 500,
          unit: 'g',
          preparation: 'cut into 20 strips',
        },
      ],
      method: [
        'Wrap each chipolata with a strip of smoked bacon.',
        'Cook safely until browned and cooked through.',
      ],
    },
  {
      id: 'fried-camembert',
      name: 'Fried Camembert',
      yield: { quantity: 10, unit: 'portion' },
      ingredients: [
        {
          ingredientId: 'camembert',
          quantity: 1000,
          unit: 'g',
          preparation: 'cut into 10 portions',
        },
        { ingredientId: 'flour', quantity: 100, unit: 'g' },
        { ingredientId: 'buttermilk', quantity: 200, unit: 'ml' },
        { ingredientId: 'breadcrumbs', quantity: 300, unit: 'g' },
      ],
      method: [
        'Coat each Camembert portion.',
        'Chill until firm and fry to order.',
      ],
    },
  {
      id: 'mustard-mayo',
      name: 'Mustard mayo',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 850, unit: 'ml' },
        { ingredientId: 'mustard', quantity: 150, unit: 'g' },
      ],
      method: ['Whisk until smooth.', 'Hold chilled.'],
    },
  {
      id: 'sage-onion-stuffing',
      name: 'Prepared sage and onion stuffing',
      yield: { quantity: 1000, unit: 'g' },
      ingredients: [
        { ingredientId: 'sage-onion-stuffing', quantity: 600, unit: 'g' },
        { ingredientId: 'still-water', quantity: 500, unit: 'ml' },
        { ingredientId: 'butter', quantity: 100, unit: 'g' },
      ],
      method: ['Hydrate the stuffing mix.', 'Bake, cool safely and portion.'],
    },
  {
      id: 'gravy-mayo',
      name: 'Gravy mayo',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'mayonnaise', quantity: 700, unit: 'ml' },
        { ingredientId: 'gravy', quantity: 300, unit: 'ml' },
      ],
      method: ['Whisk the cooled gravy through the mayonnaise.', 'Hold chilled.'],
    },
  {
      id: 'fried-brie-bites',
      name: 'Fried Brie bites',
      yield: { quantity: 40, unit: 'each' },
      ingredients: [
        {
          ingredientId: 'brie',
          quantity: 1000,
          unit: 'g',
          preparation: 'cut into 40 bites',
        },
        { ingredientId: 'flour', quantity: 100, unit: 'g' },
        { ingredientId: 'buttermilk', quantity: 250, unit: 'ml' },
        { ingredientId: 'breadcrumbs', quantity: 350, unit: 'g' },
      ],
      method: ['Coat each Brie bite.', 'Chill until firm and fry to order.'],
    },
  {
      id: 'cranberry-chilli-dip',
      name: 'Cranberry and chilli dip',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'cranberry-relish', quantity: 700, unit: 'g' },
        { ingredientId: 'chilli-sauce', quantity: 300, unit: 'ml' },
      ],
      method: ['Blend until spoonable but textured.', 'Hold chilled.'],
    }
]

