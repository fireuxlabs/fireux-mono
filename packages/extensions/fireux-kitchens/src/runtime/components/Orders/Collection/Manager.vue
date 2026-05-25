<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
          <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
            <UBadge v-if="showCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <div v-if="ticketOrders.length" class="flex flex-wrap items-start gap-3">
      <OrderCardsTicket
        v-for="(ticket, index) in ticketOrders"
        :key="ticket.id"
        :order="ticket"
        :next="isNextTicket(index)"
      />
    </div>

    <p v-else class="text-sm text-dimmed">No orders found.</p>

    <div v-if="isDev">
      <DevJson
        :title="'Orders (JSON)'"
        context="collection manager · orders"
        :data="orders"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../models/order.model'

const props = withDefaults(
  defineProps<{
    orders?: KitchenOrder[]
    title?: string
    description?: string
    showCount?: boolean
  }>(),
  {
    orders: () => [],
    title: 'Orders',
    description: '',
    showCount: true,
  }
)

const orders = computed(() => props.orders ?? [])
const title = computed(() => String(props.title || 'Orders'))
const description = computed(() => String(props.description || ''))
const showCount = computed(() => props.showCount !== false)
const DEFAULT_TARGET_MINUTES = 15
// TODO: move this to /console/kitchen/orders/settings when ticket rail settings exist.
const TICKET_RAIL_NEXT_POSITION: 'left' | 'right' = 'left'

const timestampMs = (value: unknown, baseMs = 0) => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value > 1_000_000_000_000 ? value : value * 1000

  const source = value as { seconds?: number; toMillis?: () => number } | null
  if (typeof source?.toMillis === 'function') return source.toMillis()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const text = String(value ?? '').trim()
  const timeOnly = text.match(/^(\d{1,2}):(\d{2})$/)
  if (timeOnly) {
    const date = new Date(baseMs || Date.now())
    date.setHours(Number(timeOnly[1]), Number(timeOnly[2]), 0, 0)
    return date.getTime()
  }

  const parsed = Date.parse(text)
  return Number.isFinite(parsed) ? parsed : 0
}

const orderValue = (order: KitchenOrder, keys: string[]) => {
  const source = order as Record<string, unknown>
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

const getCreatedMs = (order: KitchenOrder) =>
  timestampMs((order as any).created?.at) ||
  timestampMs((order as any).created_at) ||
  timestampMs((order as any).updated?.at) ||
  timestampMs((order as any).updated_at)

const getPickupMs = (order: KitchenOrder) => {
  const createdMs = getCreatedMs(order)
  return timestampMs(
    orderValue(order, [
      'pickup_at',
      'pickup_time',
      'collection_at',
      'requested_for',
      'due_at',
    ]),
    createdMs
  )
}

const getServiceMode = (order: KitchenOrder) => {
  const value = String(
    orderValue(order, [
      'service_mode',
      'serviceMode',
      'fulfilment_type',
      'fulfillment_type',
      'order_type',
      'channel',
    ]) ?? ''
  )
    .trim()
    .toLowerCase()

  if (['collection', 'collect', 'pickup', 'pick_up'].includes(value)) return 'collection'
  if (['delivery', 'deliver'].includes(value)) return 'delivery'
  return value
}

const getRailTime = (order: KitchenOrder) => {
  const createdMs = getCreatedMs(order)
  if (getServiceMode(order) !== 'collection') return createdMs

  const pickupMs = getPickupMs(order)
  return pickupMs
    ? pickupMs - DEFAULT_TARGET_MINUTES * 60 * 1000
    : createdMs
}

const ticketOrders = computed(() =>
  [...orders.value].sort((a, b) => {
    const aTime = getRailTime(a)
    const bTime = getRailTime(b)
    if (aTime !== bTime) return aTime - bTime
    return String(a.order_number || a.id).localeCompare(
      String(b.order_number || b.id)
    )
  })
)

const isNextTicket = (index: number) => {
  if (!ticketOrders.value.length) return false
  return TICKET_RAIL_NEXT_POSITION === 'left'
    ? index === 0
    : index === ticketOrders.value.length - 1
}

const countLabel = computed(() => `${ticketOrders.value.length}`)
const isDev = import.meta.dev
</script>
