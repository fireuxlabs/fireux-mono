<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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
      <OrganismsOrderCardsTicket
        v-for="ticket in ticketOrders"
        :key="ticket.id"
        :order="ticket"
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
import type { KitchenOrder } from '../../../../models/order.model'

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
    description: 'Browse active kitchen order tickets.',
    showCount: true,
  }
)

const orders = computed(() => props.orders ?? [])
const title = computed(() => String(props.title || 'Orders'))
const description = computed(() =>
  String(props.description || 'Browse active kitchen order tickets.')
)
const showCount = computed(() => props.showCount !== false)

const timestampMs = (value: unknown) => {
  const seconds = Number((value as { seconds?: number } | null)?.seconds)
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0
}

const orderTime = (order: KitchenOrder) =>
  timestampMs((order as any).created?.at) ||
  timestampMs((order as any).updated?.at)

const ticketOrders = computed(() =>
  [...orders.value].sort((a, b) => {
    const aTime = orderTime(a)
    const bTime = orderTime(b)
    if (aTime !== bTime) return aTime - bTime
    return String(a.order_number || a.id).localeCompare(
      String(b.order_number || b.id)
    )
  })
)
const countLabel = computed(() => `${ticketOrders.value.length}`)
const isDev = import.meta.dev
</script>
