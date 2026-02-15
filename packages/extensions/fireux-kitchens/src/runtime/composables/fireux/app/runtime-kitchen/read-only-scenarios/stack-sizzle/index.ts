import type {
  Ingredient,
  KitchenIngredient as KitchenIngredientDoc,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import { createReadOnlyKitchen } from '../_shared/kitchen'
import {
  assertAllKitchenIngredientsResolve,
  buildDish,
  buildIngredient,
  buildKitchenIngredient,
  buildMenu,
  buildMise,
} from '../_shared/builders'
import type { DummyRecipe, DummyScenario } from '../_shared/types'

export const stackSizzleScenario = (): DummyScenario => {
  const kitchen = createReadOnlyKitchen({
    id: 'stack-sizzle',
    name: 'Stack & Sizzle',
  })

  const kitchenId = String(kitchen.id || '').trim()

  const ingredientIds = {
    // Burger
    beefPatty: 'beef-patty',
    bun: 'burger-buns',
    lettuce: 'lettuce',
    tomato: 'tomato',

    // Tomato variants
    cherryTomato: 'cherry-tomato',
    sanMarzanoTomato: 'san-marzano-tomato',

    // Basics for salad/soup
    avocadoOil: 'avocado-oil',
    seaSalt: 'sea-salt',
    blackPepper: 'black-pepper',
    garlic: 'garlic-bulb',
    whiteOnion: 'white-onion',
  } as const

  const globalIngredientSeed: Array<
    Pick<Ingredient, 'id' | 'name' | 'image_url' | 'app_id'>
  > = [
    {
      id: 'american-cheese',
      name: 'American Cheese',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Famerican-cheese%2Fimage_url?alt=media&token=c57b8916-1a20-4b03-8b81-53b9fd19e2d7',
      app_id: 'misebox-app',
    },
    {
      id: 'avocado-oil',
      name: 'Avocado Oil',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Favocado-oil%2Fimage_url?alt=media&token=910a4b6e-19a9-4c57-9583-95f819e2f216',
      app_id: 'misebox-app',
    },
    {
      id: 'bacon',
      name: 'Bacon',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fbacon%2Fimage_url?alt=media&token=d80da4fa-d731-4c1b-b789-838febfa3237',
      app_id: 'misebox-app',
    },
    {
      id: 'baked-beans',
      name: 'Baked Beans',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fbaked-beans%2Fimage_url?alt=media&token=19b770df-55ff-4125-8a95-a517ce2ec2d7',
      app_id: 'misebox-app',
    },
    {
      id: 'beef-patty',
      name: 'Beef Patty',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FoAjH2J6d7AWdGOtEcfmk%2Fimage_url.jpg?alt=media&token=5fd4decd-57c7-4ce8-86ef-682f2d7b972f',
      app_id: 'misebox-app',
    },
    {
      id: 'black-pepper',
      name: 'Black Pepper',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fblack-pepper%2Fimage_url?alt=media&token=57ba7122-57dd-4f36-a98a-ae5699d2e8b9',
      app_id: 'misebox-app',
    },
    {
      id: 'burger-buns',
      name: 'Burger Buns',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fcc2xKU4FbCeZm5mv0pWW%2Fimage_url.jpg?alt=media&token=4ba9aea0-75b2-4c1a-b798-2360f64f7e16',
      app_id: 'misebox-app',
    },
    {
      id: 'chicken-breast',
      name: 'Chicken Breast',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fchicken-breast%2Fimage_url?alt=media&token=2c8f200f-39b5-4071-91a8-3b6a142f6ccf',
      app_id: 'misebox-app',
    },
    {
      id: 'english-muffin',
      name: 'English Muffin',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fenglish-muffin%2Fimage_url?alt=media&token=7d853712-ddde-47d4-9a78-cef428c31b7d',
      app_id: 'misebox-app',
    },
    {
      id: 'flat-mushroom',
      name: 'Flat Mushroom',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fflat-mushroom%2Fimage_url?alt=media&token=72ab7c4f-2f48-4747-9d64-f49c9b9dde61',
      app_id: 'misebox-app',
    },
    { id: 'fryer-oil', name: 'Fryer Oil', image_url: '', app_id: 'misebox-app' },
    { id: 'garlic-bulb', name: 'Garlic Bulb', image_url: '', app_id: 'misebox-app' },
    { id: 'ham-slice', name: 'Ham Slice', image_url: '', app_id: 'misebox-app' },
    {
      id: 'jalapeno',
      name: 'Jalapeno',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fjalapeno%2Fimage_url?alt=media&token=b92122f7-76aa-42f3-a59f-175be143f3c9',
      app_id: 'misebox-app',
    },
    {
      id: 'ketchup',
      name: 'Ketchup',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Ftz9pN7sTBVeOIMtnHgp1%2Fimage_url.jpg?alt=media&token=e827c480-e2c0-4a8e-92c0-0136ae5e93da',
      app_id: 'misebox-app',
    },
    {
      id: 'lemon',
      name: 'Lemon',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FYiEySWR2eEsadcoYsCLz%2Fimage_url.jpg?alt=media&token=d477f897-539d-4c0b-8abf-a90700531c34',
      app_id: 'misebox-app',
    },
    {
      id: 'lettuce',
      name: 'Lettuce',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FwZ6yS0vxqOTnkdFenM3W%2Fimage_url.jpg?alt=media&token=49696907-ca51-42b8-8e5d-0bcdd5119794',
      app_id: 'misebox-app',
    },
    {
      id: 'lime',
      name: 'Lime',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Flime%2Fimage_url?alt=media&token=05a8d476-358e-4f25-a262-6d4a9317cb00',
      app_id: 'misebox-app',
    },
    {
      id: 'pork-sausage',
      name: 'Pork Sausage',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fpork-sausage%2Fimage_url?alt=media&token=4da0feb2-4ef6-4d7f-9abf-6da4bd774d32',
      app_id: 'misebox-app',
    },
    { id: 'potato', name: 'Potatoes', image_url: '', app_id: 'misebox-app' },
    {
      id: 'sea-salt',
      name: 'Sea Salt',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fsea-salt%2Fimage_url?alt=media&token=46c0bbbb-1f24-4429-98e2-2190f84fecca',
      app_id: 'misebox-app',
    },
    { id: 'smoked-salmon', name: 'Smoked Salmon', image_url: '', app_id: 'misebox-app' },
    { id: 'spinach', name: 'Spinach', image_url: '', app_id: 'misebox-app' },
    {
      id: 'tomato',
      name: 'Tomato',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2F3COhy9KZU5yelq08HvZx%2Fimage_url.jpg?alt=media&token=6894fdc7-edc3-42b6-8591-c369d7674b4d',
      app_id: 'misebox-app',
    },
    { id: 'veggie-patty', name: 'Veggie Patty', image_url: '', app_id: 'misebox-app' },
    { id: 'veggie-sausage', name: 'Veggie Sausage', image_url: '', app_id: 'misebox-app' },
    {
      id: 'white-onion',
      name: 'White Onion',
      image_url:
        'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fwhite-onion%2Fimage_url?alt=media&token=65dc1e6d-4866-4305-a023-81aa069c700e',
      app_id: 'misebox-app',
    },
    { id: 'cherry-tomato', name: 'Cherry Tomato', image_url: '', app_id: 'misebox-app' },
    {
      id: 'san-marzano-tomato',
      name: 'San Marzano Tomato',
      image_url: '',
      app_id: 'misebox-app',
    },
  ]

  const globalIngredients: Ingredient[] = globalIngredientSeed.map((entry) =>
    buildIngredient(entry)
  )

  const globalIngredientById = new Map(
    globalIngredients
      .map((ingredient) => [String(ingredient.id || '').trim(), ingredient] as const)
      .filter(([id]) => Boolean(id))
  )

  const kitchenIngredientIds = Object.values(ingredientIds).map((id) => String(id || '').trim())

  assertAllKitchenIngredientsResolve({
    scenarioName: 'stackSizzleScenario',
    kitchenId,
    kitchenIngredientIds,
    globalIngredientById,
  })

  const kitchenIngredients: KitchenIngredientDoc[] = kitchenIngredientIds
    .map((ingredientId) => {
      const ingredient = globalIngredientById.get(ingredientId)
      if (!ingredient) return null
      return buildKitchenIngredient({ kitchenId, ingredient })
    })
    .filter((ingredient): ingredient is KitchenIngredientDoc => Boolean(ingredient))

  const kitchenMiseTasks = [
    buildMise({
      kitchenId,
      overrides: {
        id: 'slice-tomato',
        title: 'Slice tomato',
        service_date: '2026-02-12',
        status: 'todo',
        ingredient_ids: [ingredientIds.tomato],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'wash-lettuce',
        title: 'Wash lettuce',
        service_date: '2026-02-12',
        status: 'todo',
        ingredient_ids: [ingredientIds.lettuce],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'dice-onion',
        title: 'Dice onion',
        service_date: '2026-02-12',
        status: 'todo',
        ingredient_ids: [ingredientIds.whiteOnion],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'crush-garlic',
        title: 'Crush garlic',
        service_date: '2026-02-12',
        status: 'todo',
        ingredient_ids: [ingredientIds.garlic],
      },
    }),
  ]

  const kitchenDishes = [
    buildDish({
      kitchenId,
      overrides: {
        id: 'classic-burger',
        name: 'Classic Smash',
        description: 'Double smash burger, cheddar, lettuce, tomato, house style.',
        status: 'active',
        recipe_ids: ['recipe-classic-beef-patty'],
        ingredient_ids: [
          ingredientIds.beefPatty,
          ingredientIds.bun,
          ingredientIds.lettuce,
          ingredientIds.tomato,
        ],
        mise_ids: ['slice-tomato', 'wash-lettuce'],
        sort_order: 1,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'tomato-salad',
        name: 'Tomato Salad',
        description: 'Cherry tomato salad with lettuce, oil, salt and pepper.',
        status: 'active',
        recipe_ids: ['recipe-cherry-tomato-salad'],
        ingredient_ids: [
          ingredientIds.cherryTomato,
          ingredientIds.lettuce,
          ingredientIds.avocadoOil,
          ingredientIds.seaSalt,
          ingredientIds.blackPepper,
        ],
        mise_ids: ['wash-lettuce'],
        sort_order: 2,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'tomato-soup',
        name: 'Tomato Soup',
        description: 'San Marzano tomato soup with onion and garlic.',
        status: 'active',
        recipe_ids: ['recipe-tomato-soup-base'],
        ingredient_ids: [
          ingredientIds.sanMarzanoTomato,
          ingredientIds.whiteOnion,
          ingredientIds.garlic,
          ingredientIds.avocadoOil,
          ingredientIds.seaSalt,
          ingredientIds.blackPepper,
        ],
        mise_ids: ['dice-onion', 'crush-garlic'],
        sort_order: 3,
        active: true,
      },
    }),
  ]

  const kitchenMenus = [
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-burger-core',
        name: 'Core Menu',
        description: 'Burgers, salad, and soup for everyday service.',
        status: 'live',
        service: 'all_day',
        dish_ids: ['classic-burger', 'tomato-salad', 'tomato-soup'],
        sort_order: 1,
        active: true,
      },
    }),
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-burger-late',
        name: 'Late Menu',
        description: 'Smaller lineup for quieter late service.',
        status: 'draft',
        service: 'dinner',
        dish_ids: ['classic-burger', 'tomato-salad'],
        sort_order: 2,
        active: true,
      },
    }),
  ]

  const kitchenRecipes: DummyRecipe[] = [
    {
      id: 'recipe-classic-beef-patty',
      name: 'Classic Beef Patty',
      description: 'Season, form, and chill patties ready for service.',
      status: 'active',
      yield_qty: 10,
      yield_unit: 'patties',
      prep_minutes: 15,
      cook_minutes: 0,
      ingredient_lines: [
        { ingredient_name: 'Beef Patty', quantity: 10, unit: 'pc' },
        { ingredient_name: 'Sea Salt', quantity: 10, unit: 'g' },
        { ingredient_name: 'Black Pepper', quantity: 3, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Portion mince into 100g balls.' },
        { order: 2, title: 'Press into patties; season both sides.' },
        { order: 3, title: 'Chill on tray (covered) until service.' },
      ],
    },
    {
      id: 'recipe-tomato-soup-base',
      name: 'Tomato Soup Base',
      description: 'San Marzano tomato base with onion + garlic for quick pickup.',
      status: 'active',
      yield_qty: 4,
      yield_unit: 'litres',
      prep_minutes: 20,
      cook_minutes: 45,
      ingredient_lines: [
        { ingredient_name: 'San Marzano Tomato', quantity: 2, unit: 'kg' },
        { ingredient_name: 'White Onion', quantity: 400, unit: 'g' },
        { ingredient_name: 'Garlic Bulb', quantity: 30, unit: 'g' },
        { ingredient_name: 'Avocado Oil', quantity: 60, unit: 'ml' },
        { ingredient_name: 'Sea Salt', quantity: 12, unit: 'g' },
        { ingredient_name: 'Black Pepper', quantity: 3, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Sweat diced onion in oil until soft.' },
        { order: 2, title: 'Add crushed garlic; cook 1 minute.' },
        { order: 3, title: 'Add tomatoes + seasoning; simmer 35-45 min.' },
        { order: 4, title: 'Blend smooth; adjust seasoning.' },
      ],
    },
    {
      id: 'recipe-cherry-tomato-salad',
      name: 'Cherry Tomato Salad',
      description: 'Fast salad prep for service (wash, toss, season).',
      status: 'active',
      yield_qty: 6,
      yield_unit: 'portions',
      prep_minutes: 10,
      cook_minutes: 0,
      ingredient_lines: [
        { ingredient_name: 'Cherry Tomato', quantity: 600, unit: 'g' },
        { ingredient_name: 'Lettuce', quantity: 2, unit: 'heads' },
        { ingredient_name: 'Avocado Oil', quantity: 45, unit: 'ml' },
        { ingredient_name: 'Sea Salt', quantity: 8, unit: 'g' },
        { ingredient_name: 'Black Pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Wash + spin lettuce; chill.' },
        { order: 2, title: 'Halve cherry tomatoes.' },
        { order: 3, title: 'Toss with oil, salt, pepper right before service.' },
      ],
    },
  ]

  const kitchenStations: Array<Record<string, unknown>> = [
    {
      id: 'station-grill',
      kitchen_id: kitchenId,
      name: 'Grill',
      key: 'grill',
      description: 'Smash station: patties, buns, cheese melt.',
      sort_order: 1,
      active: true,
    },
    {
      id: 'station-fryer',
      kitchen_id: kitchenId,
      name: 'Fryer',
      key: 'fryer',
      description: 'Fries + crispy sides.',
      sort_order: 2,
      active: true,
    },
    {
      id: 'station-cold',
      kitchen_id: kitchenId,
      name: 'Cold',
      key: 'cold',
      description: 'Salads, sauces, garnish.',
      sort_order: 3,
      active: true,
    },
    {
      id: 'station-pass',
      kitchen_id: kitchenId,
      name: 'Pass',
      key: 'pass',
      description: 'Assembly + checks + send.',
      sort_order: 4,
      active: true,
    },
  ]
  const kitchenTeamMembers: Array<Record<string, unknown>> = [
    {
      id: 'team-ss-01',
      kitchen_id: kitchenId,
      name: 'Ava Rossi',
      role: 'Head Chef',
      station: 'pass',
      is_lead: true,
      contact: { email: 'ava@stackandsizzle.demo', phone: '+41 79 000 0001' },
      tags: ['lead', 'service', 'training'],
    },
    {
      id: 'team-ss-02',
      kitchen_id: kitchenId,
      name: 'Liam Keller',
      role: 'Line Cook',
      station: 'grill',
      is_lead: false,
      contact: { email: 'liam@stackandsizzle.demo', phone: '+41 79 000 0002' },
      tags: ['grill', 'prep'],
    },
    {
      id: 'team-ss-03',
      kitchen_id: kitchenId,
      name: 'Maya Chen',
      role: 'Prep Cook',
      station: 'prep',
      is_lead: false,
      contact: { email: 'maya@stackandsizzle.demo', phone: '+41 79 000 0003' },
      tags: ['prep', 'stock', 'hygiene'],
    },
  ]
  const kitchenSuppliers: Array<Record<string, unknown>> = [
    {
      id: 'supplier-butcher-01',
      kitchen_id: kitchenId,
      name: 'Old Town Butchers',
      kind: 'butcher',
      contact: { email: 'orders@oldtownbutchers.demo', phone: '+41 79 100 0001' },
      lead_time_days: 1,
      notes: 'Daily mince + patty supply.',
      active: true,
    },
    {
      id: 'supplier-produce-01',
      kitchen_id: kitchenId,
      name: 'Market Greens Co.',
      kind: 'produce',
      contact: { email: 'sales@marketgreens.demo', phone: '+41 79 100 0002' },
      lead_time_days: 2,
      notes: 'Lettuce + tomatoes + onions.',
      active: true,
    },
    {
      id: 'supplier-bakery-01',
      kitchen_id: kitchenId,
      name: 'Sunrise Bakery',
      kind: 'bakery',
      contact: { email: 'hello@sunrisebakery.demo', phone: '+41 79 100 0003' },
      lead_time_days: 1,
      notes: 'Brioche buns, deliver mornings.',
      active: true,
    },
  ]
  const kitchenSupplierIngredients: Array<Record<string, unknown>> = []
  const kitchenPurchases: Array<Record<string, unknown>> = []
  const kitchenIncomingOrders: Array<Record<string, unknown>> = []
  const trainingModules: Array<Record<string, unknown>> = [
    {
      id: 'train-ss-01',
      kitchen_id: kitchenId,
      title: 'Smash station basics',
      description: 'Patty smash technique, bun toast, cheese melt timing.',
      status: 'published',
      minutes: 25,
      tags: ['grill', 'service'],
    },
    {
      id: 'train-ss-02',
      kitchen_id: kitchenId,
      title: 'Allergen + cross-contamination',
      description: 'Core allergens, glove policy, clean-down routine.',
      status: 'published',
      minutes: 20,
      tags: ['hygiene', 'haccp'],
    },
    {
      id: 'train-ss-03',
      kitchen_id: kitchenId,
      title: 'Closing checklist',
      description: 'Line breakdown, labeling, safe cooling, trash, mop.',
      status: 'draft',
      minutes: 15,
      tags: ['close', 'ops'],
    },
  ]
  const haccpChecks: Array<Record<string, unknown>> = [
    {
      id: 'haccp-ss-01',
      kitchen_id: kitchenId,
      type: 'fridge_temp',
      title: 'Fridge temp log',
      frequency: 'daily',
      target: { max_c: 5 },
      last_recorded: '2026-02-12',
      status: 'ok',
    },
    {
      id: 'haccp-ss-02',
      kitchen_id: kitchenId,
      type: 'cook_temp',
      title: 'Cook temp: beef patties',
      frequency: 'per_batch',
      target: { min_c: 63 },
      last_recorded: '2026-02-12',
      status: 'ok',
    },
    {
      id: 'haccp-ss-03',
      kitchen_id: kitchenId,
      type: 'cleaning',
      title: 'Grill scrape + sanitize',
      frequency: 'daily',
      target: { required: true },
      last_recorded: '2026-02-12',
      status: 'due',
    },
  ]

  return {
    kitchen,
    globalIngredients,
    kitchenIngredients,
    teamMembers: kitchenTeamMembers,
    menuStack: {
      kitchenId,
      ingredientIds: ingredientIds as unknown as Record<string, string>,
      stations: kitchenStations,
      recipes: kitchenRecipes,
      miseTasks: kitchenMiseTasks,
      dishes: kitchenDishes,
      menus: kitchenMenus,
    },
    procurementStack: {
      kitchenId,
      suppliers: kitchenSuppliers,
      supplierIngredients: kitchenSupplierIngredients,
      purchases: kitchenPurchases,
    },
    serviceStack: {
      kitchenId,
      incomingOrders: kitchenIncomingOrders,
    },
    trainingStack: {
      kitchenId,
      modules: trainingModules,
    },
    haccpStack: {
      kitchenId,
      checks: haccpChecks,
    },
  }
}

const stackSizzleKitchenId = 'stack-sizzle'

export const buildKitchenIngredientForStackSizzle = (
  ingredient: Ingredient,
  overrides: Partial<KitchenIngredientDoc> = {}
) =>
  buildKitchenIngredient({
    kitchenId: stackSizzleKitchenId,
    ingredient,
    overrides,
  })
