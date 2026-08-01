import type { KitchenDemoProductionRecipe } from '../types'

export const deanosKitchenDemoDrinkRecipes: KitchenDemoProductionRecipe[] = [
  {
      id: 'salted-caramel-sauce',
      name: 'Salted-caramel sauce',
      yield: { quantity: 750, unit: 'ml' },
      ingredients: [
        { ingredientId: 'sugar', quantity: 500, unit: 'g' },
        { ingredientId: 'cream', quantity: 400, unit: 'ml' },
        { ingredientId: 'butter', quantity: 150, unit: 'g' },
        { ingredientId: 'sea-salt', quantity: 10, unit: 'g' },
      ],
      method: [
        'Cook sugar to an amber caramel.',
        'Whisk in cream and butter, then season.',
      ],
    },
  {
      id: 'cherry-vanilla-syrup',
      name: 'Cherry-vanilla syrup',
      yield: { quantity: 750, unit: 'ml' },
      ingredients: [
        { ingredientId: 'cherries', quantity: 600, unit: 'g' },
        { ingredientId: 'sugar', quantity: 350, unit: 'g' },
        { ingredientId: 'still-water', quantity: 350, unit: 'ml' },
        { ingredientId: 'vanilla', quantity: 10, unit: 'ml' },
      ],
      method: [
        'Simmer cherries with sugar and water.',
        'Blend, strain and chill.',
      ],
    },
  {
      id: 'house-lemonade-cordial',
      name: 'House-lemonade cordial',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        {
          ingredientId: 'lemon',
          quantity: 1000,
          unit: 'g',
          preparation: 'juice and zest',
        },
        { ingredientId: 'sugar', quantity: 600, unit: 'g' },
        { ingredientId: 'still-water', quantity: 500, unit: 'ml' },
      ],
      method: [
        'Dissolve sugar with water and zest.',
        'Cool, add lemon juice and strain.',
      ],
    },
  {
      id: 'strawberry-lime-cooler-base',
      name: 'Strawberry and lime cooler base',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'strawberries', quantity: 800, unit: 'g' },
        {
          ingredientId: 'lime',
          quantity: 300,
          unit: 'g',
          preparation: 'juice and zest',
        },
        { ingredientId: 'sugar', quantity: 300, unit: 'g' },
        { ingredientId: 'still-water', quantity: 500, unit: 'ml' },
      ],
      method: [
        'Macerate the fruit with sugar.',
        'Blend with water, strain and chill.',
      ],
    },
  {
      id: 'cucumber-mint-cooler-base',
      name: 'Cucumber and mint cooler base',
      yield: { quantity: 1000, unit: 'ml' },
      ingredients: [
        { ingredientId: 'cucumber', quantity: 1000, unit: 'g' },
        { ingredientId: 'mint', quantity: 100, unit: 'g' },
        {
          ingredientId: 'lime',
          quantity: 300,
          unit: 'g',
          preparation: 'juice and zest',
        },
        { ingredientId: 'sugar', quantity: 200, unit: 'g' },
        { ingredientId: 'still-water', quantity: 500, unit: 'ml' },
      ],
      method: [
        'Blend the cucumber, mint and lime with the syrup.',
        'Strain and chill.',
      ],
    }
]

