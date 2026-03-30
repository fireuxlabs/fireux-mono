<template>
  <UDashboardPanel id="console-kitchen-orders-in">
    <template #header>
      <LayoutsConsoleNavbar title="Orders In" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!kitchenId"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen/overview before viewing incoming orders."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen/overview',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <UAlert
          v-else-if="!orderTickets.length"
          color="neutral"
          variant="soft"
          title="No incoming orders loaded"
          description="No orders yet for this kitchen context."
        />

        <div
          v-else
          class="flex flex-wrap gap-3"
        >
          <OrderCard
            v-for="(ticket, index) in orderTickets"
            :key="ticket.id || `${ticket.contextLabel}-${ticket.timeLabel}-${index}`"
            :id="ticket.id"
            :context-label="ticket.contextLabel"
            :time-label="ticket.timeLabel"
            :server-name="ticket.serverName"
            :lines="ticket.lines"
          />
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderCard from '../../../components/organisms/Order/Card.vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { useKitchenOrdersFetch } from '../../../composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrdersFetch'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-orders-in',
    label: 'Orders In',
    icon: 'i-lucide-receipt',
    order: 12,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const kitchenId = computed(() => String(runtime.id.value || '').trim())
const { orders } = useKitchenOrdersFetch(kitchenId, {
  kitchenCollectionPath: runtime.kitchenCollectionPath,
})

type TicketLine = {
  label: string
  qty: number
}

type OrderTicket = {
  id: string
  contextLabel: string
  timeLabel: string
  serverName: string
  lines: TicketLine[]
}

const toMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    if (typeof source.seconds === 'number') return source.seconds * 1000
    if (typeof source.toDate === 'function') {
      const toDate = source.toDate as () => Date
      const asDate = toDate()
      return asDate instanceof Date ? asDate.getTime() : 0
    }
  }

  return 0
}

const formatTime = (value: unknown) => {
  const millis = toMillis(value)
  if (!millis) return '-'
  return new Intl.DateTimeFormat('de-CH', { timeStyle: 'short' }).format(millis)
}

const serviceLabel = (mode: unknown) => {
  const raw = String(mode || '').trim()
  if (raw === 'collection') return 'Collection'
  if (raw === 'delivery') return 'Delivery'
  return 'Dine-in'
}

const resolveMode = (service: Record<string, unknown>) => {
  const raw = String(service.mode || '').trim()
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return 'dine_in'
}

const toTimeLabel = (value: unknown) => {
  if (typeof value === 'string') return String(value || '').trim()
  return formatTime(value)
}

const resolveScheduledLabel = (service: Record<string, unknown>) =>
  [
    service.pickup_time,
    service.pickup_at,
    service.collection_time,
    service.delivery_time,
    service.delivery_at,
    service.dropoff_time,
    service.slot,
  ]
    .map((value) => toTimeLabel(value))
    .find(Boolean) || ''

const resolveContextLabel = (order: Record<string, any>) => {
  const service = (order.service || {}) as Record<string, unknown>
  const table = String(service.table_label || '').trim()
  const mode = resolveMode(service)

  if (mode === 'dine_in') {
    if (table) return `Table ${table}`
    return 'Dine-in'
  }

  return serviceLabel(mode)
}

const resolveServerName = (order: Record<string, any>) => {
  const explicit = String(order.server_name || order.service?.server_name || '').trim()
  if (explicit) return explicit

  const channel = String(order.channel || '').trim().toLowerCase()
  const fromCustomer = String(order.customer?.name || '').trim()
  if (channel === 'staff' && fromCustomer) return fromCustomer

  return ''
}

const summarizeLines = (order: Record<string, any>): TicketLine[] => {
  const byLabel = new Map<string, number>()
  const lines = Array.isArray(order.lines) ? order.lines : []

  for (const line of lines) {
    const label = String(line?.label || line?.dish_id || 'Unnamed item').trim()
    if (!label) continue
    const qty = Math.max(0, Number(line?.qty || 0))
    if (!qty) continue
    byLabel.set(label, (byLabel.get(label) || 0) + qty)
  }

  return [...byLabel.entries()]
    .map(([label, qty]) => ({ label, qty }))
    .sort((a, b) => b.qty - a.qty || a.label.localeCompare(b.label))
}

const orderTickets = computed<OrderTicket[]>(() =>
  orders.value.map((order) => {
    const normalized = order as Record<string, any>
    const service = (normalized.service || {}) as Record<string, unknown>
    const mode = resolveMode(service)
    const scheduledLabel = resolveScheduledLabel(service)

    return {
      id: String(normalized.id || '').trim(),
      contextLabel: resolveContextLabel(normalized),
      timeLabel:
        (mode === 'collection' || mode === 'delivery') && scheduledLabel
          ? `Scheduled ${scheduledLabel}`
          : formatTime(normalized.created_at),
      serverName: resolveServerName(normalized),
      lines: summarizeLines(normalized),
    }
  })
)
</script>
