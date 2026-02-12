import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'

export type SupplierSurface = {
  id?: string
  name?: string
  category?: string
  supplier_headline?: string
  supplier_organization_name?: string
  title?: string
  business_type?: string
  supplier_product_categories?: string[]
  categories?: string[]
  tags?: string[]
}

const firstNonEmpty = (values: unknown[]): string =>
  values.map((value) => safeString(value).trim()).find(Boolean) || ''

const firstFromArray = (value: unknown): string =>
  firstNonEmpty(Array.isArray(value) ? value : [])

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    name: string
    category: string
  }
}

export function useSupplierInterface() {
  function map(supplier: SupplierSurface): SupplierCard.Card {
    const id = safeString(supplier.id).trim()
    const name =
      firstNonEmpty([
        supplier.name,
        supplier.supplier_organization_name,
        supplier.supplier_headline,
        supplier.title,
        id,
      ]) || id

    const category =
      firstNonEmpty([
        supplier.category,
        supplier.business_type,
        firstFromArray(supplier.supplier_product_categories),
        firstFromArray(supplier.categories),
        firstFromArray(supplier.tags),
      ]) || ''

    return {
      id,
      to: id ? `/dashboard/kitchen/supplier/${encodeURIComponent(id)}` : '',
      title: name,
      subtitle: category || '',
      name,
      category,
    }
  }

  function card(target?: SupplierSurface | null | undefined): SupplierCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(target: SupplierSurface): string {
    const mapped = map(target)
    return [
      mapped.id,
      mapped.name,
      mapped.category,
      safeString(target.supplier_headline),
      safeString(target.supplier_organization_name),
      safeStringArray(target.supplier_product_categories).join(' '),
      safeStringArray(target.categories).join(' '),
      safeStringArray(target.tags).join(' '),
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, searchText }
}
