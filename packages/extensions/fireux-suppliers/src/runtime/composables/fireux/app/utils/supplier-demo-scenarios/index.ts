import type {
  Supplier,
  SupplierCatalogue,
  SupplierCatalogueState,
  SupplierProduct,
  SupplierState,
} from '../../../../../models/supplier/Supplier.model'

export type DemoSupplierListItem = Partial<Supplier> & {
  id: string
  company_id: string
  supplier_organization_name: string
  supplier_headline: string
  supplier_image?: string
  state?: SupplierState
  catalogue_state?: SupplierCatalogueState
  linked_ingredient_ids?: string[]
}

type DemoSupplierProductSeed = Pick<
  SupplierProduct,
  | 'id'
  | 'supplier_id'
  | 'product_id'
  | 'pack_size_label'
  | 'unit'
  | 'pack_cost_minor'
  | 'currency_code'
> &
  Partial<Pick<
    SupplierProduct,
    | 'ingredient_id'
    | 'name_override'
    | 'description_override'
    | 'image_override'
    | 'supplier_sku'
    | 'quantity_per_pack'
    | 'order_unit'
    | 'availability_state'
    | 'lead_time_days'
    | 'min_order_quantity'
    | 'active'
    | 'metadata'
  >>

export type DemoSupplierProductItem = SupplierProduct

const DEMO_TIMESTAMP = { seconds: 0, nanoseconds: 0 } as const

