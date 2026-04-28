import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { DemoSupplierCatalogueItem } from '../../../../app/utils/supplier-demo-scenarios'

export type SupplierCatalogueInterfaceItem = DemoSupplierCatalogueItem & {
  supplier_name?: string
}

const formatPrice = (valueMinor?: number, currencyCode?: string) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: safeString(currencyCode).trim().toUpperCase() || 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valueMinor || 0) / 100)

export namespace SupplierCatalogueItemCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    badges: string[]
    name: string
    productId: string
    ingredientId: string
    packLabel: string
    unit: string
    unitPriceLabel: string
    packPriceLabel: string
  }
}

export function useSupplierCatalogueItemInterface() {
  type SupplierCataloguePill = SupplierCatalogueItemCard.Card

  type SupplierCatalogueCell = Pick<
    SupplierCatalogueItemCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'name'
    | 'subtitle'
    | 'productId'
    | 'ingredientId'
    | 'unitPriceLabel'
    | 'packPriceLabel'
    | 'packLabel'
  >

  function map(
    item: SupplierCatalogueInterfaceItem
  ): SupplierCatalogueItemCard.Card {
    const id = safeString(item.id).trim()
    const productId = safeString(item.product_id || item.ingredient_id).trim()
    const name = safeString(item.product_name || item.ingredient_name).trim()
    const ingredientId = safeString(item.ingredient_id).trim()
    const packLabel = safeString(item.pack_size_label).trim()
    const unit = safeString(item.unit).trim() || 'unit'
    const supplierSku = safeString(item.supplier_sku).trim()
    const badges = [
      unit,
      `Unit ${formatPrice(item.cost_per_unit_minor, item.currency_code)}`,
      supplierSku ? `SKU ${supplierSku}` : '',
    ].filter(Boolean)

    return {
      id,
      to: '',
      imageUrl: safeString(item.product_image_url || item.image_url).trim(),
      title: name,
      subtitle: packLabel,
      badges,
      name,
      productId,
      ingredientId,
      packLabel,
      unit,
      unitPriceLabel: formatPrice(item.cost_per_unit_minor, item.currency_code),
      packPriceLabel: formatPrice(item.pack_cost_minor, item.currency_code),
    }
  }

  function buildInterface(
    target?: SupplierCatalogueInterfaceItem | null | undefined
  ): SupplierCatalogueItemCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: SupplierCatalogueInterfaceItem | null | undefined
  ): SupplierCataloguePill | null {
    const base = buildInterface(target)
    if (!base) return null
    return base
  }

  function cell(
    target?: SupplierCatalogueInterfaceItem | null | undefined
  ): SupplierCatalogueCell | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      productId: base.productId,
      ingredientId: base.ingredientId,
      unitPriceLabel: base.unitPriceLabel,
      packPriceLabel: base.packPriceLabel,
      packLabel: base.packLabel,
    }
  }

  return {
    interface: toInterface,
    pill,
    cell,
  }
}
