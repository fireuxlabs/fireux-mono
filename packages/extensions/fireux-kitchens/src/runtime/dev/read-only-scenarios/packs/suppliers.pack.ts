export const readOnlySuppliers = [
  {
    id: 'supplier-butcher-01',
    name: 'Old Town Butchers',
    short_name: 'Old Town Butchers',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=old-town-butchers',
  },
  {
    id: 'supplier-produce-01',
    name: 'Market Greens Co.',
    short_name: 'Market Greens',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=market-greens',
  },
  {
    id: 'supplier-bakery-01',
    name: 'Sunrise Bakery',
    short_name: 'Sunrise Bakery',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=sunrise-bakery',
  },
  {
    id: 'supplier-specialty-01',
    name: 'Pantry Select',
    short_name: 'Pantry Select',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=pantry-select',
  },
] as const

export type ReadOnlySupplierUnit = 'kg' | 'each' | 'l'

export type ReadOnlySupplierIngredient = {
  supplier_id: string
  ingredient_id: string
  currency: 'CHF'
  price: number
  unit: ReadOnlySupplierUnit
  pack_size: number
  pack_unit: ReadOnlySupplierUnit
  lead_days?: number
  min_order?: number
  note?: string
}

/**
 * Read-only supplier catalogue lines.
 * Prices are for the full pack in CHF.
 */
export const readOnlySupplierIngredients: ReadOnlySupplierIngredient[] = [
  {
    supplier_id: 'supplier-butcher-01',
    ingredient_id: 'ingredient-beef-patty',
    currency: 'CHF',
    price: 48,
    unit: 'each',
    pack_size: 40,
    pack_unit: 'each',
    lead_days: 1,
    note: 'Fresh, 150g patties',
  },
  {
    supplier_id: 'supplier-butcher-01',
    ingredient_id: 'ingredient-bacon',
    currency: 'CHF',
    price: 22,
    unit: 'kg',
    pack_size: 1,
    pack_unit: 'kg',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-butcher-01',
    ingredient_id: 'ingredient-chicken-breast',
    currency: 'CHF',
    price: 19.5,
    unit: 'kg',
    pack_size: 1,
    pack_unit: 'kg',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'ingredient-lettuce',
    currency: 'CHF',
    price: 18,
    unit: 'each',
    pack_size: 12,
    pack_unit: 'each',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'ingredient-tomato',
    currency: 'CHF',
    price: 24,
    unit: 'kg',
    pack_size: 3,
    pack_unit: 'kg',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'ingredient-white-onion',
    currency: 'CHF',
    price: 14,
    unit: 'kg',
    pack_size: 5,
    pack_unit: 'kg',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'ingredient-potato',
    currency: 'CHF',
    price: 16,
    unit: 'kg',
    pack_size: 10,
    pack_unit: 'kg',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'ingredient-fryer-oil',
    currency: 'CHF',
    price: 34,
    unit: 'l',
    pack_size: 10,
    pack_unit: 'l',
    lead_days: 2,
    note: 'Sunflower',
  },
  {
    supplier_id: 'supplier-bakery-01',
    ingredient_id: 'ingredient-burger-buns',
    currency: 'CHF',
    price: 16,
    unit: 'each',
    pack_size: 24,
    pack_unit: 'each',
    lead_days: 1,
  },
  {
    supplier_id: 'supplier-specialty-01',
    ingredient_id: 'ingredient-fryer-oil',
    currency: 'CHF',
    price: 39,
    unit: 'l',
    pack_size: 10,
    pack_unit: 'l',
    lead_days: 2,
    note: 'Premium blend',
  },
  {
    supplier_id: 'supplier-specialty-01',
    ingredient_id: 'ingredient-white-onion',
    currency: 'CHF',
    price: 7.5,
    unit: 'kg',
    pack_size: 2,
    pack_unit: 'kg',
    lead_days: 2,
    note: 'Small pack option',
  },
]
