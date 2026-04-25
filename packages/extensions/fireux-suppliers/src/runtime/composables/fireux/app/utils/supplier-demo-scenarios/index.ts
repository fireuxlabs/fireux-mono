import type { Supplier } from '../../../../../models/supplier/Supplier.model'

export type DemoSupplierListItem = Partial<Supplier> & {
  id: string
  supplier_id: string
  name: string
  supplier_organization_name: string
  supplier_headline: string
  supplier_image?: string
  demo_state?: 'official' | 'public'
  demo_catalogue_state?: 'integrated' | 'public_only'
  demo_ingredient_ids?: string[]
}

const demoSuppliers: DemoSupplierListItem[] = [
  {
    id: 'city-produce',
    supplier_id: 'city-produce',
    name: 'City Produce',
    supplier_organization_name: 'City Produce',
    supplier_headline: 'Daily meat and dry-store drops',
    supplier_product_categories: ['Meat', 'Dry Store'],
    supplier_delivery_areas: ['Central'],
    summary: 'Official supplier demo with active catalogue coverage for meat and pantry basics.',
    supplier_bio:
      'Claimed supplier record used by multiple kitchens for proteins and service pantry staples.',
    demo_state: 'official',
    demo_catalogue_state: 'integrated',
    demo_ingredient_ids: ['beef-smash-patties', 'chicken-thigh'],
    supplier_image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&h=240&q=80',
  },
  {
    id: 'daily-bakehouse',
    supplier_id: 'daily-bakehouse',
    name: 'Daily Bakehouse',
    supplier_organization_name: 'Daily Bakehouse',
    supplier_headline: 'Buns and breads before service',
    supplier_product_categories: ['Bakery'],
    supplier_delivery_areas: ['Central'],
    summary: 'Official supplier demo with a live bakery catalogue used across the demo kitchens.',
    supplier_bio:
      'Claimed supplier record focused on bread and bakehouse items for daily service.',
    demo_state: 'official',
    demo_catalogue_state: 'integrated',
    demo_ingredient_ids: ['potato-buns', 'sourdough-loaf'],
    supplier_image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
  },
  {
    id: 'green-larder',
    supplier_id: 'green-larder',
    name: 'Green Larder',
    supplier_organization_name: 'Green Larder',
    supplier_headline: 'Leafy greens and herbs for fast service kitchens',
    supplier_product_categories: ['Produce', 'Herbs'],
    supplier_delivery_areas: ['Central'],
    summary:
      'Public supplier record already linked by kitchens while the official supplier catalogue is still pending.',
    supplier_bio:
      'Unclaimed public supplier used in the demo world for leaves, herbs, and vegetable prep.',
    demo_state: 'public',
    demo_catalogue_state: 'public_only',
    demo_ingredient_ids: [
      'mixed-greens',
      'iceberg-lettuce',
      'courgette',
      'basil-oil',
      'baby-potatoes',
      'bitter-leaves',
    ],
    supplier_image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
  },
  {
    id: 'pantry-house',
    supplier_id: 'pantry-house',
    name: 'Pantry House',
    supplier_organization_name: 'Pantry House',
    supplier_headline: 'Cultured dairy, pickles, and pantry staples for service kitchens',
    supplier_product_categories: ['Dairy', 'Preserves', 'Pantry'],
    supplier_delivery_areas: ['Central'],
    summary:
      'Public supplier record linked by kitchens for dairy and pantry items before the official catalogue is connected.',
    supplier_bio:
      'Unclaimed public supplier record covering pickles, ricotta, butter, and other small-goods staples.',
    demo_state: 'public',
    demo_catalogue_state: 'public_only',
    demo_ingredient_ids: [
      'house-pickles',
      'american-cheese',
      'mayonnaise',
      'ketchup',
      'yellow-mustard',
      'ricotta',
      'herb-butter',
    ],
    supplier_image:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=240&h=240&q=80',
  },
]

const normalizeString = (value: unknown) => String(value ?? '').trim()

const cloneSupplier = (supplier: DemoSupplierListItem): DemoSupplierListItem => ({
  ...supplier,
  supplier_product_categories: Array.isArray(supplier.supplier_product_categories)
    ? [...supplier.supplier_product_categories]
    : [],
  supplier_delivery_areas: Array.isArray(supplier.supplier_delivery_areas)
    ? [...supplier.supplier_delivery_areas]
    : [],
  demo_ingredient_ids: Array.isArray(supplier.demo_ingredient_ids)
    ? [...supplier.demo_ingredient_ids]
    : [],
})

export const getDemoSupplier = (supplierId?: string): DemoSupplierListItem | null => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return null

  const supplier = demoSuppliers.find((entry) => normalizeString(entry.id) === resolvedId)
  return supplier ? cloneSupplier(supplier) : null
}

export const getDemoSuppliers = (): DemoSupplierListItem[] =>
  demoSuppliers.map((supplier) => cloneSupplier(supplier))
