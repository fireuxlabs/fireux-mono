/**
 * Read-only production-planning fixtures for the Deanos Main Menu demo.
 *
 * These records deliberately describe the operational relationships we want
 * to inspect before promoting them into canonical persisted Spec and expanded
 * Recipe models.
 */
export type KitchenDemoDishSpec = {
  id: string
  dishId: string
  station: string
  portion?: string
  summary: string
  assembly: string[]
  components: KitchenDemoDishComponent[]
}

export type KitchenDemoProductionUnit = 'g' | 'ml' | 'each' | 'portion'

export type KitchenDemoProductionAmount = {
  quantity: number
  unit: KitchenDemoProductionUnit
}

type KitchenDemoDishComponentBase = KitchenDemoProductionAmount & {
  id: string
}

export type KitchenDemoDishIngredientComponent =
  KitchenDemoDishComponentBase & {
    source: 'ingredient'
    ingredientId: string
  }

export type KitchenDemoDishPrepItemComponent = KitchenDemoDishComponentBase & {
  source: 'prep_item'
  prepItemId: string
}

export type KitchenDemoDishRecipeComponent = KitchenDemoDishComponentBase & {
  source: 'recipe'
  recipeId: string
}

export type KitchenDemoDishComponent =
  | KitchenDemoDishIngredientComponent
  | KitchenDemoDishPrepItemComponent
  | KitchenDemoDishRecipeComponent

export type KitchenDemoMenuItemComponentDelta = {
  id: string
  menuId: string
  sectionId: string
  menuItemId: string
  choice:
    | {
        kind: 'price_option'
        id: string
        label: string
      }
    | {
        kind: 'add_on'
        id: string
        label?: never
      }
  components: KitchenDemoDishComponent[]
}

export type KitchenDemoProductionRecipe = {
  id: string
  name: string
  yield: KitchenDemoProductionAmount
  ingredients: KitchenDemoRecipeIngredient[]
  method: string[]
}

export type KitchenDemoRecipeIngredient = {
  ingredientId: string
  quantity: number
  unit: Exclude<KitchenDemoProductionUnit, 'portion'>
  preparation?: string
}

export type KitchenDemoPrepItem = {
  id: string
  name: string
  station: string
  input: KitchenDemoRecipeIngredient
  yield: KitchenDemoProductionAmount
  method: string[]
}

type KitchenDemoMiseRequirementSource =
  | {
      kind: 'prep_item'
      prepItemId: string
    }
  | {
      kind: 'recipe'
      recipeId: string
    }

export type KitchenDemoMiseRequirement = {
  id: string
  title: string
  station: string
  amount: KitchenDemoProductionAmount
  source: KitchenDemoMiseRequirementSource
}

const ingredientComponent = (
  id: string,
  ingredientId: string,
  quantity: number,
  unit: KitchenDemoDishIngredientComponent['unit']
): KitchenDemoDishIngredientComponent => ({
  id,
  source: 'ingredient',
  ingredientId,
  quantity,
  unit,
})

const prepItemComponent = (
  id: string,
  prepItemId: string,
  quantity: number,
  unit: KitchenDemoDishPrepItemComponent['unit']
): KitchenDemoDishPrepItemComponent => ({
  id,
  source: 'prep_item',
  prepItemId,
  quantity,
  unit,
})

const recipeComponent = (
  id: string,
  recipeId: string,
  quantity: number,
  unit: KitchenDemoDishRecipeComponent['unit']
): KitchenDemoDishRecipeComponent => ({
  id,
  source: 'recipe',
  recipeId,
  quantity,
  unit,
})

export const formatKitchenDemoProductionAmount = (
  amount: KitchenDemoProductionAmount
) => `${amount.quantity} ${amount.unit}`

