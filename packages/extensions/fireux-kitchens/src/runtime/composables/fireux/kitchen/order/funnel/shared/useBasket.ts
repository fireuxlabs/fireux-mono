import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelState,
} from '../../../../../../models/kitchen/menu/menu-ordering.model'

export function useBasket(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const items = computed(() => toValue(order).selection.items)
  const currencyCode = computed(() => {
    const code = String(toValue(order).currencyCode || '').trim().toUpperCase()

    return /^[A-Z]{3}$/.test(code) ? code : 'CHF'
  })
  const total = computed(() =>
    items.value.reduce(
      (sum, item) =>
        sum +
        Math.max(0, Number(item.unitPrice || 0)) *
          Math.max(0, Number(item.quantity || 0)),
      0
    )
  )
  const totalLabel = computed(() => money(total.value, currencyCode.value))

  function lineTotal(item: MenuOrderingBasketItem) {
    const quantity = Math.max(0, Number(item.quantity || 0))
    const unitPrice = Math.max(0, Number(item.unitPrice || 0))

    return unitPrice ? money(quantity * unitPrice, currencyCode.value) : ''
  }

  return {
    items,
    lineTotal,
    total,
    totalLabel,
  }
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(value)
}
