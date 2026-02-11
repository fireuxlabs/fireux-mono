import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { Ingredient } from '../../../../../models/ingredient.model'
import { KitchenDish, type KitchenDish as KitchenDishDoc } from '../../../../../models/dish.model'
import { KitchenMenu, type KitchenMenu as KitchenMenuDoc } from '../../../../../models/kitchen-menu.model'
import { KitchenMiseTask, type KitchenMiseTask as KitchenMiseTaskDoc } from '../../../../../models/kitchen-mise.model'
import {
  KitchenRecipe,
  type KitchenRecipe as KitchenRecipeDoc,
  type KitchenRecipeIngredientLine,
} from '../../../../../models/kitchen-recipe.model'

const resolveCollectionPath = (kitchenId: string, collectionName: string) =>
  `kitchens/${kitchenId}/${collectionName}`

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const REQUIRED_INGREDIENTS = {
  tomato: ['Tomato'],
  onion: ['Onion'],
  mozzarella: ['Mozzarella Cheese', 'Mozzarella'],
  cheddar: ['Cheddar Cheese', 'Cheddar'],
  lemon: ['Lemon'],
  burgerBuns: ['Burger Buns'],
  beefPatty: ['Beef Patty'],
  americanCheese: ['American Sliced Cheese', 'American Cheese'],
  ketchup: ['Ketchup'],
  lettuce: ['Lettuce'],
} as const

type RequiredIngredientKey = keyof typeof REQUIRED_INGREDIENTS

function resolveRequiredIngredients(ingredients: Ingredient[]) {
  const idByName = new Map<string, string>()
  const nameById = new Map<string, string>()

  for (const ingredient of ingredients) {
    const id = String(ingredient.id || '').trim()
    const name = String(ingredient.name || '').trim()
    if (!id || !name) continue
    idByName.set(normalize(name), id)
    nameById.set(id, name)
  }

  const resolved = {} as Record<RequiredIngredientKey, string>
  const missing: string[] = []

  for (const [key, aliases] of Object.entries(REQUIRED_INGREDIENTS) as [
    RequiredIngredientKey,
    readonly string[],
  ][]) {
    const ingredientId =
      aliases
        .map((alias) => idByName.get(normalize(alias)))
        .find(Boolean) || ''

    if (!ingredientId) {
      missing.push(aliases[0])
      continue
    }

    resolved[key] = ingredientId
  }

  return { resolved, missing, nameById }
}

