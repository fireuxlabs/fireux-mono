/**
 * Kitchen-owned usage and Supplier-selection links for Demo Kitchens.
 *
 * Ingredient identity is never Demo data. Every `ingredient_id` in this file
 * resolves to the real shared `/ingredients/{ingredientId}` catalogue through
 * the bounded public Ingredient projection.
 */
import {
  KitchenIngredientDefaults,
  type KitchenIngredient,
} from '../../../utils/kitchen-ingredient.ts'
import {
  KitchenSupplierIngredientDefaults,
  type KitchenSupplierIngredient,
} from '../../../utils/kitchen-supplier-ingredient.ts'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from '../../core/fixtures'
import type { KitchenDemoIdentity } from '../../core/types'

type KitchenDemoIngredientLinkDefinition = {
  ingredientId: string
  supplierId: string
}

const kitchenDemoIngredientLinks: KitchenDemoIngredientLinkDefinition[] = [
  { ingredientId: 'beef-mince', supplierId: 'alpine-foodservice' },
  { ingredientId: 'chicken-breast', supplierId: 'alpine-foodservice' },
  { ingredientId: 'turkey-breast', supplierId: 'alpine-foodservice' },
  { ingredientId: 'smoked-bacon', supplierId: 'alpine-foodservice' },
  { ingredientId: 'chipolatas', supplierId: 'alpine-foodservice' },
  { ingredientId: 'american-cheese', supplierId: 'alpine-foodservice' },
  { ingredientId: 'swiss-cheese', supplierId: 'alpine-foodservice' },
  { ingredientId: 'cheddar-cheese', supplierId: 'alpine-foodservice' },
  { ingredientId: 'camembert', supplierId: 'alpine-foodservice' },
  { ingredientId: 'brie', supplierId: 'alpine-foodservice' },
  { ingredientId: 'butter', supplierId: 'alpine-foodservice' },
  { ingredientId: 'milk', supplierId: 'alpine-foodservice' },
  { ingredientId: 'buttermilk', supplierId: 'alpine-foodservice' },
  { ingredientId: 'cream', supplierId: 'alpine-foodservice' },
  { ingredientId: 'vanilla-soft-serve', supplierId: 'alpine-foodservice' },
  { ingredientId: 'burger-buns', supplierId: 'alpine-foodservice' },
  { ingredientId: 'slider-buns', supplierId: 'alpine-foodservice' },
  { ingredientId: 'skin-on-fries', supplierId: 'alpine-foodservice' },
  { ingredientId: 'waffle-fries', supplierId: 'alpine-foodservice' },
  { ingredientId: 'ice', supplierId: 'alpine-foodservice' },
  {
    ingredientId: 'mini-yorkshire-puddings',
    supplierId: 'alpine-foodservice',
  },

  { ingredientId: 'mayonnaise', supplierId: 'pantry-house' },
  { ingredientId: 'vegan-mayonnaise', supplierId: 'pantry-house' },
  { ingredientId: 'ketchup', supplierId: 'pantry-house' },
  { ingredientId: 'yellow-mustard', supplierId: 'pantry-house' },
  { ingredientId: 'mustard', supplierId: 'pantry-house' },
  { ingredientId: 'pickles', supplierId: 'pantry-house' },
  { ingredientId: 'jalapeno', supplierId: 'pantry-house' },
  { ingredientId: 'smoked-paprika', supplierId: 'pantry-house' },
  { ingredientId: 'black-pepper', supplierId: 'pantry-house' },
  { ingredientId: 'brown-sugar', supplierId: 'pantry-house' },
  { ingredientId: 'cider-vinegar', supplierId: 'pantry-house' },
  { ingredientId: 'honey', supplierId: 'pantry-house' },
  { ingredientId: 'chilli-sauce', supplierId: 'pantry-house' },
  { ingredientId: 'flour', supplierId: 'pantry-house' },
  { ingredientId: 'cornflour', supplierId: 'pantry-house' },
  { ingredientId: 'baking-powder', supplierId: 'pantry-house' },
  { ingredientId: 'fine-salt', supplierId: 'pantry-house' },
  { ingredientId: 'sea-salt', supplierId: 'pantry-house' },
  { ingredientId: 'sugar', supplierId: 'pantry-house' },
  { ingredientId: 'vanilla', supplierId: 'pantry-house' },
  { ingredientId: 'cranberry-relish', supplierId: 'pantry-house' },
  { ingredientId: 'gravy', supplierId: 'pantry-house' },
  { ingredientId: 'sage-onion-stuffing', supplierId: 'pantry-house' },
  { ingredientId: 'crispy-onions', supplierId: 'pantry-house' },
  { ingredientId: 'breadcrumbs', supplierId: 'pantry-house' },
  { ingredientId: 'gingerbread-spice', supplierId: 'pantry-house' },
  { ingredientId: 'gingerbread-biscuits', supplierId: 'pantry-house' },
  { ingredientId: 'sparkling-water', supplierId: 'pantry-house' },
  { ingredientId: 'still-water', supplierId: 'pantry-house' },

  { ingredientId: 'onion', supplierId: 'bern-market-garden' },
  { ingredientId: 'lettuce', supplierId: 'bern-market-garden' },
  { ingredientId: 'brown-mushrooms', supplierId: 'bern-market-garden' },
  { ingredientId: 'tomato', supplierId: 'bern-market-garden' },
  { ingredientId: 'cauliflower', supplierId: 'bern-market-garden' },
  { ingredientId: 'red-cabbage', supplierId: 'bern-market-garden' },
  { ingredientId: 'spring-onion', supplierId: 'bern-market-garden' },
  { ingredientId: 'chives', supplierId: 'bern-market-garden' },
  { ingredientId: 'dill', supplierId: 'bern-market-garden' },
  { ingredientId: 'garlic', supplierId: 'bern-market-garden' },
  { ingredientId: 'lemon', supplierId: 'bern-market-garden' },
  { ingredientId: 'cherries', supplierId: 'bern-market-garden' },
  { ingredientId: 'mint', supplierId: 'bern-market-garden' },
  { ingredientId: 'strawberries', supplierId: 'bern-market-garden' },
  { ingredientId: 'lime', supplierId: 'bern-market-garden' },
  { ingredientId: 'basil', supplierId: 'bern-market-garden' },
  { ingredientId: 'cucumber', supplierId: 'bern-market-garden' },
  { ingredientId: 'rocket', supplierId: 'bern-market-garden' },
]