export const deanosKitchenDemoPrepItems: KitchenDemoPrepItem[] = [
  {
    id: 'smash-patty-80g',
    name: '80 g burger ball',
    station: 'Grill',
    input: { ingredientId: 'beef-mince', quantity: 80, unit: 'g' },
    yield: { quantity: 1, unit: 'each' },
    method: [
      'Weigh 80 g of ground beef.',
      'Roll loosely into a ball and hold chilled for service.',
    ],
  },
  {
    id: 'slider-patty-60g',
    name: '60 g slider ball',
    station: 'Grill',
    input: { ingredientId: 'beef-mince', quantity: 60, unit: 'g' },
    yield: { quantity: 1, unit: 'each' },
    method: [
      'Weigh 60 g of ground beef.',
      'Roll loosely into a ball and hold chilled for service.',
    ],
  },
  {
    id: 'washed-shredded-lettuce',
    name: 'Washed shredded lettuce',
    station: 'Prep',
    input: { ingredientId: 'lettuce', quantity: 1000, unit: 'g' },
    yield: { quantity: 850, unit: 'g' },
    method: [
      'Wash and drain the lettuce.',
      'Shred, spin dry and hold chilled.',
    ],
  },
  {
    id: 'split-burger-bun',
    name: 'Split burger bun',
    station: 'Prep',
    input: { ingredientId: 'burger-buns', quantity: 1, unit: 'each' },
    yield: { quantity: 1, unit: 'each' },
    method: ['Split the bun cleanly.', 'Tray ready for service.'],
  },
  {
    id: 'split-slider-bun',
    name: 'Split slider bun',
    station: 'Prep',
    input: { ingredientId: 'slider-buns', quantity: 1, unit: 'each' },
    yield: { quantity: 1, unit: 'each' },
    method: ['Split the bun cleanly.', 'Tray ready for service.'],
  },
  {
    id: 'sliced-swiss-cheese',
    name: 'Sliced Swiss cheese',
    station: 'Prep',
    input: { ingredientId: 'swiss-cheese', quantity: 1000, unit: 'g' },
    yield: { quantity: 1000, unit: 'g' },
    method: ['Slice into 20 g service portions.', 'Cover and hold chilled.'],
  },
  {
    id: 'sliced-cheddar',
    name: 'Sliced cheddar',
    station: 'Prep',
    input: { ingredientId: 'cheddar-cheese', quantity: 1000, unit: 'g' },
    yield: { quantity: 1000, unit: 'g' },
    method: ['Slice into 20 g service portions.', 'Cover and hold chilled.'],
  },
  {
    id: 'sliced-brown-mushrooms',
    name: 'Sliced brown mushrooms',
    station: 'Prep',
    input: { ingredientId: 'brown-mushrooms', quantity: 1000, unit: 'g' },
    yield: { quantity: 900, unit: 'g' },
    method: ['Clean the mushrooms.', 'Slice evenly and hold chilled.'],
  },
  {
    id: 'sliced-tomato',
    name: 'Sliced tomato',
    station: 'Prep',
    input: { ingredientId: 'tomato', quantity: 1000, unit: 'g' },
    yield: { quantity: 900, unit: 'g' },
    method: ['Wash the tomatoes.', 'Slice evenly and hold chilled.'],
  },
  {
    id: 'cauliflower-florets',
    name: 'Portioned cauliflower florets',
    station: 'Prep',
    input: { ingredientId: 'cauliflower', quantity: 1000, unit: 'g' },
    yield: { quantity: 800, unit: 'g' },
    method: ['Trim the cauliflower.', 'Cut into even florets and portion.'],
  },
  {
    id: 'sliced-onion-rings',
    name: 'Sliced and dried onion rings',
    station: 'Prep',
    input: { ingredientId: 'onion', quantity: 1000, unit: 'g' },
    yield: { quantity: 850, unit: 'g' },
    method: [
      'Peel and slice the onions into rings.',
      'Separate and dry thoroughly.',
    ],
  },
  {
    id: 'sliced-spring-onion',
    name: 'Sliced spring onion',
    station: 'Prep',
    input: { ingredientId: 'spring-onion', quantity: 500, unit: 'g' },
    yield: { quantity: 450, unit: 'g' },
    method: [
      'Wash and trim the spring onions.',
      'Slice finely and hold chilled.',
    ],
  },
  {
    id: 'washed-mint',
    name: 'Washed mint',
    station: 'Drinks',
    input: { ingredientId: 'mint', quantity: 100, unit: 'g' },
    yield: { quantity: 90, unit: 'g' },
    method: ['Wash the mint.', 'Spin dry and hold chilled.'],
  },
  {
    id: 'lemon-garnish',
    name: 'Lemon garnish',
    station: 'Drinks',
    input: { ingredientId: 'lemon', quantity: 1000, unit: 'g' },
    yield: { quantity: 40, unit: 'each' },
    method: ['Wash the lemons.', 'Slice into even service garnishes.'],
  },
  {
    id: 'service-ready-vanilla-soft-serve',
    name: 'Service-ready vanilla soft serve',
    station: 'Drinks',
    input: { ingredientId: 'vanilla-soft-serve', quantity: 1000, unit: 'ml' },
    yield: { quantity: 1000, unit: 'ml' },
    method: [
      'Load the soft-serve mix into the machine.',
      'Prime and hold at the safe service temperature.',
    ],
  },
  {
    id: 'washed-basil',
    name: 'Washed basil',
    station: 'Drinks',
    input: { ingredientId: 'basil', quantity: 100, unit: 'g' },
    yield: { quantity: 90, unit: 'g' },
    method: ['Wash the basil.', 'Spin dry and hold chilled.'],
  },
  {
    id: 'sliced-cucumber',
    name: 'Sliced cucumber',
    station: 'Drinks',
    input: { ingredientId: 'cucumber', quantity: 1000, unit: 'g' },
    yield: { quantity: 900, unit: 'g' },
    method: ['Wash the cucumber.', 'Slice evenly and hold chilled.'],
  },
  {
    id: 'washed-rocket',
    name: 'Washed ruccola',
    station: 'Prep',
    input: { ingredientId: 'rocket', quantity: 1000, unit: 'g' },
    yield: { quantity: 900, unit: 'g' },
    method: ['Wash the ruccola carefully.', 'Spin dry and hold chilled.'],
  },
  {
    id: 'cooked-smoked-bacon',
    name: 'Cooked smoked bacon',
    station: 'Grill',
    input: { ingredientId: 'smoked-bacon', quantity: 1000, unit: 'g' },
    yield: { quantity: 700, unit: 'g' },
    method: ['Cook until crisp.', 'Drain and hold ready for service.'],
  },
  {
    id: 'sliced-brie',
    name: 'Sliced Brie',
    station: 'Prep',
    input: { ingredientId: 'brie', quantity: 1000, unit: 'g' },
    yield: { quantity: 950, unit: 'g' },
    method: ['Trim only where required.', 'Slice and hold chilled.'],
  },
  {
    id: 'roast-turkey',
    name: 'Roast turkey',
    station: 'Prep',
    input: { ingredientId: 'turkey-breast', quantity: 1000, unit: 'g' },
    yield: { quantity: 750, unit: 'g' },
    method: [
      'Roast the turkey safely.',
      'Rest, chill and portion for service.',
    ],
  },
]

