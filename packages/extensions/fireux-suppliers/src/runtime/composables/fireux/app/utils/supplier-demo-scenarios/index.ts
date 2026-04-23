import type { Supplier } from '../../../../../models/supplier/Supplier.model'

export type DemoSupplierListItem = Partial<Supplier> & {
  id: string
  supplier_id: string
  name: string
  supplier_organization_name: string
  supplier_headline: string
  supplier_image?: string
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
    supplier_image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
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
})

export const getDemoSupplier = (supplierId?: string): DemoSupplierListItem | null => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return null

  const supplier = demoSuppliers.find((entry) => normalizeString(entry.id) === resolvedId)
  return supplier ? cloneSupplier(supplier) : null
}

export const getDemoSuppliers = (): DemoSupplierListItem[] =>
  demoSuppliers.map((supplier) => cloneSupplier(supplier))
