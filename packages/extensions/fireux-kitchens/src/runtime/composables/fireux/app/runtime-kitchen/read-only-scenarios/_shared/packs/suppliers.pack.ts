export type ReadOnlySupplierUnit = 'kg' | 'pc' | 'l' | 'head'

export type ReadOnlySupplierCatalogueRow = {
  id: string
  name: string
  short_name: string
  kind: string
  image_url: string
  contact: {
    email: string
    phone: string
  }
  lead_time_days: number
  delivery_days: string[]
  notes?: string
  active: boolean
}

export type ReadOnlySupplierIngredientCatalogueRow = {
  id: string
  supplier_id: string
  ingredient_id: string
  pack_size_label: string
  pack_cost_minor: number
  currency_code: 'CHF'
  cost_per_unit_minor: number
  unit: ReadOnlySupplierUnit
  lead_time_days?: number
  delivery_days?: string[]
  note?: string
}

export const readOnlySuppliers: ReadOnlySupplierCatalogueRow[] = [
  {
    id: 'supplier-butcher-01',
    name: 'Old Town Butchers',
    short_name: 'Old Town Butchers',
    kind: 'butcher',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=old-town-butchers',
    contact: { email: 'orders@oldtownbutchers.demo', phone: '+41 79 100 0001' },
    lead_time_days: 1,
    delivery_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    notes: 'Core protein supplier.',
    active: true,
  },
  {
    id: 'supplier-produce-01',
    name: 'Market Greens Co.',
    short_name: 'Market Greens',
    kind: 'produce',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=market-greens',
    contact: { email: 'sales@marketgreens.demo', phone: '+41 79 100 0002' },
    lead_time_days: 2,
    delivery_days: ['mon', 'wed', 'fri'],
    notes: 'Produce, herbs, and daily veg.',
    active: true,
  },
  {
    id: 'supplier-bakery-01',
    name: 'Sunrise Bakery',
    short_name: 'Sunrise Bakery',
    kind: 'bakery',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=sunrise-bakery',
    contact: { email: 'hello@sunrisebakery.demo', phone: '+41 79 100 0003' },
    lead_time_days: 1,
    delivery_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    notes: 'Bread and bakery deliveries.',
    active: true,
  },
  {
    id: 'supplier-specialty-01',
    name: 'Pantry Select',
    short_name: 'Pantry Select',
    kind: 'specialty',
    image_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=pantry-select',
    contact: { email: 'orders@pantryselect.demo', phone: '+41 79 100 0004' },
    lead_time_days: 2,
    delivery_days: ['tue', 'thu'],
    notes: 'Specialty pantry and imported dry goods.',
    active: true,
  },
]

export const readOnlySupplierIngredients: ReadOnlySupplierIngredientCatalogueRow[] = [
  {
    id: 'catalogue-beef-patty',
    supplier_id: 'supplier-butcher-01',
    ingredient_id: 'beef-patty',
    pack_size_label: '5 kg case',
    pack_cost_minor: 42000,
    currency_code: 'CHF',
    cost_per_unit_minor: 8400,
    unit: 'kg',
    lead_time_days: 1,
    delivery_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  },
  {
    id: 'catalogue-bacon',
    supplier_id: 'supplier-butcher-01',
    ingredient_id: 'bacon',
    pack_size_label: '2 kg slab',
    pack_cost_minor: 26000,
    currency_code: 'CHF',
    cost_per_unit_minor: 13000,
    unit: 'kg',
    lead_time_days: 1,
    delivery_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  },
  {
    id: 'catalogue-chicken-breast',
    supplier_id: 'supplier-butcher-01',
    ingredient_id: 'chicken-breast',
    pack_size_label: '4 kg box',
    pack_cost_minor: 36000,
    currency_code: 'CHF',
    cost_per_unit_minor: 9000,
    unit: 'kg',
    lead_time_days: 1,
    delivery_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  },
  {
    id: 'catalogue-burger-buns',
    supplier_id: 'supplier-bakery-01',
    ingredient_id: 'burger-buns',
    pack_size_label: '48 buns',
    pack_cost_minor: 7200,
    currency_code: 'CHF',
    cost_per_unit_minor: 150,
    unit: 'pc',
    lead_time_days: 1,
    delivery_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  },
  {
    id: 'catalogue-lettuce',
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'lettuce',
    pack_size_label: '12 heads',
    pack_cost_minor: 3600,
    currency_code: 'CHF',
    cost_per_unit_minor: 300,
    unit: 'head',
    lead_time_days: 1,
    delivery_days: ['mon', 'wed', 'fri'],
  },
  {
    id: 'catalogue-tomato',
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'tomato',
    pack_size_label: '6 kg crate',
    pack_cost_minor: 7800,
    currency_code: 'CHF',
    cost_per_unit_minor: 1300,
    unit: 'kg',
    lead_time_days: 1,
    delivery_days: ['mon', 'wed', 'fri'],
  },
  {
    id: 'catalogue-white-onion',
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'white-onion',
    pack_size_label: '5 kg bag',
    pack_cost_minor: 2800,
    currency_code: 'CHF',
    cost_per_unit_minor: 560,
    unit: 'kg',
    lead_time_days: 1,
    delivery_days: ['mon', 'wed', 'fri'],
  },
  {
    id: 'catalogue-potato',
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'potato',
    pack_size_label: '10 kg sack',
    pack_cost_minor: 5200,
    currency_code: 'CHF',
    cost_per_unit_minor: 520,
    unit: 'kg',
    lead_time_days: 1,
    delivery_days: ['mon', 'wed', 'fri'],
  },
  {
    id: 'catalogue-fryer-oil',
    supplier_id: 'supplier-produce-01',
    ingredient_id: 'fryer-oil',
    pack_size_label: '20 L can',
    pack_cost_minor: 16800,
    currency_code: 'CHF',
    cost_per_unit_minor: 840,
    unit: 'l',
    lead_time_days: 2,
    delivery_days: ['mon', 'wed', 'fri'],
  },
]
