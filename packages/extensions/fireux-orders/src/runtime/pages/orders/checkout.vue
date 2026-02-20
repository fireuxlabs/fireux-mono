<template>
  <UPage>
    <UPageHeader title="Basket & Checkout" :description="checkoutDescription">
      <template #ctas>
        <UButton size="xs" variant="ghost" icon="i-lucide-arrow-left" :to="backToMenu">
          Back to menu
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <UAlert
        v-if="isEmpty"
        color="neutral"
        variant="soft"
        title="Your basket is empty"
        description="Add items from a kitchen menu to continue checkout."
      >
        <template #actions>
          <UButton size="sm" color="neutral" variant="soft" :to="backToMenu">
            Browse menu
          </UButton>
        </template>
      </UAlert>

      <template v-else-if="confirmedOrderId">
        <UAlert
          color="success"
          variant="soft"
          title="Order confirmed"
          :description="`Order id: ${confirmedOrderId}`"
        />

        <UCard>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm text-dimmed">Status</div>
              <div class="font-medium">Submitted</div>
            </div>

            <UButton color="neutral" variant="soft" :to="backToMenu">
              Back to menu
            </UButton>
          </div>
        </UCard>
      </template>

      <template v-else>
        <UCard>
          <template #header>
            <div class="text-base font-semibold">Basket</div>
          </template>

          <div class="space-y-3">
            <div
              v-for="(line, index) in items"
              :key="lineKey(line, index)"
              class="flex items-start justify-between gap-3 rounded border border-default p-3"
            >
              <div class="min-w-0">
                <div class="font-medium">{{ line.label }}</div>
                <div class="text-xs text-dimmed">{{ formatPrice(line.price_minor, line.currency_code) }} each</div>
              </div>

              <div class="flex items-center gap-2">
                <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-minus" @click="decrementAt(index)" />
                <div class="w-7 text-center text-sm font-medium">{{ line.qty }}</div>
                <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-plus" @click="incrementAt(index)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="removeAt(index)" />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="text-sm text-dimmed">Subtotal</div>
              <div class="font-semibold">{{ formatPrice(subtotalMinor, currencyCode) }}</div>
            </div>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-base font-semibold">Checkout</div>
          </template>

          <div class="space-y-4">
            <div class="space-y-1">
              <div class="text-xs font-medium text-dimmed">Service mode</div>
              <URadioGroup v-model="serviceMode" :items="serviceModeOptions" />
            </div>

            <div v-if="serviceMode === 'dine_in'" class="space-y-1">
              <div class="text-xs font-medium text-dimmed">Table (optional)</div>
              <UInput v-model="tableLabel" placeholder="e.g. 12" />
            </div>

            <div class="space-y-1">
              <div class="text-xs font-medium text-dimmed">Notes (optional)</div>
              <UTextarea v-model="notes" :rows="3" placeholder="Allergies, timing, preferences..." />
            </div>
          </div>

          <template #footer>
            <div class="flex flex-wrap justify-end gap-2">
              <UButton color="neutral" variant="ghost" :disabled="submitting" @click="reset">
                Clear basket
              </UButton>
              <UButton :loading="submitting" :disabled="isEmpty" @click="submitCheckout">
                Confirm order
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { RadioGroupItem } from '@nuxt/ui'
import type { OrderServiceMode } from '../../models/order.model'
import { useBasket } from '../../composables/useBasket'
import { useOrderCreate } from '../../composables/useOrderCreate'

const route = useRoute()
const toast = useToastify()

const {
  kitchenId,
  items,
  asOrderLines,
  subtotalMinor,
  currencyCode,
  isEmpty,
  incrementAt,
  decrementAt,
  removeAt,
  reset,
} = useBasket()

const { createOrder } = useOrderCreate()

const serviceModeOptions: RadioGroupItem[] = [
  { label: 'Dine-in', value: 'dine_in' },
  { label: 'Collection', value: 'collection' },
  { label: 'Delivery', value: 'delivery' },
]

const resolveModeFromQuery = (): OrderServiceMode => {
  const raw = String(route.query.mode || '').trim().toLowerCase()
  if (raw === 'dine-in' || raw === 'dine_in') return 'dine_in'
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return 'dine_in'
}

const serviceMode = ref<OrderServiceMode>(resolveModeFromQuery())
const tableLabel = ref(String(route.query.table || '').trim())
const notes = ref('')
const submitting = ref(false)
const confirmedOrderId = ref('')

const backToMenu = computed(() => {
  const returnTo = String(route.query.returnTo || '').trim()
  if (returnTo.startsWith('/kitchens/')) return returnTo

  const id = kitchenId.value
  return id ? `/kitchens/${encodeURIComponent(id)}/menu` : '/kitchens'
})

const checkoutDescription = computed(() => {
  if (!kitchenId.value) return 'Review basket and submit your order.'
  return `Kitchen: ${kitchenId.value}`
})

const lineKey = (
  line: {
    dish_id: string
    label: string
    price_minor: number
    currency_code: string
  },
  index: number
) => `${line.dish_id}:${line.label}:${line.price_minor}:${line.currency_code}:${index}`

const formatPrice = (priceMinor?: number, currency?: string) => {
  const amount = Number(priceMinor || 0) / 100
  const code = String(currency || 'CHF').trim().toUpperCase() || 'CHF'

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const submitCheckout = async () => {
  if (submitting.value) return

  if (!kitchenId.value) {
    toast.error('Basket kitchen is missing')
    return
  }

  if (!asOrderLines.value.length) {
    toast.error('Basket is empty')
    return
  }

  submitting.value = true

  try {
    const orderId = await createOrder({
      kitchen_id: kitchenId.value,
      channel: 'menu',
      service: {
        mode: serviceMode.value,
        table_label: serviceMode.value === 'dine_in' ? tableLabel.value : '',
        notes: notes.value,
      },
      lines: asOrderLines.value,
    })

    confirmedOrderId.value = orderId
    reset()
    toast.success('Order submitted')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to submit order'))
  } finally {
    submitting.value = false
  }
}
</script>