export const deanosKitchenDemoRecipes: KitchenDemoProductionRecipe[] = [
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
  },
]

export const deanosKitchenDemoSpecs: KitchenDemoDishSpec[] = [
  {
    id: 'deanos-classic-spec',
    dishId: 'deanos-classic',
    station: 'Grill',
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
    station: 'Grill',
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
    station: 'Grill',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Drinks',
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
    station: 'Drinks',
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
    station: 'Drinks',
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
  {
    id: 'classic-smash-slider-platter-spec',
    dishId: 'classic-smash-slider-platter',
    station: 'Grill',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Drinks',
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
    station: 'Drinks',
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
    station: 'Drinks',
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
  },
  {
    id: 'deanos-christmas-stack-spec',
    dishId: 'deanos-christmas-stack',
    station: 'Grill',
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
    station: 'Grill',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Fry',
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
    station: 'Drinks',
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

export const deanosKitchenDemoMenuItemComponentDeltas: KitchenDemoMenuItemComponentDelta[] =
  [
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

const drinksRecipeIds = new Set([
  'salted-caramel-sauce',
  'cherry-vanilla-syrup',
  'house-lemonade-cordial',
  'strawberry-lime-cooler-base',
  'cucumber-mint-cooler-base',
])

export const deanosKitchenDemoMise: KitchenDemoMiseRequirement[] = [
  ...deanosKitchenDemoPrepItems.map(
    (prepItem): KitchenDemoMiseRequirement => ({
      id: `prepare-${prepItem.id}`,
      title: `Prepare ${prepItem.name}`,
      station: prepItem.station,
      amount: { ...prepItem.yield },
      source: {
        kind: 'prep_item',
        prepItemId: prepItem.id,
      },
    })
  ),
  ...deanosKitchenDemoRecipes.map(
    (recipe): KitchenDemoMiseRequirement => ({
      id: `make-${recipe.id}`,
      title: `Make ${recipe.name}`,
      station: drinksRecipeIds.has(recipe.id) ? 'Drinks' : 'Prep',
      amount: { ...recipe.yield },
      source: {
        kind: 'recipe',
        recipeId: recipe.id,
      },
    })
  ),
]

const deanosKitchenDemoDishIds = [
  'deanos-classic',
  'double-trouble',
  'swiss-melt',
  'hot-honey-chicken',
  'ranch-chicken',
  'crispy-cauliflower',
  'skin-on-fries',
  'dirty-deanos-fries',
  'onion-rings',
  'salted-caramel-shake',
  'cherry-vanilla-shake',
  'house-lemonade',
  'classic-smash-slider-platter',
  'hot-honey-chicken-slider-platter',
  'cauliflower-slider-platter',
  'party-fries-tray',
  'party-onion-ring-platter',
  'party-lemonade',
  'party-strawberry-lime-cooler',
  'party-cucumber-mint-cooler',
  'deanos-christmas-stack',
  'turkey-dinner-burger',
  'pigs-in-blankets-waffle-fries',
  'fried-brie-bites',
  'stuffed-mini-yorkshires',
  'gingerbread-caramel-shake',
] as const

const assertUniqueIds = (values: Array<{ id: string }>, label: string) => {
  const ids = values.map((value) => value.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Deanos Demo ${label} ids must be unique.`)
  }
}

const validateComponentReferences = (
  components: KitchenDemoDishComponent[],
  prepItemIds: Set<string>,
  recipeIds: Set<string>,
  context: string
) => {
  for (const component of components) {
    if (component.quantity <= 0) {
      throw new Error(
        `Deanos Demo ${context} has a non-positive component amount.`
      )
    }
    if (
      component.source === 'prep_item' &&
      !prepItemIds.has(component.prepItemId)
    ) {
      throw new Error(
        `Deanos Demo ${context} is missing Prep item ${component.prepItemId}.`
      )
    }
    if (component.source === 'recipe' && !recipeIds.has(component.recipeId)) {
      throw new Error(
        `Deanos Demo ${context} is missing Recipe ${component.recipeId}.`
      )
    }
  }
}

const validateDeanosKitchenDemoProduction = () => {
  assertUniqueIds(deanosKitchenDemoPrepItems, 'Prep item')
  assertUniqueIds(deanosKitchenDemoRecipes, 'Recipe')
  assertUniqueIds(deanosKitchenDemoSpecs, 'Dish Spec')
  assertUniqueIds(deanosKitchenDemoMenuItemComponentDeltas, 'Menu item delta')
  assertUniqueIds(deanosKitchenDemoMise, 'Mise requirement')

  const expectedDishIds = new Set<string>(deanosKitchenDemoDishIds)
  const specDishIds = deanosKitchenDemoSpecs.map((spec) => spec.dishId)
  if (
    specDishIds.length !== expectedDishIds.size ||
    specDishIds.some((dishId) => !expectedDishIds.has(dishId)) ||
    expectedDishIds.size !== new Set(specDishIds).size
  ) {
    throw new Error(
      'Deanos Demo must have exactly one Dish Spec for each of its 26 Dishes.'
    )
  }

  const prepItemIds = new Set(deanosKitchenDemoPrepItems.map((item) => item.id))
  const recipeIds = new Set(deanosKitchenDemoRecipes.map((recipe) => recipe.id))

  for (const spec of deanosKitchenDemoSpecs) {
    validateComponentReferences(
      spec.components,
      prepItemIds,
      recipeIds,
      `Dish Spec ${spec.id}`
    )
  }
  for (const delta of deanosKitchenDemoMenuItemComponentDeltas) {
    validateComponentReferences(
      delta.components,
      prepItemIds,
      recipeIds,
      `Menu item delta ${delta.id}`
    )
  }
  for (const requirement of deanosKitchenDemoMise) {
    const sourceExists =
      requirement.source.kind === 'prep_item'
        ? prepItemIds.has(requirement.source.prepItemId)
        : recipeIds.has(requirement.source.recipeId)
    if (!sourceExists) {
      throw new Error(
        `Deanos Demo Mise requirement ${requirement.id} has no production source.`
      )
    }
  }
}

validateDeanosKitchenDemoProduction()
