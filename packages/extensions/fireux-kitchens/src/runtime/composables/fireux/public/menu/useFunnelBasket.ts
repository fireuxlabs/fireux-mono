import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelState,
} from '../../../../models/menu/menu-ordering.model'

export function useFunnelBasket(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const items = computed(() => toValue(order).selection.items)
  const total = computed(() =>
    items.value.reduce(
      (sum, item) =>
        sum +
        Math.max(0, Number(item.unitPrice || 0)) *
          Math.max(0, Number(item.quantity || 0)),
      0
    )
  )
  const totalLabel = computed(() => money(total.value))

  function lineTotal(item: MenuOrderingBasketItem) {
    const quantity = Math.max(0, Number(item.quantity || 0))
    const unitPrice = Math.max(0, Number(item.unitPrice || 0))

    return unitPrice ? money(quantity * unitPrice) : ''
  }

  return {
    items,
    lineTotal,
    total,
    totalLabel,
  }
}

function money(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
}
