import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { MenuServiceOffer } from '../utils/service-sections'
import {
  serviceBasketLine,
  serviceItemSignature,
  type ServiceItemChoices,
  type ServiceBasketLine,
} from '../utils/service-basket'

/** Component-scoped basket; no remote writes, storage recovery or order submission. */
export function useServiceBasket(
  offers: MaybeRefOrGetter<MenuServiceOffer[]>,
  catalogueReady: MaybeRefOrGetter<boolean> = true
) {
  const lines = ref<ServiceBasketLine[]>([])
  const count = computed(() =>
    lines.value.reduce((sum, line) => sum + line.choices.quantity, 0)
  )
  const totalMinor = computed(() =>
    lines.value.reduce(
      (sum, line) => sum + line.unitMinor * line.choices.quantity,
      0
    )
  )
  const staleKeys = computed(() => {
    if (!toValue(catalogueReady)) return []
    const signatures = new Set(toValue(offers).map(serviceItemSignature))
    return lines.value
      .filter((line) => !signatures.has(line.signature))
      .map((line) => line.key)
  })
  function add(offer: MenuServiceOffer, choices: ServiceItemChoices) {
    if (!toValue(catalogueReady))
      throw new Error('Food and drinks are reloading. Please try again.')
    if (
      !toValue(offers).some(
        (current) =>
          serviceItemSignature(current) === serviceItemSignature(offer)
      )
    )
      throw new Error('This item has changed. Please choose it again.')
    const line = serviceBasketLine(offer, choices)
    if (lines.value.some((existing) => existing.currency !== line.currency))
      throw new Error('These items use different currencies.')
    const existing = lines.value.find((row) => row.key === line.key)
    if (existing) {
      if (existing.choices.quantity + choices.quantity > 99)
        throw new Error('Choose up to 99 of each selection.')
      existing.choices.quantity += choices.quantity
    } else {
      if (lines.value.length >= 50)
        throw new Error('Your basket has reached 50 different selections.')
      lines.value.push(line)
    }
  }
  function adjust(key: string, change: number) {
    const line = lines.value.find((row) => row.key === key)
    if (!line) return
    if (
      change > 0 &&
      (!toValue(catalogueReady) || staleKeys.value.includes(key))
    )
      return
    const quantity = line.choices.quantity + change
    if (quantity <= 0)
      lines.value = lines.value.filter((row) => row.key !== key)
    else if (quantity <= 99) line.choices.quantity = quantity
  }
  function remove(key: string) {
    lines.value = lines.value.filter((row) => row.key !== key)
  }
  function clear() { lines.value = [] }
  return { lines, count, totalMinor, staleKeys, add, adjust, remove, clear }
}
