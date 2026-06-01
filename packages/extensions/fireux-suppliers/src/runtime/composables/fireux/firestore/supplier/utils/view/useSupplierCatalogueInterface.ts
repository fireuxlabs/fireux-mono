import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  SupplierCatalogue,
  SupplierProduct,
} from '../../../../../../models/supplier/Supplier.model'
import { useSupplierProductInterface } from './useSupplierProductInterface'

export type SupplierCatalogueInterfaceItem = Partial<SupplierCatalogue> &
  Pick<SupplierCatalogue, 'id' | 'supplier_id'> & {
    supplier_products?: SupplierProduct[]
  }

export namespace SupplierCatalogueItemCard {
  export type Option = {
    id: string
    label: string
    supplierProductId: string
    productId: string
    active: boolean
    imageUrl: string
    subtitle: string
    packLabel: string
    packPriceLabel: string
    unitPriceLabel: string
    unit: string
    badges: string[]
  }

  export type Section = {
    id: string
    label: string
    description: string
    options: Option[]
  }

  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    badges: string[]
    active: boolean
    sections: Section[]
  }
}

export function useSupplierCatalogueInterface() {
  const { interface: makeProductCard } = useSupplierProductInterface()

  function map(item: SupplierCatalogueInterfaceItem): SupplierCatalogueItemCard.Card {
    const id = safeString(item.id).trim()
    const productCardsById = new Map<
      string,
      NonNullable<ReturnType<typeof makeProductCard>>
    >()

    for (const product of item.supplier_products ?? []) {
      const card = makeProductCard(product)
      if (!card) continue
      productCardsById.set(card.id, card)
      productCardsById.set(card.productId, card)
    }

    const sections = [...(item.sections ?? [])]
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((section): SupplierCatalogueItemCard.Section => ({
        id: safeString(section.id).trim(),
        label: safeString(section.label || section.id).trim(),
        description: safeString(section.description).trim(),
        options: [...(section.items ?? [])]
          .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
          .map((option): SupplierCatalogueItemCard.Option => {
            const supplierProductId = safeString(option.supplier_product_id).trim()
            const productId = safeString(option.product_id).trim()
            const productCard =
              productCardsById.get(supplierProductId) ||
              productCardsById.get(productId)

            return {
              id: safeString(option.id).trim(),
              label: safeString(productCard?.title || option.label || supplierProductId).trim(),
              supplierProductId,
              productId,
              active: option.active !== false,
              imageUrl: safeString(productCard?.imageUrl).trim(),
              subtitle: safeString(productCard?.subtitle).trim(),
              packLabel: safeString(productCard?.packLabel).trim(),
              packPriceLabel: safeString(productCard?.packPriceLabel).trim(),
              unitPriceLabel: safeString(productCard?.unitPriceLabel).trim(),
              unit: safeString(productCard?.unit).trim(),
              badges: (productCard?.badges ?? []).filter(
                (badge) =>
                  badge !== productCard?.unit &&
                  badge !== `Unit ${productCard?.unitPriceLabel}`
              ),
            }
          }),
      }))

    const optionCount = sections.reduce(
      (total, section) => total + section.options.length,
      0
    )

    return {
      id,
      to: '',
      title: safeString(item.name || item.id).trim(),
      subtitle: safeString(item.description).trim(),
      badges: [
        `${sections.length} ${sections.length === 1 ? 'ingredient' : 'ingredients'}`,
        `${optionCount} ${optionCount === 1 ? 'option' : 'options'}`,
      ],
      active: item.active !== false,
      sections,
    }
  }

  function buildInterface(
    target?: SupplierCatalogueInterfaceItem | null | undefined
  ): SupplierCatalogueItemCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  return {
    interface: buildInterface,
    pill: buildInterface,
  }
}
