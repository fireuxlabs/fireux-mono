import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type {
  DefaultPrice,
  Price,
  StripePriceInput,
} from '../../../../../models/objects/product.model'

export function useCreatePricesState() {
  const prices = useStorage<Partial<Price>[]>('createProductPrices', [
    {
      unit_amount: 0,
      currency: 'eur',
    },
  ])

  function addPrice() {
    prices.value.push({
      unit_amount: 0,
      currency: 'eur',
    })
  }

  function removePrice(index: number) {
    prices.value.splice(index, 1)
  }

  function resetPrices() {
    prices.value = [
      {
        unit_amount: 0,
        currency: 'eur',
      },
    ]
  }

  function resetCreatePricesState() {
    resetPrices()
  }

  const pricesPayload = computed<StripePriceInput[]>(() => {
    if (!prices.value.length) {
      throw new Error('At least one price is required')
    }

    return prices.value.map((price, index) => {
      if (!price.unit_amount || price.unit_amount <= 0) {
        throw new Error(`Price ${index + 1} must have a value greater than 0`)
      }
      if (!price.currency) {
        throw new Error(`Price ${index + 1} requires a currency`)
      }

      const isRecurring = price.type === 'recurring'

      return {
        billing_scheme: price.billing_scheme ?? 'per_unit',
        currency: price.currency,
        unit_amount: price.unit_amount,
        type: price.type ?? 'one_time',
        interval: isRecurring ? price.interval ?? 'month' : undefined,
        interval_count: isRecurring ? price.interval_count ?? 1 : undefined,
        metadata: price.metadata ?? {},
      }
    })
  })

  const defaultUnitPrice = computed(() => prices.value[0]?.unit_amount ?? 0)

  const defaultPrice = computed<DefaultPrice | undefined>(() => {
    const price = prices.value[0]
    if (!price) return undefined
    return {
      id: price.id ?? '',
      unit_amount: price.unit_amount ?? 0,
      interval: price.interval,
    }
  })

  return {
    prices,
    addPrice,
    removePrice,
    resetPrices,
    resetCreatePricesState,
    pricesPayload,
    defaultUnitPrice,
    defaultPrice,
  }
}
