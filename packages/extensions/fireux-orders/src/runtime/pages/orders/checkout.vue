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
      <div v-if="checkoutKitchenId" class="flex flex-wrap items-center gap-2">
        <UBadge variant="soft" color="neutral">Kitchen</UBadge>
        <UBadge variant="soft">
          {{ kitchenDisplayPill }}
        </UBadge>
      </div>

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
              <div
                v-if="serviceModeLocked"
                class="rounded border border-default px-2.5 py-2 text-sm font-medium"
              >
                {{ formatServiceModeLabel(serviceMode) }}
              </div>
              <URadioGroup v-else v-model="serviceMode" :items="serviceModeOptions" />
            </div>

            <div v-if="serviceMode === 'dine_in'" class="space-y-1">
              <div class="text-xs font-medium text-dimmed">
                {{ tableLocked ? 'Table' : 'Table (optional)' }}
              </div>
              <div
                v-if="tableLocked"
                class="rounded border border-default px-2.5 py-2 text-sm font-medium"
              >
                {{ tableLabel || 'N/A' }}
              </div>
              <UInput v-else v-model="tableLabel" placeholder="e.g. 12" />
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
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
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

type QueryServiceMode = '' | OrderServiceMode

const parseModeFromQuery = (value: unknown): QueryServiceMode => {
  const raw = String(value || '').trim().toLowerCase()
  if (raw === 'dine-in' || raw === 'dine_in') return 'dine_in'
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return ''
}

const modeFromQuery = computed<QueryServiceMode>(() => parseModeFromQuery(route.query.mode))
const tableFromQuery = computed(() => String(route.query.table || '').trim())
const kitchenIdFromQuery = computed(() => String(route.query.kitchen || '').trim())
const kitchenNameFromQuery = computed(() =>
  String(route.query.kitchenName || route.query.kitchen_name || '').trim()
)
const checkoutKitchenId = computed(() => String(kitchenId.value || kitchenIdFromQuery.value).trim())
const serviceModeLocked = computed(() => Boolean(modeFromQuery.value))

const serviceMode = ref<OrderServiceMode>(
  (modeFromQuery.value || 'dine_in') as OrderServiceMode
)
const tableLabel = ref(tableFromQuery.value)
const tableLocked = computed(
  () => serviceModeLocked.value && serviceMode.value === 'dine_in' && Boolean(tableFromQuery.value)
)
const notes = ref('')
const submitting = ref(false)
const confirmedOrderId = ref('')

watch(
  modeFromQuery,
  (nextMode) => {
    if (!nextMode) return
    serviceMode.value = nextMode
  },
  { immediate: true }
)

watch(
  tableFromQuery,
  (nextTable) => {
    if (!nextTable) return
    tableLabel.value = nextTable
  },
  { immediate: true }
)

const { firestoreFetchDoc } = useFirestoreRead()
const kitchenRef = shallowRef<Ref<Record<string, unknown> | undefined> | null>(null)
const placeRef = shallowRef<Ref<Record<string, unknown> | undefined> | null>(null)

watch(
  checkoutKitchenId,
  (nextKitchenId) => {
    kitchenRef.value = nextKitchenId
      ? firestoreFetchDoc<Record<string, unknown>>('kitchens', nextKitchenId)
      : null

    placeRef.value = nextKitchenId
      ? firestoreFetchDoc<Record<string, unknown>>('places', nextKitchenId)
      : null
  },
  { immediate: true }
)

const kitchenDisplayName = computed(() => {
  const kitchen = kitchenRef.value?.value ?? {}
  const place = placeRef.value?.value ?? {}
  return String(
    kitchen?.name ||
      kitchen?.short_name ||
      place?.name ||
      place?.short_name ||
      kitchenNameFromQuery.value ||
      ''
  ).trim()
})

const kitchenDisplayPill = computed(() => kitchenDisplayName.value || 'Kitchen selected')

const backToMenu = computed(() => {
  const returnTo = String(route.query.returnTo || '').trim()
  if (returnTo.startsWith('/kitchens/')) return returnTo

  const id = checkoutKitchenId.value
  return id ? `/kitchens/${encodeURIComponent(id)}/menu` : '/kitchens'
})

const checkoutDescription = computed(() => {
  return 'Review basket and submit your order.'
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

const formatServiceModeLabel = (mode: OrderServiceMode) => {
  if (mode === 'delivery') return 'Delivery'
  if (mode === 'collection') return 'Collection'
  return 'Dine-in'
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
        table_label:
          serviceMode.value === 'dine_in'
            ? (tableLocked.value ? tableFromQuery.value : tableLabel.value)
            : '',
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
