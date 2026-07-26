export const INGREDIENT_CATEGORIES = [
  'produce',
  'meat-poultry',
  'seafood',
  'dairy-eggs',
  'bakery',
  'herbs-spices',
  'sauces-condiments',
  'pantry',
  'prepared',
  'other',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export const INGREDIENT_CATEGORY_OPTIONS: Array<{
  label: string
  value: IngredientCategory
}> = [
  { label: 'Produce', value: 'produce' },
  { label: 'Meat & poultry', value: 'meat-poultry' },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Dairy & eggs', value: 'dairy-eggs' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Herbs & spices', value: 'herbs-spices' },
  { label: 'Sauces & condiments', value: 'sauces-condiments' },
  { label: 'Pantry', value: 'pantry' },
  { label: 'Prepared foods', value: 'prepared' },
  { label: 'Other', value: 'other' },
]

export const INGREDIENT_KINDS = [
  'base',
  'variety',
  'cut',
  'prepared',
  'composite',
  'group',
] as const

export type IngredientKind = (typeof INGREDIENT_KINDS)[number]

export const INGREDIENT_KIND_OPTIONS: Array<{
  label: string
  value: IngredientKind
}> = [
  { label: 'Base ingredient', value: 'base' },
  { label: 'Variety', value: 'variety' },
  { label: 'Cut', value: 'cut' },
  { label: 'Prepared ingredient', value: 'prepared' },
  { label: 'Composite ingredient', value: 'composite' },
  { label: 'Ingredient group', value: 'group' },
]

export const INGREDIENT_STATUSES = ['active', 'deprecated', 'merged'] as const

export type IngredientStatus = (typeof INGREDIENT_STATUSES)[number]

export const INGREDIENT_STATUS_OPTIONS: Array<{
  label: string
  value: IngredientStatus
}> = [
  { label: 'Active', value: 'active' },
  { label: 'Deprecated', value: 'deprecated' },
  { label: 'Merged', value: 'merged' },
]

export const ingredientCategoryLabel = (value: unknown) =>
  INGREDIENT_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ||
  'Other'

export const ingredientKindLabel = (value: unknown) =>
  INGREDIENT_KIND_OPTIONS.find((option) => option.value === value)?.label ||
  'Base ingredient'
