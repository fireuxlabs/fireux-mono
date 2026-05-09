import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { DishModel, type Dish as DishDoc } from '../../../../../../models/dish.model'
import type { Ingredient } from '../../../../../../models/ingredient.model'
import { KitchenMiseTaskModel, type KitchenMiseTask as KitchenMiseTaskDoc } from '../../../../../../models/kitchen-mise.model'
import { MenuModel, type Menu as MenuDoc } from '../../../../../../models/menu.model'
import {
  RecipeModel,
  type Recipe as RecipeDoc,
} from '../../../../../../models/recipe.model'
import {
  resolveKitchenConsoleCollectionPath,
  resolveKitchenRuntimeChildCollectionPath,
} from '../../../../app/kitchen-console/shared'

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

  for (const ingredient of ingredients) {
    const id = String(ingredient.id || '').trim()
    const name = String(ingredient.name || '').trim()
    if (!id || !name) continue
    idByName.set(normalize(name), id)
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

  return { resolved, missing }
}

export function useKitchenMenuStackCreate() {
  const { setDocument } = useFirestoreCreate()
  const { appId } = useFireUXConfig()

  const createStarterKitchenMenuStack = async (
    kitchenId: string,
    ingredients: Ingredient[],
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')
    const kitchenCollectionPath = String(
      options.kitchenCollectionPath || ''
    ).trim() || resolveKitchenConsoleCollectionPath(appId)
    const collectionPathFor = (collectionName: string) =>
      resolveKitchenRuntimeChildCollectionPath({
        kitchenCollectionPath,
        kitchenId: resolvedKitchenId,
        collectionName,
        appId,
      })

    const { resolved, missing } = resolveRequiredIngredients(ingredients ?? [])
    if (missing.length) {
      throw new Error(`Missing required ingredients: ${missing.join(', ')}`)
    }

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

    const menuDoc: MenuDoc = {
      ...MenuModel,
      id: menuId,
      kitchen_id: resolvedKitchenId,
      name: 'Starter Service Menu',
      description: 'Generated from global ingredient records for kitchen console prototyping.',
      active: true,
      sections: [
        {
          id: 'section-starter-service',
          label: 'Starter Service',
          description: '',
          sort_order: 1,
          items: dishIds.map((dishId, index) => ({
            id: `item-${dishId}`,
            dish_id: dishId,
            label: '',
            price: 0,
            sort_order: index + 1,
          })),
        },
      ],
      sort_order: 10,
    }

    const dishes: DishDoc[] = [
      {
        ...DishModel,
        id: dishIds[0],
        kitchen_id: resolvedKitchenId,
        name: 'Classic Cheeseburger',
        description: 'Burger bun, beef patty, cheese, lettuce, tomato, onion, ketchup.',
        primary_recipe_id: recipeIds[0],
        recipe_ids: [recipeIds[0]],
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
        ...DishModel,
        id: dishIds[1],
        kitchen_id: resolvedKitchenId,
        name: 'Caprese Lemon Salad',
        description: 'Tomato and mozzarella finished with lemon.',
        primary_recipe_id: recipeIds[1],
        recipe_ids: [recipeIds[1]],
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
        ...DishModel,
        id: dishIds[2],
        kitchen_id: resolvedKitchenId,
        name: 'Cheddar Onion Melt',
        description: 'Beef patty, cheddar, onion, bun, and ketchup.',
        primary_recipe_id: recipeIds[2],
        recipe_ids: [recipeIds[2]],
        ingredient_ids: [
          resolved.beefPatty,
          resolved.cheddar,
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

    const recipes: RecipeDoc[] = [
      {
        ...RecipeModel,
        id: recipeIds[0],
        kitchen_id: resolvedKitchenId,
        slug: recipeIds[0],
        name: 'Classic Cheeseburger v1',
        description: 'Single burger assembly workflow.',
        source_language: 'en',
        names: { en: 'Classic Cheeseburger v1' },
        descriptions: { en: 'Single burger assembly workflow.' },
      },
      {
        ...RecipeModel,
        id: recipeIds[1],
        kitchen_id: resolvedKitchenId,
        slug: recipeIds[1],
        name: 'Caprese Lemon Salad v1',
        description: 'Cold station salad build.',
        source_language: 'en',
        names: { en: 'Caprese Lemon Salad v1' },
        descriptions: { en: 'Cold station salad build.' },
      },
      {
        ...RecipeModel,
        id: recipeIds[2],
        kitchen_id: resolvedKitchenId,
        slug: recipeIds[2],
        name: 'Cheddar Onion Melt v1',
        description: 'Cheddar burger variation with onions.',
        source_language: 'en',
        names: { en: 'Cheddar Onion Melt v1' },
        descriptions: { en: 'Cheddar burger variation with onions.' },
      },
    ]

    const miseTasks: KitchenMiseTaskDoc[] = [
      {
        ...KitchenMiseTaskModel,
        id: miseTaskIds[0],
        kitchen_id: resolvedKitchenId,
        title: 'Prep produce station',
        description: 'Wash and slice produce for burger and salad service.',
        station: 'prep',
        service_date: '',
        menu_id: menuId,
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
        ...KitchenMiseTaskModel,
        id: miseTaskIds[1],
        kitchen_id: resolvedKitchenId,
        title: 'Portion cheese for line',
        description: 'Prepare mozzarella, cheddar, and American slices.',
        station: 'prep',
        service_date: '',
        menu_id: menuId,
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
        ...KitchenMiseTaskModel,
        id: miseTaskIds[2],
        kitchen_id: resolvedKitchenId,
        title: 'Set burger line',
        description: 'Stage buns, patties, and sauce for grill service.',
        station: 'grill',
        service_date: '',
        menu_id: menuId,
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
        ...KitchenMiseTaskModel,
        id: miseTaskIds[3],
        kitchen_id: resolvedKitchenId,
        title: 'Service pass checks',
        description: 'Final checks before opening service.',
        station: 'pass',
        service_date: '',
        menu_id: menuId,
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

    await setDocument<MenuDoc>(
      collectionPathFor('menus'),
      menuDoc.id,
      menuDoc,
      { app: true, creator: true }
    )

    for (const dish of dishes) {
      await setDocument<DishDoc>(
        collectionPathFor('dishes'),
        dish.id,
        dish,
        { app: true, creator: true }
      )
    }

    for (const recipe of recipes) {
      await setDocument<RecipeDoc>(
        collectionPathFor('recipes'),
        recipe.id,
        recipe,
        { app: true, creator: true }
      )
    }

    for (const task of miseTasks) {
      await setDocument<KitchenMiseTaskDoc>(
        collectionPathFor('mise'),
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
