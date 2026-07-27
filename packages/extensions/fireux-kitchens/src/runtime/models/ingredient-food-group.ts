import {
  INGREDIENT_CATEGORIES,
  type IngredientCategory,
} from './ingredient-taxonomy'

/**
 * Shared presentation grouping derived from canonical Ingredient identity.
 * Kitchen usage records never store or override this classification.
 */
export const INGREDIENT_FOOD_GROUPS = [
  'fruit',
  'vegetables',
  'raw-meat-poultry',
  'prepared-meat',
  'seafood',
  'dairy-eggs',
  'bakery',
  'herbs-spices',
  'sauces-condiments',
  'pantry',
  'prepared-foods',
  'other',
] as const

export type IngredientFoodGroup = (typeof INGREDIENT_FOOD_GROUPS)[number]

export type IngredientFoodGroupOption = {
  value: IngredientFoodGroup
  label: string
  icon: string
}

export const INGREDIENT_FOOD_GROUP_OPTIONS:
  readonly IngredientFoodGroupOption[] = [
    { value: 'fruit', label: 'Fruit', icon: 'i-lucide-apple' },
    { value: 'vegetables', label: 'Vegetables', icon: 'i-lucide-carrot' },
    {
      value: 'raw-meat-poultry',
      label: 'Raw meat & poultry',
      icon: 'i-lucide-beef',
    },
    {
      value: 'prepared-meat',
      label: 'Prepared meat',
      icon: 'i-lucide-ham',
    },
    { value: 'seafood', label: 'Seafood', icon: 'i-lucide-fish' },
    { value: 'dairy-eggs', label: 'Dairy & eggs', icon: 'i-lucide-milk' },
    { value: 'bakery', label: 'Bakery', icon: 'i-lucide-wheat' },
    {
      value: 'herbs-spices',
      label: 'Herbs & spices',
      icon: 'i-lucide-leaf',
    },
    {
      value: 'sauces-condiments',
      label: 'Sauces & condiments',
      icon: 'i-lucide-cooking-pot',
    },
    { value: 'pantry', label: 'Pantry', icon: 'i-lucide-package' },
    {
      value: 'prepared-foods',
      label: 'Prepared foods',
      icon: 'i-lucide-chef-hat',
    },
    {
      value: 'other',
      label: 'Other',
      icon: 'i-lucide-circle-ellipsis',
    },
  ]

const ingredientCategories = new Set<IngredientCategory>(
  INGREDIENT_CATEGORIES
)
const fruitIngredientIds = new Set([
  'cherries',
  'lemon',
  'lime',
  'strawberries',
])

const resolveIngredientCategory = (value: unknown): IngredientCategory => {
  const category = String(value ?? '').trim() as IngredientCategory
  return ingredientCategories.has(category) ? category : 'other'
}

export const resolveIngredientFoodGroup = ({
  id: idValue,
  category: categoryValue,
  kind: kindValue,
}: {
  id: unknown
  category: unknown
  kind: unknown
}): IngredientFoodGroup => {
  const id = String(idValue ?? '').trim()
  const category = resolveIngredientCategory(categoryValue)
  const kind = String(kindValue ?? '').trim()

  if (category === 'produce') {
    return fruitIngredientIds.has(id) ? 'fruit' : 'vegetables'
  }

  if (category === 'meat-poultry') {
    return kind === 'prepared' || kind === 'composite'
      ? 'prepared-meat'
      : 'raw-meat-poultry'
  }

  if (category === 'prepared') return 'prepared-foods'
  return category
}