const selectIngredientLinks = (ids?: readonly string[]) => {
  if (!ids) return kitchenDemoIngredientLinks

  const requested = new Set(ids)
  const definitions = kitchenDemoIngredientLinks.filter((definition) =>
    requested.has(definition.ingredientId)
  )
  if (definitions.length !== requested.size) {
    const resolved = new Set(
      definitions.map((definition) => definition.ingredientId)
    )
    const missing = [...requested].filter((id) => !resolved.has(id))
    throw new Error(
      `Kitchen Demo Ingredient links are missing: ${missing.join(', ')}`
    )
  }
  return definitions
}

const kitchenIngredientWorld = (
  identity: KitchenDemoIdentity,
  ids?: readonly string[]
) => {
  const definitions = selectIngredientLinks(ids)
  const kitchenIngredients: KitchenIngredient[] = definitions.map(
    (definition) => ({
      ...KitchenIngredientDefaults,
      id: definition.ingredientId,
      ingredient_id: definition.ingredientId,
      created: kitchenDemoCreated(identity),
      updated: kitchenDemoUpdated(),
    })
  )
  const supplierIngredientLinks: KitchenSupplierIngredient[] = definitions.map(
    (definition) => ({
      ...KitchenSupplierIngredientDefaults,
      id: `${definition.supplierId}:${definition.ingredientId}`,
      kitchen_id: identity.kitchenId,
      supplier_id: definition.supplierId,
      ingredient_id: definition.ingredientId,
      created: kitchenDemoCreated(identity),
      updated: kitchenDemoUpdated(),
    })
  )

  return {
    kitchenIngredients,
    supplierIngredientLinks,
  }
}

const deanosIngredientWorld = kitchenIngredientWorld(deanosKitchenDemoIdentity)
const pizzaTheActionIngredientWorld = kitchenIngredientWorld(
  pizzaTheActionKitchenDemoIdentity,
  [
    'butter',
    'milk',
    'flour',
    'sea-salt',
    'sparkling-water',
    'brown-mushrooms',
    'tomato',
    'garlic',
    'lemon',
    'lime',
    'mint',
    'basil',
    'cucumber',
    'rocket',
  ]
)
const miseboxRestaurantIngredientWorld = kitchenIngredientWorld(
  miseboxRestaurantKitchenDemoIdentity,
  [
    'chicken-breast',
    'butter',
    'cream',
    'flour',
    'sea-salt',
    'honey',
    'sparkling-water',
    'brown-mushrooms',
    'tomato',
    'garlic',
    'lemon',
    'lime',
    'mint',
    'basil',
    'cucumber',
    'rocket',
  ]
)

export const deanosKitchenDemoIngredientLinks =
  deanosIngredientWorld.kitchenIngredients
export const deanosKitchenDemoSupplierIngredientLinks =
  deanosIngredientWorld.supplierIngredientLinks

export const pizzaTheActionKitchenDemoIngredientLinks =
  pizzaTheActionIngredientWorld.kitchenIngredients
export const pizzaTheActionKitchenDemoSupplierIngredientLinks =
  pizzaTheActionIngredientWorld.supplierIngredientLinks

export const miseboxRestaurantKitchenDemoIngredientLinks =
  miseboxRestaurantIngredientWorld.kitchenIngredients
export const miseboxRestaurantKitchenDemoSupplierIngredientLinks =
  miseboxRestaurantIngredientWorld.supplierIngredientLinks
