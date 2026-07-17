import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/core/money.model'
import type {
  MenuManifestAddOn,
  MenuManifestItem,
  MenuManifestPriceOption,
} from '../../../../models/kitchen/menu/menu-detail.model'
import {
  menuOrderPositivePrice,
  resolveMenuOrderAddOns,
  resolveMenuOrderPriceOptions,
} from '../../../../utils/menu-order-options'

export type MenuOrderBasketInput = {
  item: MenuManifestItem
  variantId?: string
  addOnIds: string[]
  quantity: number
}

export type MenuOrderBasketLine = {
  id: string
  configurationKey: string
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  variant: MenuManifestPriceOption | null
  addOns: MenuManifestAddOn[]
}

type UseMenuOrderBasketOptions = {
  currencyCode: MaybeRefOrGetter<string>
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

export function useMenuOrderBasket(options: UseMenuOrderBasketOptions) {
  const lines = ref<MenuOrderBasketLine[]>([])
  let lineSequence = 0
  const currencyCode = computed(() => {
    const code = String(toValue(options.currencyCode) || '').trim().toUpperCase()

    return /^[A-Z]{3}$/.test(code) ? code : 'CHF'
  })
  const quantity = computed(() =>
    lines.value.reduce(
      (sum: number, line: MenuOrderBasketLine) => sum + line.quantity,
      0
    )
  )
  const total = computed(() =>
    lines.value.reduce(
      (sum: number, line: MenuOrderBasketLine) =>
        sum + line.unitPrice * line.quantity,
      0
    )
  )
  const totalLabel = computed(() =>
    total.value > 0
      ? formatCurrencyAmount(total.value, {
          currencyCode: currencyCode.value,
          format: 'code',
        })
      : `0 ${currencyCode.value}`
  )

  function add(input: MenuOrderBasketInput) {
    const resolved = resolveInput(input)
    if (!resolved) return false

    let remaining = resolved.quantity
    for (const line of lines.value) {
      if (line.configurationKey !== resolved.configurationKey || line.quantity >= 99) {
        continue
      }

      const added = Math.min(remaining, 99 - line.quantity)
      line.quantity += added
      remaining -= added
      if (!remaining) return true
    }

    while (remaining > 0) {
      const lineQuantity = Math.min(remaining, 99)
      lineSequence += 1
      lines.value.push({
        ...resolved,
        id: `${resolved.configurationKey}:${lineSequence}`,
        quantity: lineQuantity,
      })
      remaining -= lineQuantity
    }

    return true
  }

  function clear() {
    lines.value = []
    lineSequence = 0
  }

  function setQuantity(lineId: string, nextQuantity: number) {
    const id = canonicalText(lineId)
    if (
      !id ||
      typeof nextQuantity !== 'number' ||
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 1 ||
      nextQuantity > 99
    ) {
      return false
    }

    const line = lines.value.find(candidate => candidate.id === id)
    if (!line) return false

    line.quantity = nextQuantity
    return true
  }

  function remove(lineId: string) {
    const id = canonicalText(lineId)
    if (!id) return false

    const lineIndex = lines.value.findIndex(candidate => candidate.id === id)
    if (lineIndex < 0) return false

    lines.value.splice(lineIndex, 1)
    return true
  }

  function resolveInput(input: MenuOrderBasketInput) {
    if (!input || typeof input !== 'object') return null

    const item = input.item
    if (!item || typeof item !== 'object') return null

    const itemId = canonicalText(item.id)
    const name = canonicalText(item.name)
    const sourceMenuId = canonicalText(toValue(options.sourceMenuId))
    const requestedQuantity = input.quantity
    if (
      !itemId ||
      !name ||
      !sourceMenuId ||
      typeof requestedQuantity !== 'number' ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1 ||
      requestedQuantity > 99
    ) {
      return null
    }

    const variants = resolveMenuOrderPriceOptions(item.priceOptions)
    const availableAddOns = resolveMenuOrderAddOns(item.addOns)
    if (!variants || !availableAddOns || !Array.isArray(input.addOnIds)) return null

    const hasRequestedVariant = input.variantId !== undefined
    if (hasRequestedVariant && typeof input.variantId !== 'string') return null

    const requestedVariantId = hasRequestedVariant
      ? canonicalText(input.variantId)
      : ''
    if (hasRequestedVariant && !requestedVariantId) return null
    if (!variants.length && hasRequestedVariant) return null

    const variant = variants.find(({ id }) => id === requestedVariantId) ||
      (!hasRequestedVariant && variants.length === 1 ? variants[0] : null)
    if (variants.length && !variant) return null

    const basePrice = variant?.price ?? item.price
    if (!menuOrderPositivePrice(basePrice)) return null

    const requestedAddOnIds: string[] = []
    const seenAddOnIds = new Set<string>()
    for (const value of input.addOnIds) {
      const id = canonicalText(value)
      if (!id || seenAddOnIds.has(id)) return null

      seenAddOnIds.add(id)
      requestedAddOnIds.push(id)
    }

    const addOnsById = new Map(availableAddOns.map(addOn => [addOn.id, addOn]))
    const addOns: MenuManifestAddOn[] = []
    for (const id of requestedAddOnIds.sort()) {
      const addOn = addOnsById.get(id)
      if (!addOn) return null

      addOns.push(addOn)
    }

    const unitPrice = Number(basePrice) + addOns.reduce(
      (sum, { price }) => sum + Number(price),
      0
    )
    const lineTotal = unitPrice * requestedQuantity
    if (!menuOrderPositivePrice(unitPrice) || !menuOrderPositivePrice(lineTotal)) {
      return null
    }

    const configurationKey = JSON.stringify([
      sourceMenuId,
      itemId,
      variant?.id || 'base',
      ...addOns.map(({ id }) => id),
    ])

    return {
      configurationKey,
      itemId,
      name,
      quantity: requestedQuantity,
      unitPrice,
      variant,
      addOns,
    }
  }

  watch(
    () => String(toValue(options.scopeKey) || '').trim(),
    () => clear()
  )

  return {
    lines,
    currencyCode,
    quantity,
    total,
    totalLabel,
    add,
    clear,
    setQuantity,
    remove,
  }
}

function canonicalText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}
