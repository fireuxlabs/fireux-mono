/** Misebox culinary browsing categories, independent of supplier catalogues. */
export const INGREDIENT_CATEGORIES = [
  'vegetables',
  'fruit',
  'meat-poultry',
  'fish-seafood',
  'dairy-eggs',
  'grains-pasta-pulses',
  'nuts-seeds',
  'herbs-spices',
  'oils-fats',
  'bread-bakery',
  'sauces-condiments',
  'sugar-baking',
  'drinks-cooking-liquids',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export const INGREDIENT_CATEGORY_OPTIONS: Array<{
  label: string
  value: IngredientCategory
  icon: string
}> = [
  { value: 'vegetables', label: 'Vegetables', icon: 'i-lucide-carrot' },
  { value: 'fruit', label: 'Fruit', icon: 'i-lucide-apple' },
  { value: 'meat-poultry', label: 'Meat & poultry', icon: 'i-lucide-beef' },
  { value: 'fish-seafood', label: 'Fish & seafood', icon: 'i-lucide-fish' },
  { value: 'dairy-eggs', label: 'Dairy & eggs', icon: 'i-lucide-milk' },
  {
    value: 'grains-pasta-pulses',
    label: 'Grains, pasta & pulses',
    icon: 'i-lucide-wheat',
  },
  { value: 'nuts-seeds', label: 'Nuts & seeds', icon: 'i-lucide-nut' },
  { value: 'herbs-spices', label: 'Herbs & spices', icon: 'i-lucide-leaf' },
  { value: 'oils-fats', label: 'Oils & fats', icon: 'i-lucide-droplets' },
  { value: 'bread-bakery', label: 'Bread & bakery', icon: 'i-lucide-sandwich' },
  {
    value: 'sauces-condiments',
    label: 'Sauces & condiments',
    icon: 'i-lucide-cooking-pot',
  },
  {
    value: 'sugar-baking',
    label: 'Sugar & baking',
    icon: 'i-lucide-cake-slice',
  },
  {
    value: 'drinks-cooking-liquids',
    label: 'Drinks & cooking liquids',
    icon: 'i-lucide-glass-water',
  },
]

export const ingredientCategoryLabel = (value: unknown) =>
  INGREDIENT_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ||
  'Uncategorised'