export function useKitchenMenuStackCreate() {
  const { setDocument } = useFirestoreCreate()

  const createStarterKitchenMenuStack = async (
    kitchenId: string,
    ingredients: Ingredient[]
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const { resolved, missing, nameById } = resolveRequiredIngredients(ingredients ?? [])
    if (missing.length) {
      throw new Error(`Missing required ingredients: ${missing.join(', ')}`)
    }

    const line = (
      ingredientId: string,
      quantity: number,
      unit: string,
      prep_note: string
    ): KitchenRecipeIngredientLine => ({
      ingredient_id: ingredientId,
      ingredient_name: String(nameById.get(ingredientId) || ''),
      quantity,
      unit,
      prep_note,
    })

    const menuId = 'menu-starter-service'
    const dishIds = [
      'dish-classic-cheeseburger',
      'dish-caprese-lemon-salad',
      'dish-cheddar-onion-melt',
    ]
    const recipeIds = [
      'recipe-classic-cheeseburger-v1',
      'recipe-caprese-lemon-salad-v1',
      'recipe-cheddar-onion-melt-v1',
    ]
    const miseTaskIds = [
      'mise-prep-produce',
      'mise-portion-cheese',
      'mise-burger-line-setup',
      'mise-service-pass-check',
    ]

    const menuDoc: KitchenMenuDoc = {
      ...KitchenMenu,
      id: menuId,
      kitchen_id: resolvedKitchenId,
      name: 'Starter Service Menu',
      description: 'Generated from global ingredient records for kitchen dashboard prototyping.',
      status: 'live',
      service: 'all_day',
      dish_ids: dishIds,
      stations: ['prep', 'grill', 'cold', 'pass'],
      sort_order: 10,
      active: true,
    }

    const dishes: KitchenDishDoc[] = [
      {
        ...KitchenDish,
        id: dishIds[0],
        kitchen_id: resolvedKitchenId,
        name: 'Classic Cheeseburger',
        description: 'Burger bun, beef patty, cheese, lettuce, tomato, onion, ketchup.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_id: recipeIds[0],
        tags: ['burger', 'grill'],
        ingredient_ids: [
          resolved.burgerBuns,
          resolved.beefPatty,
          resolved.americanCheese,
          resolved.lettuce,
          resolved.tomato,
          resolved.onion,
          resolved.ketchup,
        ],
        mise_ids: [
          miseTaskIds[0],
          miseTaskIds[1],
          miseTaskIds[2],
        ],
        sort_order: 10,
        active: true,
      },
      {
        ...KitchenDish,
        id: dishIds[1],
        kitchen_id: resolvedKitchenId,
        name: 'Caprese Lemon Salad',
        description: 'Tomato and mozzarella finished with lemon.',
        status: 'active',
        course: 'starter',
        station: 'cold',
        recipe_id: recipeIds[1],
        tags: ['salad', 'cold'],
        ingredient_ids: [
          resolved.tomato,
          resolved.mozzarella,
          resolved.lemon,
        ],
        mise_ids: [
          miseTaskIds[0],
          miseTaskIds[3],
        ],
        sort_order: 20,
        active: true,
      },
      {
        ...KitchenDish,
        id: dishIds[2],
        kitchen_id: resolvedKitchenId,
        name: 'Cheddar Onion Melt',
        description: 'Beef patty, cheddar, onion, bun, and ketchup.',
        status: 'active',
        course: 'main',
        station: 'grill',
        recipe_id: recipeIds[2],
        tags: ['burger', 'grill'],
        ingredient_ids: [
          resolved.beefPatty,
          resolved.americanCheese,
          resolved.onion,
          resolved.burgerBuns,
          resolved.ketchup,
        ],
        mise_ids: [
          miseTaskIds[1],
          miseTaskIds[2],
        ],
        sort_order: 30,
        active: true,
      },
    ]

    const recipes: KitchenRecipeDoc[] = [
      {
        ...KitchenRecipe,
        id: recipeIds[0],
        kitchen_id: resolvedKitchenId,
        dish_id: dishIds[0],
        name: 'Classic Cheeseburger v1',
        description: 'Single burger assembly workflow.',
        status: 'active',
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 8,
        cook_minutes: 8,
        ingredient_lines: [
          line(resolved.burgerBuns, 1, 'piece', 'Split and toast'),
          line(resolved.beefPatty, 1, 'piece', 'Season and grill'),
          line(resolved.americanCheese, 1, 'piece', 'Melt on patty'),
          line(resolved.lettuce, 0.25, 'piece', 'Washed leaves'),
          line(resolved.tomato, 0.5, 'piece', 'Slice'),
          line(resolved.onion, 0.25, 'piece', 'Slice'),
          line(resolved.ketchup, 15, 'ml', 'Bottle at pass'),
        ],
        steps: [
          {
            id: 'step-grill-patty',
            order: 1,
            title: 'Grill patty',
            instruction: 'Cook beef patty and melt American cheese.',
            minutes: 6,
          },
          {
            id: 'step-toast-bun',
            order: 2,
            title: 'Toast bun',
            instruction: 'Toast burger buns cut side down.',
            minutes: 1,
          },
          {
            id: 'step-assemble',
            order: 3,
            title: 'Assemble burger',
            instruction: 'Build with sauce, produce, and patty; close and serve.',
            minutes: 1,
          },
        ],
        notes: 'Target ticket time: 8 minutes.',
        tags: ['burger', 'service'],
      },
      {
        ...KitchenRecipe,
        id: recipeIds[1],
        kitchen_id: resolvedKitchenId,
        dish_id: dishIds[1],
        name: 'Caprese Lemon Salad v1',
        description: 'Cold station salad build.',
        status: 'active',
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 6,
        cook_minutes: 0,
        ingredient_lines: [
          line(resolved.tomato, 2, 'piece', 'Slice wedges'),
          line(resolved.mozzarella, 1, 'piece', 'Slice medallions'),
          line(resolved.lemon, 0.5, 'piece', 'Juice to finish'),
        ],
        steps: [
          {
            id: 'step-prep-salad',
            order: 1,
            title: 'Prep ingredients',
            instruction: 'Slice tomato and mozzarella evenly.',
            minutes: 4,
          },
          {
            id: 'step-plate-salad',
            order: 2,
            title: 'Plate and finish',
            instruction: 'Layer slices and finish with lemon juice.',
            minutes: 2,
          },
        ],
        notes: 'Hold cold and plate to order.',
        tags: ['salad', 'cold'],
      },
      {
        ...KitchenRecipe,
        id: recipeIds[2],
        kitchen_id: resolvedKitchenId,
        dish_id: dishIds[2],
        name: 'Cheddar Onion Melt v1',
        description: 'Cheddar burger variation with onions.',
        status: 'active',
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 6,
        cook_minutes: 8,
        ingredient_lines: [
          line(resolved.burgerBuns, 1, 'piece', 'Split and toast'),
          line(resolved.beefPatty, 1, 'piece', 'Season and grill'),
          line(resolved.cheddar, 1, 'piece', 'Melt on patty'),
          line(resolved.onion, 0.5, 'piece', 'Slice thin'),
          line(resolved.ketchup, 10, 'ml', 'Apply to bun'),
        ],
        steps: [
          {
            id: 'step-cook-patty',
            order: 1,
            title: 'Cook patty',
            instruction: 'Grill patty and melt cheddar.',
            minutes: 6,
          },
          {
            id: 'step-build-melt',
            order: 2,
            title: 'Build melt',
            instruction: 'Toast bun, add onion and ketchup, then close burger.',
            minutes: 2,
          },
        ],
        notes: 'Onion can be served raw or lightly griddled.',
        tags: ['burger', 'grill'],
      },
    ]

    const miseTasks: KitchenMiseTaskDoc[] = [
      {
        ...KitchenMiseTask,
        id: miseTaskIds[0],
        kitchen_id: resolvedKitchenId,
        title: 'Prep produce station',
        description: 'Wash and slice produce for burger and salad service.',
        station: 'prep',
        service_date: '',
        status: 'todo',
        priority: 'high',
        estimated_minutes: 20,
        ingredient_ids: [resolved.tomato, resolved.onion, resolved.lettuce, resolved.lemon],
        checklist: [
          { id: 'wash-produce', label: 'Wash lettuce, tomato, onion, lemon', done: false },
          { id: 'slice-produce', label: 'Slice tomato and onion', done: false },
          { id: 'hold-cold', label: 'Store prepped produce in cold line', done: false },
        ],
      },
      {
        ...KitchenMiseTask,
        id: miseTaskIds[1],
        kitchen_id: resolvedKitchenId,
        title: 'Portion cheese for line',
        description: 'Prepare mozzarella, cheddar, and American slices.',
        station: 'prep',
        service_date: '',
        status: 'todo',
        priority: 'normal',
        estimated_minutes: 15,
        ingredient_ids: [resolved.mozzarella, resolved.cheddar, resolved.americanCheese],
        checklist: [
          { id: 'portion-cheese', label: 'Portion cheeses per service target', done: false },
          { id: 'label-cheese', label: 'Label GN trays with date/time', done: false },
        ],
      },
      {
        ...KitchenMiseTask,
        id: miseTaskIds[2],
        kitchen_id: resolvedKitchenId,
        title: 'Set burger line',
        description: 'Stage buns, patties, and sauce for grill service.',
        station: 'grill',
        service_date: '',
        status: 'todo',
        priority: 'high',
        estimated_minutes: 15,
        ingredient_ids: [resolved.burgerBuns, resolved.beefPatty, resolved.ketchup],
        checklist: [
          { id: 'stage-buns', label: 'Stage buns at grill pass', done: false },
          { id: 'portion-patties', label: 'Portion patties for first wave', done: false },
          { id: 'stock-sauce', label: 'Refill ketchup bottle at pass', done: false },
        ],
      },
      {
        ...KitchenMiseTask,
        id: miseTaskIds[3],
        kitchen_id: resolvedKitchenId,
        title: 'Service pass checks',
        description: 'Final checks before opening service.',
        station: 'pass',
        service_date: '',
        status: 'todo',
        priority: 'normal',
        estimated_minutes: 10,
        ingredient_ids: [],
        checklist: [
          { id: 'tickets-online', label: 'Confirm printer and tickets online', done: false },
          { id: 'line-temps', label: 'Verify line holding temperatures', done: false },
          { id: 'brief-team', label: 'Run opening service brief', done: false },
        ],
      },
    ]

    await setDocument<KitchenMenuDoc>(
      resolveCollectionPath(resolvedKitchenId, 'menus'),
      menuDoc.id,
      menuDoc,
      { app: true, creator: true }
    )

    for (const dish of dishes) {
      await setDocument<KitchenDishDoc>(
        resolveCollectionPath(resolvedKitchenId, 'dishes'),
        dish.id,
        dish,
        { app: true, creator: true }
      )
    }

    for (const recipe of recipes) {
      await setDocument<KitchenRecipeDoc>(
        resolveCollectionPath(resolvedKitchenId, 'recipes'),
        recipe.id,
        recipe,
        { app: true, creator: true }
      )
    }

    for (const task of miseTasks) {
      await setDocument<KitchenMiseTaskDoc>(
        resolveCollectionPath(resolvedKitchenId, 'mise'),
        task.id,
        task,
        { app: true, creator: true }
      )
    }

    return {
      menuId,
      dishIds,
      recipeIds,
      miseTaskIds,
    }
  }

  return {
    createStarterKitchenMenuStack,
  }
}
