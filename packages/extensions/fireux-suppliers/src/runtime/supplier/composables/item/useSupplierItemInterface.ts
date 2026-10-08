import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { SupplierItem } from '../../models/supplier-item.model.ts'

export type SupplierItemSurface = Partial<SupplierItem> &
  Pick<SupplierItem, 'id' | 'supplier_id' | 'product_id'> & {
    supplier_name?: string
  }

const formatPrice = (
  valueMinor?: number | null,
  currencyCode?: string,
  derived = false
) => {
  const currency = safeString(currencyCode).trim().toUpperCase()
  if (
    typeof valueMinor !== 'number' ||
    !Number.isFinite(valueMinor) ||
    valueMinor < 0 ||
    !/^[A-Z]{3}$/.test(currency)
  )
    return ''
  const standard = new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  })
  const digits = standard.resolvedOptions().maximumFractionDigits ?? 2
  const maxDigits = derived ? Math.max(digits, 6) : digits
  const formatter = derived
    ? new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency,
        maximumFractionDigits: maxDigits,
      })
    : standard
  const amount = valueMinor / 10 ** digits
  const quantum = 10 ** -maxDigits
  return amount > 0 && amount < quantum
    ? `< ${formatter.format(quantum)}`
    : formatter.format(amount)
}

const resolveUnitCostMinor = (item: SupplierItemSurface): number | null => {
  const price = item.pack_cost_minor
  const quantity = item.quantity_per_pack
  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    typeof quantity !== 'number' ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  )
    return null
  return price / quantity
}

export namespace SupplierItemCard {
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

export function useSupplierItemInterface() {
  type SupplierItemPill = SupplierItemCard.Card

  type SupplierItemCell = Pick<
    SupplierItemCard.Card,
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

  function map(item: SupplierItemSurface): SupplierItemCard.Card {
    const id = safeString(item.id).trim()
    const productId = safeString(item.product_id).trim()
    const name = safeString(item.name_override || item.product_id).trim()
    const ingredientId = safeString(item.ingredient_id).trim()
    const packLabel = safeString(item.pack_size_label).trim()
    const unit = safeString(item.unit).trim() || 'unit'
    const supplierSku = safeString(item.supplier_sku).trim()
    const unitCostMinor = resolveUnitCostMinor(item)
    const unitPriceLabel = formatPrice(unitCostMinor, item.currency_code, true)
    const badges = [
      unit,
      unitPriceLabel ? `Unit ${unitPriceLabel}` : '',
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
      unitPriceLabel,
      packPriceLabel: formatPrice(item.pack_cost_minor, item.currency_code),
    }
  }

  function buildInterface(
    target?: SupplierItemSurface | null | undefined
  ): SupplierItemCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: SupplierItemSurface | null | undefined
  ): SupplierItemPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return base
  }

  function cell(
    target?: SupplierItemSurface | null | undefined
  ): SupplierItemCell | null {
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
