import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  SupplierCatalogue,
  SupplierItem,
} from '../../../../../../models/supplier/Supplier.model'
import { useSupplierItemInterface } from './useSupplierItemInterface'

export type SupplierCatalogueInterfaceItem = Partial<SupplierCatalogue> &
  Pick<SupplierCatalogue, 'id' | 'supplier_id'> & {
    supplier_items?: SupplierItem[]
  }

export namespace SupplierCatalogueItemCard {
  export type Option = {
    id: string
    label: string
    supplierItemId: string
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
    imageUrl: string
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
  const { interface: makeItemCard } = useSupplierItemInterface()

  function map(item: SupplierCatalogueInterfaceItem): SupplierCatalogueItemCard.Card {
    const id = safeString(item.id).trim()
    const itemCardsById = new Map<
      string,
      NonNullable<ReturnType<typeof makeItemCard>>
    >()

    for (const supplierItem of item.supplier_items ?? []) {
      const card = makeItemCard(supplierItem)
      if (!card) continue
      itemCardsById.set(card.id, card)
      itemCardsById.set(card.productId, card)
    }

    const sections = [...(item.sections ?? [])]
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((section): SupplierCatalogueItemCard.Section => {
        const options = [...(section.items ?? [])]
          .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
          .map((option): SupplierCatalogueItemCard.Option => {
            const supplierItemId = safeString(option.supplier_item_id).trim()
            const productId = safeString(option.product_id).trim()
            const itemCard =
              itemCardsById.get(supplierItemId) ||
              itemCardsById.get(productId)

            return {
              id: safeString(option.id).trim(),
              label: safeString(itemCard?.title || option.label || supplierItemId).trim(),
              supplierItemId,
              productId,
              active: option.active !== false,
              imageUrl: safeString(itemCard?.imageUrl).trim(),
              subtitle: safeString(itemCard?.subtitle).trim(),
              packLabel: safeString(itemCard?.packLabel).trim(),
              packPriceLabel: safeString(itemCard?.packPriceLabel).trim(),
              unitPriceLabel: safeString(itemCard?.unitPriceLabel).trim(),
              unit: safeString(itemCard?.unit).trim(),
              badges: (itemCard?.badges ?? []).filter(
                (badge) =>
                  badge !== itemCard?.unit &&
                  badge !== `Unit ${itemCard?.unitPriceLabel}`
              ),
            }
          })

        return {
          id: safeString(section.id).trim(),
          label: safeString(section.label || section.id).trim(),
          description: safeString(section.description).trim(),
          imageUrl: safeString(options.find((option) => option.imageUrl)?.imageUrl).trim(),
          options,
        }
      })

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
