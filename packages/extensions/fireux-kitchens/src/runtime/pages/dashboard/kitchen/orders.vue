<template>
  <UDashboardPanel id="dashboard-kitchen-orders-in">
    <template #header>
      <LayoutsDashboardNavbar title="Orders In" />
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
          <template v-if="kitchenId"> · Kitchen: <span class="font-medium">{{ kitchenId }}</span></template>
          · Orders: <span class="font-medium">{{ orders.length }}</span>
        </div>

        <UAlert
          v-if="!kitchenId"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a runtime kitchen before viewing incoming orders."
        />

        <template v-else>
          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold">Latest orders</div>
                  <UBadge variant="soft" color="neutral">{{ orders.length }}</UBadge>
                </div>
              </template>

              <div v-if="orders.length" class="space-y-2">
                <button
                  v-for="order in orders"
                  :key="order.id"
                  type="button"
                  class="w-full rounded border border-default p-3 text-left hover:bg-[var(--ui-bg-elevated)]"
                  :class="selectedOrderId === order.id ? 'ring-2 ring-inset ring-primary' : ''"
                  @click="selectedOrderId = order.id"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="truncate font-medium">
                        {{ order.lines?.[0]?.label || order.id || 'Order' }}
                      </div>
                      <div class="text-xs text-dimmed">
                        {{ formatDate(order.created_at) }}
                      </div>
                    </div>

                    <UBadge variant="soft" :color="statusColor(resolveStatus(order.status))">
                      {{ statusLabel(resolveStatus(order.status)) }}
                    </UBadge>
                  </div>
                </button>
              </div>

              <UAlert
                v-else
                color="neutral"
                variant="soft"
                title="No incoming orders loaded"
                description="No orders yet for this kitchen context."
              />
            </UCard>

            <UCard>
              <template #header>
                <div class="text-sm font-semibold">Order detail</div>
              </template>

              <div v-if="selectedOrder" class="space-y-4">
                <div class="space-y-1">
                  <div class="text-xs text-dimmed">Order id</div>
                  <div class="font-mono text-xs">{{ selectedOrder.id }}</div>
                </div>

                <div class="grid gap-2 sm:grid-cols-2">
                  <div>
                    <div class="text-xs text-dimmed">Status</div>
                    <UBadge variant="soft" :color="statusColor(currentStatus)">
                      {{ statusLabel(currentStatus) }}
                    </UBadge>
                  </div>
                  <div>
                    <div class="text-xs text-dimmed">Channel</div>
                    <div class="text-sm font-medium">{{ selectedOrder.channel || 'menu' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-dimmed">Service</div>
                    <div class="text-sm font-medium">{{ serviceLabel(selectedOrder.service?.mode) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-dimmed">Table</div>
                    <div class="text-sm font-medium">{{ selectedOrder.service?.table_label || '-' }}</div>
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="text-xs text-dimmed">Lines</div>

                  <div
                    v-for="(line, index) in selectedOrder.lines || []"
                    :key="`${selectedOrder.id}-${line.dish_id}-${index}`"
                    class="flex items-center justify-between gap-3 rounded border border-default p-2"
                  >
                    <div class="min-w-0">
                      <div class="truncate text-sm font-medium">{{ line.label }}</div>
                      <div class="text-xs text-dimmed">
                        {{ line.qty }} × {{ formatPrice(line.price_minor, line.currency_code) }}
                      </div>
                    </div>

                    <div class="text-sm font-semibold">
                      {{ formatPrice(Number(line.price_minor || 0) * Number(line.qty || 0), line.currency_code) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between border-t border-default pt-3">
                  <div class="text-xs text-dimmed">Subtotal</div>
                  <div class="font-semibold">
                    {{ formatPrice(selectedOrder.totals?.subtotal_minor, selectedOrder.totals?.currency_code) }}
                  </div>
                </div>

                <div class="space-y-2 border-t border-default pt-3">
                  <div class="text-xs text-dimmed">Status progression</div>

                  <div class="flex flex-wrap gap-2">
                    <UButton
                      v-for="status in progression"
                      :key="status"
                      size="xs"
                      :variant="status === currentStatus ? 'solid' : 'soft'"
                      :color="status === currentStatus ? 'primary' : 'neutral'"
                      :disabled="!canMoveTo(status) || updating"
                      @click="setSelectedStatus(status)"
                    >
                      {{ statusLabel(status) }}
                    </UButton>

                    <UButton
                      v-if="canMoveTo('cancelled')"
                      size="xs"
                      color="error"
                      variant="soft"
                      :loading="updating"
                      @click="setSelectedStatus('cancelled')"
                    >
                      Cancel
                    </UButton>
                  </div>

                  <UButton
                    v-if="nextStatus"
                    size="sm"
                    :loading="updating"
                    :disabled="updating"
                    @click="setSelectedStatus(nextStatus)"
                  >
                    Advance to {{ statusLabel(nextStatus) }}
                  </UButton>
                </div>
              </div>

              <UAlert
                v-else
                color="neutral"
                variant="soft"
                title="Select an order"
                description="Choose an order from the list to review lines and update status."
              />
            </UCard>
          </div>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useOrdersForKitchenFetch } from 'fireux-orders/runtime/composables/useOrdersForKitchenFetch'
import { useOrderUpdateStatus } from 'fireux-orders/runtime/composables/useOrderUpdateStatus'
import type { OrderStatus } from 'fireux-orders/runtime/models/order.model'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-orders-in',
    label: 'Orders In',
    icon: 'i-lucide-receipt',
    order: 12,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const kitchenId = computed(() => String(runtime.id.value || '').trim())
const toast = useToastify()

const { orders } = useOrdersForKitchenFetch(kitchenId)

const {
  setStatus,
  normalizeOrderStatus,
  nextStatusFor,
  canTransition,
} = useOrderUpdateStatus()

const selectedOrderId = ref('')
const updating = ref(false)
const progression: OrderStatus[] = ['accepted', 'in_progress', 'ready', 'completed']

watch(
  orders,
  (nextOrders) => {
    const selectedExists = nextOrders.some((order) => String(order.id || '').trim() === selectedOrderId.value)
    if (selectedExists) return

    const nextSelected = nextOrders[0]
    selectedOrderId.value = String(nextSelected?.id || '').trim()
  },
  { immediate: true }
)

const selectedOrder = computed(() =>
  orders.value.find((order) => String(order.id || '').trim() === selectedOrderId.value) || null
)

const currentStatus = computed<OrderStatus>(() =>
  normalizeOrderStatus(selectedOrder.value?.status)
)

const nextStatus = computed<OrderStatus | null>(() =>
  nextStatusFor(currentStatus.value)
)

const resolveStatus = (status: unknown): OrderStatus => normalizeOrderStatus(status)

const toMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    if (typeof source.seconds === 'number') {
      return source.seconds * 1000
    }
    if (typeof source.toDate === 'function') {
      const toDate = source.toDate as () => Date
      const asDate = toDate()
      return asDate instanceof Date ? asDate.getTime() : 0
    }
  }

  return 0
}

const formatDate = (value: unknown) => {
  const millis = toMillis(value)
  if (!millis) return '-'

  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(millis)
}

const formatPrice = (priceMinor?: number, currencyCode?: string) => {
  const amount = Number(priceMinor || 0) / 100
  const code = String(currencyCode || 'CHF').trim().toUpperCase() || 'CHF'

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const statusColor = (status: OrderStatus) => {
  if (status === 'submitted') return 'warning'
  if (status === 'accepted') return 'primary'
  if (status === 'in_progress') return 'primary'
  if (status === 'ready') return 'success'
  if (status === 'completed') return 'neutral'
  if (status === 'cancelled') return 'error'
  return 'neutral'
}

const statusLabel = (status: OrderStatus) => {
  if (status === 'in_progress') return 'In progress'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const serviceLabel = (mode: unknown) => {
  const raw = String(mode || '').trim()
  if (raw === 'dine_in') return 'Dine-in'
  if (raw === 'collection') return 'Collection'
  if (raw === 'delivery') return 'Delivery'
  return raw || 'Dine-in'
}

const canMoveTo = (target: OrderStatus) => {
  if (!selectedOrder.value) return false
  if (target === currentStatus.value) return false
  return canTransition(currentStatus.value, target)
}

const setSelectedStatus = async (status: OrderStatus) => {
  const orderId = String(selectedOrder.value?.id || '').trim()
  if (!orderId) return
  if (!canMoveTo(status)) return
  if (updating.value) return

  updating.value = true

  try {
    await setStatus(orderId, status)
    toast.success(`Order marked ${statusLabel(status)}`)
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update order status'))
  } finally {
    updating.value = false
  }
}
</script>
