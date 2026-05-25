<template>
  <div class="price-entry">
    <div class="input-row">
      <UInput v-model="price.currency" readonly class="currency-display w-20" />
      <UInputNumber
        v-model="displayAmount"
        :format-options="{
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }"
        placeholder="0.00"
        :min="0"
        class="price-input"
      />
    </div>

    <div v-if="showBillingFrequency" class="billing-frequency">
      <URadioGroup v-model="uiFrequency" :items="billingFrequencyOptions" />
    </div>

    <div v-if="showRemove" class="remove-button">
      <UButton
        icon="i-lucide-x"
        color="warning"
        variant="subtle"
        size="xs"
        @click="emit('remove')"
      >
        Remove
      </UButton>
    </div>

    <div
      v-if="prices.length > 1 && prices[0] !== price"
      class="set-default-button"
    >
      <UButton
        icon="i-lucide-arrow-up"
        color="primary"
        variant="soft"
        size="xs"
        @click="movePriceToTop(props.index)"
      >
        Move to First
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RadioGroupItem, RadioGroupValue } from '@nuxt/ui';
import { computed } from 'vue';
import { useCreatePricesState } from '../../../composables/fireux/product/create/useCreatePricesState';
import { useCreateProductState } from '../../../composables/fireux/product/create/useCreateProductState';

const props = defineProps<{
  index: number
  showRemove: boolean
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()

function movePriceToTop(index: number) {
  if (index > 0) {
    const [item] = prices.value.splice(index, 1)
    if (item) prices.value.unshift(item)
  }
}

const { prices } = useCreatePricesState()
const { product } = await useCreateProductState()
const defaultCurrency = 'CHF'

const productType = computed(() => String(product.value.product_type || '').trim())
const isOneTimeOnly = computed(() =>
  productType.value === 'physical' || productType.value === 'digital'
)
const showBillingFrequency = computed(() => !isOneTimeOnly.value)

const price = computed(() => {
  const base = prices.value[props.index]
  if (!base) {
    return {
      currency: defaultCurrency,
      unit_amount: 0,
      type: 'one_time',
      interval: undefined,
      interval_count: undefined,
    }
  }

  // Physical/digital products are always one-time.
  if (isOneTimeOnly.value) {
    base.type = 'one_time'
    base.interval = undefined
    base.interval_count = undefined
  }

  // Services/subscriptions can be one-time or recurring per price entry.

  return base
})

const runtimeBillingIntervals = computed(() => ['month', 'year'])

const billingFrequencyOptions = computed<RadioGroupItem[]>(() => {
  const labels: Record<string, string> = {
    month: 'Monthly',
    year: 'Yearly',
  }
  return [
    { label: 'Once', value: 'once' },
    ...runtimeBillingIntervals.value.map((interval) => ({
      label: labels[interval] || interval,
      value: interval,
    })),
  ]
})

// Computed value that maps to Stripe fields
const uiFrequency = computed<RadioGroupValue>({
  get: () => {
    if (price.value.type === 'one_time') return 'once'
    if (price.value.interval) return price.value.interval
    return 'once'
  },
  set: (val) => {
    if (val === 'once') {
      price.value.type = 'one_time'
      price.value.interval = undefined
      price.value.interval_count = undefined
    } else {
      price.value.type = 'recurring'
      price.value.interval = String(val)
      price.value.interval_count = 1
    }
  },
})

// Store `unit_amount` as minor units (e.g., cents) while showing a user-friendly major value.
const displayAmount = computed<number>({
  get: () => Number(price.value.unit_amount ?? 0) / 100,
  set: (val) => {
    const next = Number(val ?? 0)
    price.value.unit_amount = Number.isFinite(next)
      ? Math.round(next * 100)
      : 0
  },
})
</script>

<style scoped>
.price-entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-4); /* Uses design system spacing */
  background-color: var(--ui-bg-muted); /* Uses existing design system color */
  padding: var(--space-6); /* Uses design system padding */
  border-radius: var(--radius-md); /* Uses design system border radius */
}

.input-row {
  display: flex;
  gap: var(--space-1); /* Consistent spacing */
  align-items: center;
}

.price-input {
  flex-grow: 1;
}

.set-default-button {
  display: flex;
  justify-content: flex-end;
}
</style>
