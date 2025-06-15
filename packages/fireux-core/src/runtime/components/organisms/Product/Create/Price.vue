<template>
  <div class="price-entry">
    <div class="input-row">
      <UInput v-model="price.currency" readonly class="currency-display w-20" />
      <UInputNumber
        v-model.number="price.unit_amount"
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
import { computed } from 'vue'
import type { RadioGroupItem, RadioGroupValue } from '@nuxt/ui'
import { useCreatePricesState } from '../../../../composables/firestore/objects/Product/Prices/useCreatePricesState'
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'
import { useProducts } from '../../../../composables/firestore/objects/Product/useProducts'

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
const defaultCurrency = 'EUR'

const isService = computed(() => product.value.product_type === 'service')
const isSubscription = computed(
  () => product.value.product_type === 'subscription'
)
const showBillingFrequency = computed(
  () => isService.value || isSubscription.value
)

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

  // Enforce one_time for non-service and non-subscription
  if (!isService.value && !isSubscription.value) {
    base.type = 'one_time'
    base.interval = undefined
    base.interval_count = undefined
  }

  // Default subscriptions to monthly recurring
  if (isSubscription.value && (!base.type || base.type === 'one_time')) {
    base.type = 'recurring'
    base.interval = 'month'
    base.interval_count = 1
  }

  return base
})

// UI options for billing frequency
const billingFrequencyOptions: RadioGroupItem[] = [
  { label: 'Once', value: 'once' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

// Computed value that maps to Stripe fields
const uiFrequency = computed<RadioGroupValue>({
  get: () => {
    if (price.value.type === 'one_time') return 'once'
    if (price.value.interval === 'month') return 'monthly'
    if (price.value.interval === 'year') return 'yearly'
    return 'once'
  },
  set: (val) => {
    if (val === 'once') {
      price.value.type = 'one_time'
      price.value.interval = undefined
      price.value.interval_count = undefined
    } else {
      price.value.type = 'recurring'
      price.value.interval = val === 'monthly' ? 'month' : 'year'
      price.value.interval_count = 1
    }
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
