import { INGREDIENT_CATEGORIES, type IngredientCategory } from '../models/ingredient-taxonomy'

// Read bridge for the explicit v2 -> v3 category migration. This only interprets
// old stored records; current writers accept the canonical categories exclusively.
const legacyCategories: Record<string, IngredientCategory> = {
  produce: 'vegetables', seafood: 'fish-seafood', bakery: 'bread-bakery',
}
const legacyOverrides: Record<string, IngredientCategory> = {}
for (const [category, ids] of Object.entries({
  fruit: 'cherries lemon lime pear pineapple strawberries',
  'oils-fats': 'avocado-oil beef-tallow olive-oil truffle-oil',
  'sugar-baking': 'baking-powder brown-sugar sugar honey vanilla',
  'grains-pasta-pulses': 'cornflour flour baked-beans',
  'herbs-spices': 'fine-salt sea-salt',
  'drinks-cooking-liquids': 'beef-stock dry-white-wine ice sparkling-water still-water',
  vegetables: 'crispy-onions green-salad onion-rings skin-on-fries waffle-fries',
  'bread-bakery': 'gingerbread-biscuits mini-yorkshire-puddings sage-onion-stuffing',
  'meat-poultry': 'beef-carpaccio',
})) {
  for (const id of ids.split(' ')) legacyOverrides[id] = category as IngredientCategory
}

export function readIngredientCategory(id: string, source: Record<string, unknown>): IngredientCategory | undefined {
  const category = String(source.category ?? '').trim()
  if (INGREDIENT_CATEGORIES.includes(category as IngredientCategory)) return category as IngredientCategory
  if (source.schema_version === 2) return legacyOverrides[id] ?? legacyCategories[category]
  return undefined
}
