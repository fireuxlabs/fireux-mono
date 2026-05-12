import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { SupplierProduct } from '../../../../../../models/supplier/Supplier.model'

export type SupplierProductInterfaceItem = Partial<SupplierProduct> &
  Pick<SupplierProduct, 'id' | 'supplier_id' | 'product_id'> & {
    supplier_name?: string
  }

const formatPrice = (valueMinor?: number | null, currencyCode?: string) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: safeString(currencyCode).trim().toUpperCase() || 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valueMinor || 0) / 100)

const resolveUnitCostMinor = (item: SupplierProductInterfaceItem) => {
  const packCostMinor = Number(item.pack_cost_minor || 0)
  const quantityPerPack = Number(item.quantity_per_pack || 0)
  if (!packCostMinor || !quantityPerPack) return 0
  return Math.round(packCostMinor / quantityPerPack)
}

export namespace SupplierProductItemCard {
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

export function useSupplierProductInterface() {
  type SupplierProductPill = SupplierProductItemCard.Card

  type SupplierProductCell = Pick<
    SupplierProductItemCard.Card,
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

  function map(item: SupplierProductInterfaceItem): SupplierProductItemCard.Card {
    const id = safeString(item.id).trim()
    const productId = safeString(item.product_id || item.ingredient_id).trim()
    const name = safeString(item.name_override || item.product_id).trim()
    const ingredientId = safeString(item.ingredient_id).trim()
    const packLabel = safeString(item.pack_size_label).trim()
    const unit = safeString(item.unit).trim() || 'unit'
    const supplierSku = safeString(item.supplier_sku).trim()
    const unitCostMinor = resolveUnitCostMinor(item)
    const badges = [
      unit,
      `Unit ${formatPrice(unitCostMinor, item.currency_code)}`,
      supplierSku ? `SKU ${supplierSku}` : '',
    ].filter(Boolean)

    return {
      id,
      to: '',
      imageUrl: safeString(item.image_override).trim(),
      title: name,
      subtitle: packLabel,
      badges,
      name,
      productId,
      ingredientId,
      packLabel,
      unit,
      unitPriceLabel: formatPrice(unitCostMinor, item.currency_code),
      packPriceLabel: formatPrice(item.pack_cost_minor, item.currency_code),
    }
  }

  function buildInterface(
    target?: SupplierProductInterfaceItem | null | undefined
  ): SupplierProductItemCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: SupplierProductInterfaceItem | null | undefined
  ): SupplierProductPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return base
  }

  function cell(
    target?: SupplierProductInterfaceItem | null | undefined
  ): SupplierProductCell | null {
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
