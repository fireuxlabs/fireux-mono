import type {
  Ingredient,
  KitchenIngredient as KitchenIngredientDoc,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import {
  assertAllKitchenIngredientsResolve,
  buildDish,
  buildIngredient,
  buildKitchenIngredient,
  buildMenu,
  buildMise,
  buildReadOnlyStations,
  buildReadOnlySupplierIngredients,
  buildReadOnlySuppliers,
  buildReadOnlyTrainingModules,
} from '../_shared/builders'
import { createReadOnlyKitchen } from '../_shared/kitchen'
import type { DummyRecipe, DummyScenario } from '../_shared/types'

export const takumiRamenScenario = (): DummyScenario => {
  const kitchen = createReadOnlyKitchen({
    id: 'takumi-ramen',
    name: 'Takumi Ramen-ya',
    shortName: 'Takumi',
    shortAddress: 'Old Town',
    formattedAddress: 'Demo Location - Old Town',
    imageUrl:
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=640&h=520&q=80',
  })

  const kitchenId = String(kitchen.id || '').trim()

  const ingredientIds = {
    chickenBones: 'chicken-bones',
    kombu: 'kombu',
    katsuobushi: 'katsuobushi',
    niboshi: 'niboshi',
    garlic: 'garlic-bulb',
    ginger: 'ginger',
    springOnion: 'spring-onion',
    whiteOnion: 'white-onion',
    seaSalt: 'sea-salt',
    shoyu: 'soy-sauce',
    mirin: 'mirin',
    sake: 'sake',
    sesameOil: 'sesame-oil',
    chickenFat: 'chicken-fat',
    ramenNoodles: 'ramen-noodles',
    egg: 'egg',
    nori: 'nori',
    bambooShoots: 'bamboo-shoots',
    corn: 'sweetcorn',
    butter: 'butter',
    mushrooms: 'shiitake-mushroom',
    porkBelly: 'pork-belly',
  } as const

  const globalIngredientSeed: Array<
    Pick<Ingredient, 'id' | 'name' | 'image_url' | 'app_id'>
  > = [
    { id: ingredientIds.chickenBones, name: 'Chicken Bones', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.kombu, name: 'Kombu', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.katsuobushi, name: 'Katsuobushi', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.niboshi, name: 'Niboshi', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.garlic, name: 'Garlic Bulb', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.ginger, name: 'Ginger', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.springOnion, name: 'Spring Onion', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.whiteOnion, name: 'White Onion', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.seaSalt, name: 'Sea Salt', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.shoyu, name: 'Soy Sauce', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.mirin, name: 'Mirin', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.sake, name: 'Sake', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.sesameOil, name: 'Sesame Oil', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.chickenFat, name: 'Chicken Fat', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.ramenNoodles, name: 'Ramen Noodles', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.egg, name: 'Egg', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.nori, name: 'Nori', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.bambooShoots, name: 'Bamboo Shoots', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.corn, name: 'Sweetcorn', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.butter, name: 'Butter', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.mushrooms, name: 'Shiitake Mushroom', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.porkBelly, name: 'Pork Belly', image_url: '', app_id: 'misebox-app' },
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
    scenarioName: 'takumiRamenScenario',
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

  const serviceDate = '2026-02-13'

  const kitchenMiseTasks = [
    buildMise({
      kitchenId,
      overrides: {
        id: 'broth-start',
        title: 'Start chicken broth (bones + aromatics)',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [
          ingredientIds.chickenBones,
          ingredientIds.garlic,
          ingredientIds.ginger,
          ingredientIds.whiteOnion,
        ],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'dashi-batch',
        title: 'Make dashi (kombu + katsuobushi + niboshi)',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [ingredientIds.kombu, ingredientIds.katsuobushi, ingredientIds.niboshi],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'tare-shio',
        title: 'Prep shio tare (salt base seasoning)',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [ingredientIds.seaSalt, ingredientIds.mirin, ingredientIds.sake],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'tare-shoyu',
        title: 'Prep shoyu tare (soy base seasoning)',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [ingredientIds.shoyu, ingredientIds.mirin, ingredientIds.sake],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'ajitama',
        title: 'Marinate eggs (ajitama)',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [ingredientIds.egg, ingredientIds.shoyu, ingredientIds.mirin],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'chashu',
        title: 'Braise pork belly (chashu)',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [ingredientIds.porkBelly, ingredientIds.shoyu, ingredientIds.mirin, ingredientIds.sake],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'slice-spring-onion',
        title: 'Slice spring onions',
        service_date: serviceDate,
        status: 'todo',
        ingredient_ids: [ingredientIds.springOnion],
      },
    }),
  ]

  const kitchenDishes = [
    buildDish({
      kitchenId,
      overrides: {
        id: 'shio-ramen',
        name: 'Shio Ramen',
        description: 'Clear chicken + dashi broth with shio tare, noodles, egg and nori.',
        status: 'active',
        recipe_ids: [
          'recipe-chicken-dashi-broth',
          'recipe-shio-tare',
          'recipe-chashu',
          'recipe-ajitama-eggs',
        ],
        ingredient_ids: [
          ingredientIds.chickenBones,
          ingredientIds.kombu,
          ingredientIds.katsuobushi,
          ingredientIds.niboshi,
          ingredientIds.seaSalt,
          ingredientIds.ramenNoodles,
          ingredientIds.egg,
          ingredientIds.nori,
          ingredientIds.springOnion,
        ],
        mise_ids: ['broth-start', 'dashi-batch', 'tare-shio', 'ajitama', 'slice-spring-onion'],
        sort_order: 1,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'shoyu-ramen',
        name: 'Shoyu Ramen',
        description: 'Chicken broth with soy tare, chashu and bamboo shoots.',
        status: 'active',
        recipe_ids: [
          'recipe-chicken-dashi-broth',
          'recipe-shio-tare',
          'recipe-chashu',
          'recipe-ajitama-eggs',
        ],
        ingredient_ids: [
          ingredientIds.chickenBones,
          ingredientIds.shoyu,
          ingredientIds.ramenNoodles,
          ingredientIds.porkBelly,
          ingredientIds.bambooShoots,
          ingredientIds.egg,
          ingredientIds.springOnion,
        ],
        mise_ids: ['broth-start', 'tare-shoyu', 'chashu', 'ajitama', 'slice-spring-onion'],
        sort_order: 2,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'miso-corn-butter-ramen',
        name: 'Corn & Butter Ramen',
        description: 'Comfort bowl with corn, butter, sesame aroma oil and spring onion.',
        status: 'active',
        recipe_ids: ['recipe-chicken-dashi-broth', 'recipe-shio-tare'],
        ingredient_ids: [
          ingredientIds.ramenNoodles,
          ingredientIds.corn,
          ingredientIds.butter,
          ingredientIds.sesameOil,
          ingredientIds.springOnion,
          ingredientIds.nori,
        ],
        mise_ids: ['slice-spring-onion'],
        sort_order: 3,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'veg-mushroom-ramen',
        name: 'Mushroom Ramen',
        description: 'Shiitake-forward bowl with sesame oil and nori.',
        status: 'active',
        recipe_ids: ['recipe-chicken-dashi-broth', 'recipe-shio-tare'],
        ingredient_ids: [
          ingredientIds.mushrooms,
          ingredientIds.ramenNoodles,
          ingredientIds.sesameOil,
          ingredientIds.nori,
          ingredientIds.springOnion,
        ],
        mise_ids: ['slice-spring-onion'],
        sort_order: 4,
        active: true,
      },
    }),
  ]

  const kitchenMenus = [
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-ramen-bowls',
        name: 'Ramen Bowls',
        description: 'Signature bowls for all-day service.',
        active: true,
        dish_ids: ['shio-ramen', 'shoyu-ramen', 'miso-corn-butter-ramen', 'veg-mushroom-ramen'],
        sort_order: 1,
        stations: ['prep', 'pass'],
      },
    }),
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-ramen-late',
        name: 'Late Bowl Menu',
        description: 'Reduced bowl lineup for late service.',
        active: true,
        dish_ids: ['shio-ramen', 'veg-mushroom-ramen'],
        sort_order: 2,
        stations: ['prep', 'pass'],
      },
    }),
  ]

  const kitchenRecipes: DummyRecipe[] = [
    {
      id: 'recipe-chicken-dashi-broth',
      name: 'Chicken + Dashi Broth',
      description: 'Clear chicken broth finished with kombu/katsuobushi dashi.',
      status: 'active',
      yield_qty: 10,
      yield_unit: 'litres',
      prep_minutes: 25,
      cook_minutes: 240,
      ingredient_lines: [
        { ingredient_name: 'Chicken Bones', quantity: 6, unit: 'kg' },
        { ingredient_name: 'Kombu', quantity: 40, unit: 'g' },
        { ingredient_name: 'Katsuobushi', quantity: 60, unit: 'g' },
        { ingredient_name: 'Niboshi', quantity: 30, unit: 'g' },
        { ingredient_name: 'Ginger', quantity: 80, unit: 'g' },
        { ingredient_name: 'Garlic Bulb', quantity: 40, unit: 'g' },
        { ingredient_name: 'White Onion', quantity: 600, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Rinse bones; start cold in stock pot.' },
        { order: 2, title: 'Bring up slowly; skim hard for clarity.' },
        { order: 3, title: 'Add aromatics; simmer 3-4 hours.' },
        { order: 4, title: 'Make dashi: steep kombu, then add katsuobushi + niboshi; strain.' },
        { order: 5, title: 'Combine, taste, and hold hot or chill fast.' },
      ],
    },
    {
      id: 'recipe-shio-tare',
      name: 'Shio Tare',
      description: 'Salt seasoning base for shio ramen.',
      status: 'active',
      yield_qty: 1,
      yield_unit: 'litre',
      prep_minutes: 10,
      cook_minutes: 5,
      ingredient_lines: [
        { ingredient_name: 'Sea Salt', quantity: 180, unit: 'g' },
        { ingredient_name: 'Mirin', quantity: 300, unit: 'ml' },
        { ingredient_name: 'Sake', quantity: 300, unit: 'ml' },
      ],
      steps: [
        { order: 1, title: 'Warm mirin + sake; simmer 2-3 min.' },
        { order: 2, title: 'Whisk in salt until dissolved.' },
        { order: 3, title: 'Cool, label, date.' },
      ],
    },
    {
      id: 'recipe-ajitama-eggs',
      name: 'Ajitama Eggs',
      description: 'Marinated eggs for topping (jammy yolk).',
      status: 'active',
      yield_qty: 20,
      yield_unit: 'eggs',
      prep_minutes: 15,
      cook_minutes: 7,
      ingredient_lines: [
        { ingredient_name: 'Egg', quantity: 20, unit: 'pc' },
        { ingredient_name: 'Soy Sauce', quantity: 400, unit: 'ml' },
        { ingredient_name: 'Mirin', quantity: 200, unit: 'ml' },
        { ingredient_name: 'Sake', quantity: 200, unit: 'ml' },
      ],
      steps: [
        { order: 1, title: 'Boil eggs 6.5-7 min; ice bath; peel.' },
        { order: 2, title: 'Mix soy/mirin/sake; chill.' },
        { order: 3, title: 'Marinate 8-12 hours; rotate for even colour.' },
      ],
    },
    {
      id: 'recipe-chashu',
      name: 'Chashu Pork Belly',
      description: 'Braise pork belly, slice for service.',
      status: 'active',
      yield_qty: 2,
      yield_unit: 'kg',
      prep_minutes: 20,
      cook_minutes: 150,
      ingredient_lines: [
        { ingredient_name: 'Pork Belly', quantity: 2000, unit: 'g' },
        { ingredient_name: 'Soy Sauce', quantity: 400, unit: 'ml' },
        { ingredient_name: 'Mirin', quantity: 250, unit: 'ml' },
        { ingredient_name: 'Sake', quantity: 250, unit: 'ml' },
        { ingredient_name: 'Ginger', quantity: 60, unit: 'g' },
        { ingredient_name: 'Spring Onion', quantity: 80, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Roll/tie belly (optional) for clean slices.' },
        { order: 2, title: 'Sear lightly; add braise liquids + aromatics.' },
        { order: 3, title: 'Braise low 2-2.5h until tender.' },
        { order: 4, title: 'Cool in liquor; slice cold; reheat portions to order.' },
      ],
    },
  ]

  const kitchenStations = buildReadOnlyStations(kitchenId)
  const kitchenTeamMembers: Array<Record<string, unknown>> = [
    {
      id: 'team-tr-01',
      kitchen_id: kitchenId,
      name: 'Kenji Sato',
      role: 'Head Chef',
      station: 'pass',
      is_lead: true,
      contact: { email: 'kenji@takumi.demo', phone: '+41 79 000 0101' },
      tags: ['lead', 'ramen', 'quality'],
    },
    {
      id: 'team-tr-02',
      kitchen_id: kitchenId,
      name: 'Noah Meier',
      role: 'Ramen Cook',
      station: 'grill',
      is_lead: false,
      contact: { email: 'noah@takumi.demo', phone: '+41 79 000 0102' },
      tags: ['noodles', 'service'],
    },
    {
      id: 'team-tr-03',
      kitchen_id: kitchenId,
      name: 'Yuna Park',
      role: 'Prep Cook',
      station: 'prep',
      is_lead: false,
      contact: { email: 'yuna@takumi.demo', phone: '+41 79 000 0103' },
      tags: ['prep', 'broth', 'mise'],
    },
  ]
  const kitchenSuppliers = buildReadOnlySuppliers(kitchenId)
  const kitchenSupplierIngredients = buildReadOnlySupplierIngredients(kitchenId)
  const kitchenPurchases: Array<Record<string, unknown>> = []
  const kitchenIncomingOrders: Array<Record<string, unknown>> = []
  const trainingModules = buildReadOnlyTrainingModules(kitchenId)
  const haccpChecks: Array<Record<string, unknown>> = [
    {
      id: 'haccp-tr-01',
      kitchen_id: kitchenId,
      type: 'fridge_temp',
      title: 'Fridge temp log',
      frequency: 'daily',
      target: { max_c: 5 },
      last_recorded: '2026-02-13',
      status: 'ok',
    },
    {
      id: 'haccp-tr-02',
      kitchen_id: kitchenId,
      type: 'hot_hold',
      title: 'Broth hot hold',
      frequency: 'service',
      target: { min_c: 63 },
      last_recorded: '2026-02-13',
      status: 'ok',
    },
    {
      id: 'haccp-tr-03',
      kitchen_id: kitchenId,
      type: 'cooling',
      title: 'Broth cooling check',
      frequency: 'per_batch',
      target: { required: true },
      last_recorded: '2026-02-13',
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

const takumiRamenKitchenId = 'takumi-ramen'

export const buildKitchenIngredientForTakumiRamen = (
  ingredient: Ingredient,
  overrides: Partial<KitchenIngredientDoc> = {}
) =>
  buildKitchenIngredient({
    kitchenId: takumiRamenKitchenId,
    ingredient,
    overrides,
  })
