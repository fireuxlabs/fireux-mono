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
  buildReadOnlySupplierIngredients,
  buildReadOnlyStations,
  buildReadOnlySuppliers,
  buildReadOnlyTrainingModules,
} from '../_shared/builders'
import type { DummyRecipe, DummyScenario } from '../_shared/types'

export const stackSizzleScenario = (): DummyScenario => {
  const kitchen = createReadOnlyKitchen({
    id: 'stack-sizzle',
    name: 'Stack & Sizzle',
    shortAddress: 'High Street',
    formattedAddress: 'Demo Location - High Street',
    imageUrl:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=640&h=520&q=80',
  })

  const kitchenId = String(kitchen.id || '').trim()

  const ingredientIds = {
    beefPatty: 'beef-patty',
    burgerBuns: 'burger-buns',
    americanCheese: 'american-cheese',
    bacon: 'bacon',
    chickenBreast: 'chicken-breast',
    veggiePatty: 'veggie-patty',
    fryerOil: 'fryer-oil',
    potato: 'potato',
    lettuce: 'lettuce',
    tomato: 'tomato',
    whiteOnion: 'white-onion',
    pickles: 'pickles',
    ketchup: 'ketchup',
    mayo: 'mayo',
    mustard: 'mustard',
    cabbage: 'cabbage',
    carrot: 'carrot',
    vinegar: 'vinegar',
    sugar: 'sugar',
    butter: 'butter',
    seaSalt: 'sea-salt',
    blackPepper: 'black-pepper',
  } as const

  const globalIngredientSeed: Array<
    Pick<Ingredient, 'id' | 'name' | 'image_url' | 'app_id'>
  > = [
    { id: ingredientIds.beefPatty, name: 'Beef Patty', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.burgerBuns, name: 'Burger Buns', image_url: '', app_id: 'misebox-app' },
    {
      id: ingredientIds.americanCheese,
      name: 'American Cheese',
      image_url: '',
      app_id: 'misebox-app',
    },
    { id: ingredientIds.bacon, name: 'Bacon', image_url: '', app_id: 'misebox-app' },
    {
      id: ingredientIds.chickenBreast,
      name: 'Chicken Breast',
      image_url: '',
      app_id: 'misebox-app',
    },
    { id: ingredientIds.veggiePatty, name: 'Veggie Patty', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.fryerOil, name: 'Fryer Oil', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.potato, name: 'Potato', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.lettuce, name: 'Lettuce', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.tomato, name: 'Tomato', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.whiteOnion, name: 'White Onion', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.pickles, name: 'Pickles', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.ketchup, name: 'Ketchup', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.mayo, name: 'Mayo', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.mustard, name: 'Mustard', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.cabbage, name: 'Cabbage', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.carrot, name: 'Carrot', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.vinegar, name: 'Vinegar', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.sugar, name: 'Sugar', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.butter, name: 'Butter', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.seaSalt, name: 'Sea Salt', image_url: '', app_id: 'misebox-app' },
    { id: ingredientIds.blackPepper, name: 'Black Pepper', image_url: '', app_id: 'misebox-app' },
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

  const serviceDate = '2026-02-12'

  const kitchenMiseTasks = [
    buildMise({
      kitchenId,
      overrides: {
        id: 'prep-produce-pans',
        title: 'Prep produce pans',
        description: 'Wash/shred lettuce, slice tomato and onion, and stage pickles.',
        station: 'cold',
        service_date: serviceDate,
        status: 'todo',
        priority: 'high',
        estimated_minutes: 30,
        ingredient_ids: [
          ingredientIds.lettuce,
          ingredientIds.tomato,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
        ],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'portion-season-beef',
        title: 'Portion + season beef',
        description: 'Set burger portions and season with salt + pepper.',
        station: 'prep',
        service_date: serviceDate,
        status: 'todo',
        priority: 'high',
        estimated_minutes: 25,
        ingredient_ids: [ingredientIds.beefPatty, ingredientIds.seaSalt, ingredientIds.blackPepper],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'bun-toast-station',
        title: 'Bun setup + toast station',
        description: 'Open bun packs and setup toasted bun station with butter.',
        station: 'grill',
        service_date: serviceDate,
        status: 'todo',
        estimated_minutes: 15,
        ingredient_ids: [ingredientIds.burgerBuns, ingredientIds.butter],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'cook-bacon-batch',
        title: 'Cook bacon batch',
        description: 'Par-cook bacon for bacon burger + loaded fries.',
        station: 'grill',
        service_date: serviceDate,
        status: 'todo',
        estimated_minutes: 20,
        ingredient_ids: [ingredientIds.bacon],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'fries-portion-hold',
        title: 'Fries portion + fryer setup',
        description: 'Portion fries and setup fryer station for chicken + frozen veggie patties.',
        station: 'fryer',
        service_date: serviceDate,
        status: 'todo',
        priority: 'high',
        estimated_minutes: 25,
        ingredient_ids: [
          ingredientIds.potato,
          ingredientIds.fryerOil,
          ingredientIds.chickenBreast,
          ingredientIds.veggiePatty,
        ],
      },
    }),
    buildMise({
      kitchenId,
      overrides: {
        id: 'slaw-mix',
        title: 'Mix house slaw',
        description: 'Shred cabbage/carrot and fold with slaw dressing base.',
        station: 'cold',
        service_date: serviceDate,
        status: 'todo',
        estimated_minutes: 20,
        ingredient_ids: [
          ingredientIds.cabbage,
          ingredientIds.carrot,
          ingredientIds.mayo,
          ingredientIds.vinegar,
          ingredientIds.sugar,
          ingredientIds.seaSalt,
        ],
      },
    }),
  ]

  const coreDishIds = [
    'classic-burger',
    'cheese-burger',
    'double-burger',
    'bacon-burger',
    'stack-burger',
    'fried-chicken-burger',
    'veggie-burger',
    'fries',
    'loaded-fries',
    'house-slaw',
  ]

  const lateDishIds = ['classic-burger', 'cheese-burger', 'double-burger', 'fried-chicken-burger']

  const kitchenDishes = [
    buildDish({
      kitchenId,
      overrides: {
        id: 'classic-burger',
        name: 'Classic Burger',
        description: 'Beef patty, lettuce, tomato, onion, pickles, ketchup and mustard.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_ids: ['recipe-beef-burger-line'],
        ingredient_ids: [
          ingredientIds.beefPatty,
          ingredientIds.burgerBuns,
          ingredientIds.lettuce,
          ingredientIds.tomato,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
          ingredientIds.ketchup,
          ingredientIds.mustard,
        ],
        mise_ids: ['prep-produce-pans', 'portion-season-beef', 'bun-toast-station'],
        sort_order: 1,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'cheese-burger',
        name: 'Cheese Burger',
        description: 'Classic burger build with melted American cheese.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_ids: ['recipe-beef-burger-line'],
        ingredient_ids: [
          ingredientIds.beefPatty,
          ingredientIds.burgerBuns,
          ingredientIds.americanCheese,
          ingredientIds.lettuce,
          ingredientIds.tomato,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
          ingredientIds.ketchup,
          ingredientIds.mustard,
        ],
        mise_ids: ['prep-produce-pans', 'portion-season-beef', 'bun-toast-station'],
        sort_order: 2,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'double-burger',
        name: 'Double Burger',
        description: 'Double beef patties, cheese, onion, pickles, ketchup and mustard.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_ids: ['recipe-beef-burger-line'],
        ingredient_ids: [
          ingredientIds.beefPatty,
          ingredientIds.burgerBuns,
          ingredientIds.americanCheese,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
          ingredientIds.ketchup,
          ingredientIds.mustard,
        ],
        mise_ids: ['portion-season-beef', 'bun-toast-station'],
        sort_order: 3,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'bacon-burger',
        name: 'Bacon Burger',
        description: 'Cheese burger with crisp bacon and produce garnish.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_ids: ['recipe-beef-burger-line', 'recipe-bacon-finish'],
        ingredient_ids: [
          ingredientIds.beefPatty,
          ingredientIds.burgerBuns,
          ingredientIds.americanCheese,
          ingredientIds.bacon,
          ingredientIds.lettuce,
          ingredientIds.tomato,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
          ingredientIds.ketchup,
          ingredientIds.mustard,
        ],
        mise_ids: ['prep-produce-pans', 'portion-season-beef', 'bun-toast-station', 'cook-bacon-batch'],
        sort_order: 4,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'stack-burger',
        name: 'Stack Burger',
        description: 'House stack burger with beef, cheese, bacon, pickles, and sauce stack.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_ids: ['recipe-beef-burger-line', 'recipe-bacon-finish'],
        ingredient_ids: [
          ingredientIds.beefPatty,
          ingredientIds.burgerBuns,
          ingredientIds.americanCheese,
          ingredientIds.bacon,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
          ingredientIds.ketchup,
          ingredientIds.mayo,
          ingredientIds.mustard,
        ],
        mise_ids: ['portion-season-beef', 'bun-toast-station', 'cook-bacon-batch', 'prep-produce-pans'],
        sort_order: 5,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'fried-chicken-burger',
        name: 'Fried Chicken Burger',
        description: 'Fried chicken breast burger with pickles, lettuce, and mayo.',
        status: 'active',
        course: 'main',
        station: 'fryer',
        recipe_ids: ['recipe-fried-chicken-burger'],
        ingredient_ids: [
          ingredientIds.chickenBreast,
          ingredientIds.burgerBuns,
          ingredientIds.lettuce,
          ingredientIds.pickles,
          ingredientIds.mayo,
          ingredientIds.fryerOil,
        ],
        mise_ids: ['prep-produce-pans', 'bun-toast-station', 'fries-portion-hold'],
        sort_order: 6,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'veggie-burger',
        name: 'Veggie Burger',
        description: 'Fryer-cooked frozen veggie patty with fresh produce and house sauces.',
        status: 'active',
        course: 'main',
        station: 'fryer',
        recipe_ids: ['recipe-veggie-fryer-burger'],
        ingredient_ids: [
          ingredientIds.veggiePatty,
          ingredientIds.burgerBuns,
          ingredientIds.lettuce,
          ingredientIds.tomato,
          ingredientIds.whiteOnion,
          ingredientIds.pickles,
          ingredientIds.mayo,
          ingredientIds.mustard,
          ingredientIds.fryerOil,
        ],
        mise_ids: ['prep-produce-pans', 'bun-toast-station', 'fries-portion-hold'],
        sort_order: 7,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'fries',
        name: 'Fries',
        description: 'Salted fries from dedicated fryer station.',
        status: 'active',
        course: 'side',
        station: 'fryer',
        recipe_ids: ['recipe-fries-batch'],
        ingredient_ids: [ingredientIds.potato, ingredientIds.fryerOil, ingredientIds.seaSalt],
        mise_ids: ['fries-portion-hold'],
        sort_order: 8,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'loaded-fries',
        name: 'Loaded Fries',
        description: 'Fries topped with cheese sauce, bacon bits, pickles, and sauce trio.',
        status: 'active',
        course: 'side',
        station: 'fryer',
        recipe_ids: ['recipe-loaded-fries-finish'],
        ingredient_ids: [
          ingredientIds.potato,
          ingredientIds.fryerOil,
          ingredientIds.americanCheese,
          ingredientIds.bacon,
          ingredientIds.pickles,
          ingredientIds.ketchup,
          ingredientIds.mayo,
          ingredientIds.mustard,
          ingredientIds.seaSalt,
        ],
        mise_ids: ['fries-portion-hold', 'cook-bacon-batch'],
        sort_order: 9,
        active: true,
      },
    }),
    buildDish({
      kitchenId,
      overrides: {
        id: 'house-slaw',
        name: 'House Slaw',
        description: 'Crunchy cabbage and carrot slaw with light dressing.',
        status: 'active',
        course: 'side',
        station: 'cold',
        recipe_ids: ['recipe-house-slaw'],
        ingredient_ids: [
          ingredientIds.cabbage,
          ingredientIds.carrot,
          ingredientIds.mayo,
          ingredientIds.vinegar,
          ingredientIds.sugar,
          ingredientIds.seaSalt,
          ingredientIds.blackPepper,
        ],
        mise_ids: ['slaw-mix'],
        sort_order: 10,
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
        description: 'Full Stack & Sizzle lineup for standard service.',
        status: 'live',
        service: 'all_day',
        service_rules: {
          days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          start_time: '11:00',
          end_time: '21:00',
        },
        dish_ids: [...coreDishIds],
        sort_order: 1,
      },
    }),
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-burger-late',
        name: 'Late Menu',
        description: 'Late service burgers only.',
        status: 'live',
        service: 'dinner',
        service_rules: {
          days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
          start_time: '22:00',
          end_time: '02:00',
        },
        dish_ids: [...lateDishIds],
        sort_order: 2,
      },
    }),
  ]

  const kitchenRecipes: DummyRecipe[] = [
    {
      id: 'recipe-beef-burger-line',
      name: 'Beef Burger Line Base',
      description: 'Core grill workflow for classic/cheese/double/stack service.',
      status: 'active',
      yield_qty: 12,
      yield_unit: 'burgers',
      prep_minutes: 20,
      cook_minutes: 35,
      ingredient_lines: [
        { ingredient_name: 'Beef Patty', quantity: 12, unit: 'pc' },
        { ingredient_name: 'Burger Buns', quantity: 12, unit: 'pc' },
        { ingredient_name: 'American Cheese', quantity: 12, unit: 'slice' },
        { ingredient_name: 'Sea Salt', quantity: 12, unit: 'g' },
        { ingredient_name: 'Black Pepper', quantity: 4, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Season and smash patties on hot flat top.' },
        { order: 2, title: 'Melt cheese as needed and toast buttered buns.' },
        { order: 3, title: 'Assemble with cold garnish and sauces to ticket.' },
      ],
    },
    {
      id: 'recipe-bacon-finish',
      name: 'Bacon Finish Batch',
      description: 'Batch cook + hold bacon for burger and loaded fries service.',
      status: 'active',
      yield_qty: 30,
      yield_unit: 'strips',
      prep_minutes: 5,
      cook_minutes: 18,
      ingredient_lines: [{ ingredient_name: 'Bacon', quantity: 30, unit: 'slice' }],
      steps: [
        { order: 1, title: 'Lay bacon on tray and cook until crisp.' },
        { order: 2, title: 'Drain and hold hot in shallow pan.' },
      ],
    },
    {
      id: 'recipe-fried-chicken-burger',
      name: 'Fried Chicken Burger',
      description: 'Fryer workflow for crispy chicken burgers.',
      status: 'active',
      yield_qty: 8,
      yield_unit: 'burgers',
      prep_minutes: 10,
      cook_minutes: 24,
      ingredient_lines: [
        { ingredient_name: 'Chicken Breast', quantity: 8, unit: 'pc' },
        { ingredient_name: 'Burger Buns', quantity: 8, unit: 'pc' },
        { ingredient_name: 'Mayo', quantity: 120, unit: 'ml' },
        { ingredient_name: 'Pickles', quantity: 160, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Fry chicken portions until cooked through.' },
        { order: 2, title: 'Toast buns and build with mayo, pickles, and lettuce.' },
      ],
    },
    {
      id: 'recipe-veggie-fryer-burger',
      name: 'Veggie Fryer Burger',
      description: 'Cook frozen veggie patties in fryer and build to spec.',
      status: 'active',
      yield_qty: 8,
      yield_unit: 'burgers',
      prep_minutes: 8,
      cook_minutes: 18,
      ingredient_lines: [
        { ingredient_name: 'Veggie Patty', quantity: 8, unit: 'pc' },
        { ingredient_name: 'Burger Buns', quantity: 8, unit: 'pc' },
        { ingredient_name: 'Mayo', quantity: 120, unit: 'ml' },
        { ingredient_name: 'Mustard', quantity: 80, unit: 'ml' },
      ],
      steps: [
        { order: 1, title: 'Cook frozen veggie patties in fryer.' },
        { order: 2, title: 'Toast buns and finish with produce and sauces.' },
      ],
    },
    {
      id: 'recipe-fries-batch',
      name: 'Fries Batch',
      description: 'Portioned fries for fast service pickup.',
      status: 'active',
      yield_qty: 20,
      yield_unit: 'portions',
      prep_minutes: 15,
      cook_minutes: 25,
      ingredient_lines: [
        { ingredient_name: 'Potato', quantity: 5, unit: 'kg' },
        { ingredient_name: 'Fryer Oil', quantity: 1, unit: 'batch' },
        { ingredient_name: 'Sea Salt', quantity: 25, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Cut/portion fries and stage by service tubs.' },
        { order: 2, title: 'Fry to golden and season at pass.' },
      ],
    },
    {
      id: 'recipe-loaded-fries-finish',
      name: 'Loaded Fries Finish',
      description: 'Finish fries with cheese, bacon, pickles, and sauces.',
      status: 'active',
      yield_qty: 6,
      yield_unit: 'portions',
      prep_minutes: 8,
      cook_minutes: 4,
      ingredient_lines: [
        { ingredient_name: 'American Cheese', quantity: 6, unit: 'slice' },
        { ingredient_name: 'Bacon', quantity: 12, unit: 'slice' },
        { ingredient_name: 'Pickles', quantity: 120, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Top hot fries with melted cheese and bacon.' },
        { order: 2, title: 'Finish with pickles and sauce trio.' },
      ],
    },
    {
      id: 'recipe-house-slaw',
      name: 'House Slaw',
      description: 'Cold prep slaw for side service.',
      status: 'active',
      yield_qty: 18,
      yield_unit: 'portions',
      prep_minutes: 20,
      cook_minutes: 0,
      ingredient_lines: [
        { ingredient_name: 'Cabbage', quantity: 1.5, unit: 'kg' },
        { ingredient_name: 'Carrot', quantity: 500, unit: 'g' },
        { ingredient_name: 'Mayo', quantity: 400, unit: 'ml' },
        { ingredient_name: 'Vinegar', quantity: 80, unit: 'ml' },
        { ingredient_name: 'Sugar', quantity: 40, unit: 'g' },
      ],
      steps: [
        { order: 1, title: 'Shred cabbage/carrot and combine in cold bowl.' },
        { order: 2, title: 'Whisk dressing and fold through veg; hold chilled.' },
      ],
    },
  ]

  const kitchenStations = buildReadOnlyStations(kitchenId)

  const competencyGroups: Array<Record<string, unknown>> = [
    {
      id: 'raw-meat-prep',
      kitchen_id: kitchenId,
      label: 'Raw Meat Prep',
      description: 'Portion and season beef safely for burger service.',
      mise_ids: ['portion-season-beef'],
    },
    {
      id: 'grill-station',
      kitchen_id: kitchenId,
      label: 'Grill Station',
      description: 'Smash patties, toast buns, and melt cheese to ticket.',
      mise_ids: ['bun-toast-station', 'cook-bacon-batch'],
    },
    {
      id: 'fryer-station',
      kitchen_id: kitchenId,
      label: 'Fryer Station',
      description: 'Run fries, fried chicken, and frozen veggie patty workflows.',
      mise_ids: ['fries-portion-hold'],
    },
    {
      id: 'cold-prep',
      kitchen_id: kitchenId,
      label: 'Cold Prep',
      description: 'Produce pans, sauce bottles, and slaw setup.',
      mise_ids: ['prep-produce-pans', 'slaw-mix'],
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
      competency_ids: ['raw-meat-prep', 'grill-station', 'fryer-station', 'cold-prep'],
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
      competency_ids: ['raw-meat-prep', 'grill-station', 'fryer-station'],
      contact: { email: 'liam@stackandsizzle.demo', phone: '+41 79 000 0002' },
      tags: ['grill', 'fryer'],
    },
    {
      id: 'team-ss-03',
      kitchen_id: kitchenId,
      name: 'Maya Chen',
      role: 'Prep Cook',
      station: 'cold',
      is_lead: false,
      competency_ids: ['cold-prep', 'fryer-station'],
      contact: { email: 'maya@stackandsizzle.demo', phone: '+41 79 000 0003' },
      tags: ['prep', 'stock', 'hygiene'],
    },
  ]

  const kitchenSuppliers = buildReadOnlySuppliers(kitchenId)
  const kitchenSupplierIngredients = buildReadOnlySupplierIngredients(
    kitchenId,
    ingredientIds as unknown as Record<string, string>
  )

  const kitchenPurchases: Array<Record<string, unknown>> = []
  const kitchenIncomingOrders: Array<Record<string, unknown>> = []

  const trainingModules = buildReadOnlyTrainingModules(kitchenId)

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
    competencyGroups,
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
