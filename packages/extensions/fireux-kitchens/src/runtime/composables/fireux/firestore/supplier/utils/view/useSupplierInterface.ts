import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'

export type SupplierSurface = {
  id?: string
  supplier_id?: string
  source_supplier_id?: string
  name?: string
  short_name?: string
  category?: string
  image_url?: string
  logo_url?: string
  avatar_url?: string
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
    avatarUrl: string
  }
}

export function useSupplierInterface() {
  function map(supplier: SupplierSurface): SupplierCard.Card {
    const id = safeString(supplier.id).trim()
    const profileId = firstNonEmpty([supplier.supplier_id, supplier.source_supplier_id, id]) || id
    const name =
      firstNonEmpty([
        supplier.name,
        supplier.short_name,
        supplier.supplier_organization_name,
        supplier.supplier_headline,
        supplier.title,
        profileId,
      ]) || profileId || id

    const category =
      firstNonEmpty([
        supplier.category,
        supplier.business_type,
        firstFromArray(supplier.supplier_product_categories),
        firstFromArray(supplier.categories),
        firstFromArray(supplier.tags),
      ]) || ''

    const avatarUrl =
      firstNonEmpty([supplier.image_url, supplier.logo_url, supplier.avatar_url]) || ''

    return {
      id: profileId || id,
      to: profileId ? `/suppliers/${encodeURIComponent(profileId)}` : '',
      title: name,
      subtitle: category || '',
      name,
      category,
      avatarUrl,
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
      safeString(target.short_name),
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
