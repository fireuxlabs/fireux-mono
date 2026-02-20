import { useState } from '#imports'
import { computed, type ComputedRef } from 'vue'
import type { OrderLine } from '../models/order.model'

const STORAGE_KEY = 'fireux-orders:basket:v1'
const BASKET_STATE_KEY = 'fireux-orders:basket:state'
const BASKET_HYDRATED_KEY = 'fireux-orders:basket:hydrated'

type BasketState = {
  kitchen_id: string
  items: OrderLine[]
}

type BasketLineInput = {
  kitchen_id: string
  dish_id: string
  label: string
  price_minor: number
  currency_code?: string
  qty?: number
}

const createEmptyBasket = (): BasketState => ({
  kitchen_id: '',
  items: [],
})

const normalizeCurrency = (value: unknown) => {
  const code = String(value || '').trim().toUpperCase()
  return code || 'CHF'
}

const normalizeLine = (line: unknown): OrderLine | null => {
  const source = line && typeof line === 'object' ? (line as Record<string, unknown>) : null
  if (!source) return null

  const dishId = String(source.dish_id || '').trim()
  const label = String(source.label || '').trim()
  const priceMinor = Math.round(Number(source.price_minor || 0))
  const qty = Math.max(0, Math.floor(Number(source.qty || 0)))

  if (!dishId || !label || !Number.isFinite(priceMinor) || qty <= 0) return null

  return {
    dish_id: dishId,
    label,
    price_minor: priceMinor,
    currency_code: normalizeCurrency(source.currency_code),
    qty,
  }
}

const normalizeBasket = (value: unknown): BasketState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : null
  if (!source) return createEmptyBasket()

  const kitchenId = String(source.kitchen_id || '').trim()
  const rawItems = Array.isArray(source.items) ? source.items : []

  return {
    kitchen_id: kitchenId,
    items: rawItems
      .map((line) => normalizeLine(line))
      .filter((line): line is OrderLine => Boolean(line)),
  }
}

const lineIdentity = (line: Pick<OrderLine, 'dish_id' | 'label' | 'price_minor' | 'currency_code'>) =>
  `${line.dish_id}::${line.label}::${line.price_minor}::${line.currency_code}`

const formatLineFromInput = (input: BasketLineInput): OrderLine => ({
  dish_id: String(input.dish_id || '').trim(),
  label: String(input.label || '').trim(),
  price_minor: Math.max(0, Math.round(Number(input.price_minor || 0))),
  currency_code: normalizeCurrency(input.currency_code),
  qty: Math.max(1, Math.floor(Number(input.qty || 1))),
})

export function useBasket() {
  const basket = useState<BasketState>(BASKET_STATE_KEY, createEmptyBasket)
  const hydrated = useState<boolean>(BASKET_HYDRATED_KEY, () => false)

  const persist = () => {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket.value))
  }

  const hydrate = () => {
    if (!import.meta.client || hydrated.value) return

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      hydrated.value = true
      return
    }

    try {
      basket.value = normalizeBasket(JSON.parse(raw))
    } catch {
      basket.value = createEmptyBasket()
    }

    hydrated.value = true
  }

  hydrate()

  const kitchenId = computed(() => String(basket.value.kitchen_id || '').trim())
  const items = computed(() => basket.value.items)

  const itemCount = computed(() =>
    items.value.reduce((sum: number, line: OrderLine) => sum + Math.max(0, Number(line.qty || 0)), 0)
  )

  const subtotalMinor = computed(() =>
    items.value.reduce(
      (sum: number, line: OrderLine) =>
        sum + Math.max(0, Number(line.price_minor || 0)) * Math.max(0, Number(line.qty || 0)),
      0
    )
  )

  const currencyCode = computed(() =>
    normalizeCurrency(items.value[0]?.currency_code || 'CHF')
  )

  const isEmpty = computed(() => itemCount.value <= 0)

  const reset = () => {
    basket.value = createEmptyBasket()
    persist()
  }

  const removeAt = (index: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    basket.value.items.splice(index, 1)
    if (!basket.value.items.length) {
      basket.value.kitchen_id = ''
    }
    persist()
  }

  const setQtyAt = (index: number, qty: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    const nextQty = Math.floor(Number(qty || 0))
    if (nextQty <= 0) {
      removeAt(index)
      return
    }

    basket.value.items[index] = {
      ...basket.value.items[index],
      qty: nextQty,
    }
    persist()
  }

  const incrementAt = (index: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    setQtyAt(index, Number(basket.value.items[index]?.qty || 0) + 1)
  }

  const decrementAt = (index: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    setQtyAt(index, Number(basket.value.items[index]?.qty || 0) - 1)
  }

  const addLine = (input: BasketLineInput) => {
    const nextKitchenId = String(input.kitchen_id || '').trim()
    if (!nextKitchenId) {
      throw new Error('Basket line requires kitchen_id')
    }

    const line = formatLineFromInput(input)
    if (!line.dish_id || !line.label) {
      throw new Error('Basket line requires dish_id and label')
    }

    let replacedKitchen = false

    if (
      basket.value.kitchen_id &&
      basket.value.kitchen_id !== nextKitchenId &&
      basket.value.items.length
    ) {
      basket.value = createEmptyBasket()
      replacedKitchen = true
    }

    basket.value.kitchen_id = nextKitchenId

    const targetIdentity = lineIdentity(line)
    const lineIndex = basket.value.items.findIndex(
      (existing: OrderLine) => lineIdentity(existing) === targetIdentity
    )

    if (lineIndex >= 0) {
      const current = basket.value.items[lineIndex]
      basket.value.items[lineIndex] = {
        ...current,
        qty: Math.max(1, Number(current.qty || 0) + Math.max(1, Number(line.qty || 1))),
      }
    } else {
      basket.value.items.push(line)
    }

    persist()

    return {
      replacedKitchen,
      itemCount: itemCount.value,
    }
  }

  const asOrderLines = computed<OrderLine[]>(() =>
    items.value.map((line: OrderLine) => ({
      dish_id: String(line.dish_id || '').trim(),
      label: String(line.label || '').trim(),
      price_minor: Math.max(0, Math.round(Number(line.price_minor || 0))),
      currency_code: normalizeCurrency(line.currency_code),
      qty: Math.max(1, Math.floor(Number(line.qty || 1))),
    }))
  )

  return {
    basket,
    kitchenId,
    items,
    asOrderLines,
    itemCount,
    subtotalMinor,
    currencyCode,
    isEmpty,
    addLine,
    setQtyAt,
    incrementAt,
    decrementAt,
    removeAt,
    reset,
  }
}

export type UseBasketReturn = {
  kitchenId: ComputedRef<string>
  items: ComputedRef<OrderLine[]>
  asOrderLines: ComputedRef<OrderLine[]>
  itemCount: ComputedRef<number>
  subtotalMinor: ComputedRef<number>
  currencyCode: ComputedRef<string>
  isEmpty: ComputedRef<boolean>
  addLine: (
    input: BasketLineInput
  ) => {
    replacedKitchen: boolean
    itemCount: number
  }
  setQtyAt: (index: number, qty: number) => void
  incrementAt: (index: number) => void
  decrementAt: (index: number) => void
  removeAt: (index: number) => void
  reset: () => void
}