const demoSuppliers: DemoSupplierListItem[] = [
  {
    id: 'city-butchers',
    company_id: 'city-butchers',
    app_scope_state: 'parent_app',
    app_scope_app_id: 'misebox-app',
    supplier_organization_name: 'City Butchers',
    tagline: 'Fresh produce and kitchen essentials for busy service',
    supplier_headline: 'Whole cuts, burger grind beef, and daily meat drops',
    supplier_product_categories: ['Meat', 'Dry Store'],
    supplier_delivery_areas: ['Central'],
    summary:
      'Official supplier record with active butcher-style catalogue coverage for burger beef, chicken, and kitchen-ready meat supply.',
    supplier_bio:
      'Claimed supplier record used by multiple kitchens for proteins, whole cuts, and in-house grind burger supply.',
    state: 'official',
    catalogue_state: 'integrated',
    linked_ingredient_ids: ['beef-smash-patties', 'chicken-thigh'],
    supplier_image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&h=240&q=80',
  },
  {
    id: 'daily-bakehouse',
    company_id: 'daily-bakehouse',
    app_scope_state: 'parent_app',
    app_scope_app_id: 'misebox-app',
    supplier_organization_name: 'Daily Bakehouse',
    tagline: 'Service-ready breads and buns for busy kitchens',
    supplier_headline: 'Buns and breads before service',
    supplier_product_categories: ['Bakery'],
    supplier_delivery_areas: ['Central'],
    summary: 'Official supplier record with a live bakery catalogue used across service kitchens.',
    supplier_bio:
      'Claimed supplier record focused on bread and bakehouse items for daily service.',
    state: 'official',
    catalogue_state: 'integrated',
    linked_ingredient_ids: [
      'potato-buns',
      'brioche-buns',
      'gua-bao-buns',
      'mini-buns',
      'sourdough-loaf',
    ],
    supplier_image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
  },
  {
    id: 'green-larder',
    company_id: 'green-larder',
    app_scope_state: 'root_only',
    app_scope_app_id: '',
    supplier_organization_name: 'Green Larder',
    tagline: 'Leafy produce and herbs for quick kitchen prep',
    supplier_headline: 'Leafy greens and herbs for fast service kitchens',
    supplier_product_categories: ['Produce', 'Herbs'],
    supplier_delivery_areas: ['Central'],
    summary:
      'Public supplier record already linked by kitchens while the official supplier catalogue is still pending.',
    supplier_bio:
      'Unclaimed public supplier used for leaves, herbs, and vegetable prep.',
    state: 'public',
    catalogue_state: 'public_only',
    linked_ingredient_ids: [
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
    company_id: 'pantry-house',
    app_scope_state: 'root_only',
    app_scope_app_id: '',
    supplier_organization_name: 'Pantry House',
    tagline: 'Dairy, pickles, and pantry staples for service',
    supplier_headline: 'Cultured dairy, pickles, and pantry staples for service kitchens',
    supplier_product_categories: ['Dairy', 'Preserves', 'Pantry'],
    supplier_delivery_areas: ['Central'],
    summary:
      'Public supplier record linked by kitchens for dairy and pantry items before the official catalogue is connected.',
    supplier_bio:
      'Unclaimed public supplier record covering pickles, ricotta, butter, and other small-goods staples.',
    state: 'public',
    catalogue_state: 'public_only',
    linked_ingredient_ids: [
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
const normalizeCurrency = (value: unknown) =>
  String(value ?? '').trim().toUpperCase() || 'CHF'

const cloneSupplier = (supplier: DemoSupplierListItem): DemoSupplierListItem => ({
  ...supplier,
  supplier_product_categories: Array.isArray(supplier.supplier_product_categories)
    ? [...supplier.supplier_product_categories]
    : [],
  supplier_delivery_areas: Array.isArray(supplier.supplier_delivery_areas)
    ? [...supplier.supplier_delivery_areas]
    : [],
  linked_ingredient_ids: Array.isArray(supplier.linked_ingredient_ids)
    ? [...supplier.linked_ingredient_ids]
    : [],
})

const demoSupplierProductsBySupplierId: Record<
  string,
  DemoSupplierProductSeed[]
> = {
  'city-butchers': [
    {
      id: 'city-butchers-beef-smash-patties-10-pack',
      supplier_id: 'city-butchers',
      product_id: 'beef-smash-patties-10-pack',
      ingredient_id: 'beef-smash-patties',
      name_override: 'Beef Smash Patties',
      pack_size_label: '10 patties pack',
      image_override:
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 10,
      order_unit: 'pack',
      pack_cost_minor: 1900,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'city-butchers-beef-smash-patties-20-case',
      supplier_id: 'city-butchers',
      product_id: 'beef-smash-patties-20-case',
      ingredient_id: 'beef-smash-patties',
      name_override: 'Beef Smash Patties',
      pack_size_label: '20 patties case',
      image_override:
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 20,
      order_unit: 'case',
      pack_cost_minor: 3600,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'city-butchers-beef-smash-patties-100-crate',
      supplier_id: 'city-butchers',
      product_id: 'beef-smash-patties-100-crate',
      ingredient_id: 'beef-smash-patties',
      name_override: 'Beef Smash Patties',
      pack_size_label: '100 patties crate',
      image_override:
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 100,
      order_unit: 'crate',
      pack_cost_minor: 17000,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'city-butchers-chicken-thigh-2kg-tray',
      supplier_id: 'city-butchers',
      product_id: 'chicken-thigh-2kg-tray',
      ingredient_id: 'chicken-thigh',
      name_override: 'Chicken Thigh',
      pack_size_label: '2 kg tray',
      image_override:
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 20,
      order_unit: 'tray',
      pack_cost_minor: 4600,
      currency_code: 'CHF',
      unit: '100g',
    },
    {
      id: 'city-butchers-chicken-thigh-5kg-tray',
      supplier_id: 'city-butchers',
      product_id: 'chicken-thigh-5kg-tray',
      ingredient_id: 'chicken-thigh',
      name_override: 'Chicken Thigh',
      pack_size_label: '5 kg tray',
      image_override:
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 50,
      order_unit: 'tray',
      pack_cost_minor: 11000,
      currency_code: 'CHF',
      unit: '100g',
    },
    {
      id: 'city-butchers-chicken-thigh-10kg-case',
      supplier_id: 'city-butchers',
      product_id: 'chicken-thigh-10kg-case',
      ingredient_id: 'chicken-thigh',
      name_override: 'Chicken Thigh',
      pack_size_label: '10 kg case',
      image_override:
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 100,
      order_unit: 'case',
      pack_cost_minor: 21000,
      currency_code: 'CHF',
      unit: '100g',
    },
  ],
  'daily-bakehouse': [
    {
      id: 'daily-bakehouse-potato-buns',
      supplier_id: 'daily-bakehouse',
      product_id: 'potato-buns',
      ingredient_id: 'potato-buns',
      name_override: 'Potato Buns',
      pack_size_label: '24 buns crate',
      image_override:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 24,
      order_unit: 'crate',
      pack_cost_minor: 2160,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'daily-bakehouse-brioche-buns',
      supplier_id: 'daily-bakehouse',
      product_id: 'brioche-buns',
      ingredient_id: 'brioche-buns',
      name_override: 'Brioche Buns',
      pack_size_label: '24 buns crate',
      image_override:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 24,
      order_unit: 'crate',
      pack_cost_minor: 2640,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'daily-bakehouse-gua-bao-buns',
      supplier_id: 'daily-bakehouse',
      product_id: 'gua-bao-buns',
      ingredient_id: 'gua-bao-buns',
      name_override: 'Gua Bao Buns',
      pack_size_label: '30 bao case',
      image_override:
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 30,
      order_unit: 'case',
      pack_cost_minor: 2400,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'daily-bakehouse-mini-buns',
      supplier_id: 'daily-bakehouse',
      product_id: 'mini-buns',
      ingredient_id: 'mini-buns',
      name_override: 'Mini Buns',
      pack_size_label: '40 mini buns crate',
      image_override:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 40,
      order_unit: 'crate',
      pack_cost_minor: 2200,
      currency_code: 'CHF',
      unit: 'piece',
    },
    {
      id: 'daily-bakehouse-sourdough-loaf',
      supplier_id: 'daily-bakehouse',
      product_id: 'sourdough-loaf',
      ingredient_id: 'sourdough-loaf',
      name_override: 'Sourdough Loaf',
      pack_size_label: '8 loaf bake',
      image_override:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
      quantity_per_pack: 8,
      order_unit: 'bake',
      pack_cost_minor: 5200,
      currency_code: 'CHF',
      unit: 'loaf',
    },
  ],
}

const cloneProductItem = (
  item: DemoSupplierProductSeed
): DemoSupplierProductItem => ({
  ...item,
  id: normalizeString(item.id),
  supplier_id: normalizeString(item.supplier_id),
  product_id: normalizeString(item.product_id) || normalizeString(item.ingredient_id),
  ingredient_id: normalizeString(item.ingredient_id),
  name_override: normalizeString(item.name_override),
  description_override: normalizeString(item.description_override),
  image_override: normalizeString(item.image_override),
  pack_size_label: normalizeString(item.pack_size_label),
  supplier_sku: normalizeString(item.supplier_sku),
  pack_cost_minor: Math.max(0, Math.round(Number(item.pack_cost_minor || 0))),
  currency_code: normalizeCurrency(item.currency_code),
  unit: normalizeString(item.unit) || 'unit',
  quantity_per_pack:
    item.quantity_per_pack === null ? null : Number(item.quantity_per_pack || 0) || null,
  order_unit: normalizeString(item.order_unit || item.unit) || 'unit',
  availability_state: normalizeString(item.availability_state) || 'available',
  lead_time_days:
    item.lead_time_days === null ? null : Number(item.lead_time_days || 0) || null,
  min_order_quantity:
    item.min_order_quantity === null ? null : Number(item.min_order_quantity || 0) || null,
  active: item.active !== false,
  metadata: item.metadata ?? {},
  created: {
    at: DEMO_TIMESTAMP,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: DEMO_TIMESTAMP,
    by: undefined,
  },
})

const titleFromSlug = (value: unknown) =>
  normalizeString(value)
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')

export const getDemoSupplier = (supplierId?: string): DemoSupplierListItem | null => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return null

  const supplier = demoSuppliers.find((entry) => normalizeString(entry.id) === resolvedId)
  return supplier ? cloneSupplier(supplier) : null
}

export const getDemoSuppliers = (): DemoSupplierListItem[] =>
  demoSuppliers.map((supplier) => cloneSupplier(supplier))

export const getDemoSupplierProductItems = (
  supplierId?: string
): DemoSupplierProductItem[] => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return []

  const items = demoSupplierProductsBySupplierId[resolvedId] ?? []
  return items.map((item) => cloneProductItem(item))
}

export const getDemoSupplierCatalogueItems = (
  supplierId?: string
): SupplierCatalogue[] => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return []

  const products = getDemoSupplierProductItems(resolvedId)
  if (!products.length) return []

  const sectionsByIngredient = new Map<string, SupplierCatalogue['sections'][number]>()

  for (const product of products) {
    const ingredientId = normalizeString(product.ingredient_id || product.product_id)
    if (!ingredientId) continue

    let section = sectionsByIngredient.get(ingredientId)
    if (!section) {
      section = {
        id: ingredientId,
        label: normalizeString(product.name_override) || titleFromSlug(ingredientId),
        description: '',
        items: [],
        sort_order: sectionsByIngredient.size,
      }
      sectionsByIngredient.set(ingredientId, section)
    }

    section.items.push({
      id: `${product.id}-catalogue-item`,
      supplier_product_id: product.id,
      product_id: product.product_id,
      label: product.pack_size_label || product.name_override || product.product_id,
      active: product.active !== false,
      sort_order: section.items.length,
    })
  }

  const sections = [...sectionsByIngredient.values()].map((section) => ({
    ...section,
    description: `${section.items.length} purchasing ${
      section.items.length === 1 ? 'option' : 'options'
    }`,
  }))

  return [
    {
      id: `${resolvedId}-service-catalogue`,
      supplier_id: resolvedId,
      name: 'Service Catalogue',
      description: 'Purchasing options grouped by ingredient.',
      active: true,
      sections,
      sort_order: 0,
      created: {
        at: DEMO_TIMESTAMP,
        by: undefined,
        app_id: undefined,
      },
      updated: {
        at: DEMO_TIMESTAMP,
        by: undefined,
      },
    },
  ]
}
