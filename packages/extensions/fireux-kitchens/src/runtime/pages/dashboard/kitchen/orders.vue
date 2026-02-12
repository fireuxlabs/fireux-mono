<template>
  <UDashboardPanel id="dashboard-kitchen-orders-in">
    <template #header>
      <LayoutsDashboardNavbar title="Orders In" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Incoming service orders</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Customer orders coming into service for prep and fulfillment.
              </p>
            </div>
          </template>

          <div class="text-xs text-dimmed">{{ incomingOrders.length }} open tickets</div>
        </UCard>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="order in incomingOrders"
            :key="order.id"
            class="rounded-md border border-default p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ order.id }}</p>
                <p class="text-xs text-dimmed">{{ order.channel }} · {{ order.tableLabel }}</p>
              </div>

              <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
                <UChip :color="order.statusColor" inset />
                <span>{{ order.statusLabel }}</span>
              </div>
            </div>

            <p class="mt-2 text-xs text-dimmed">
              {{ order.summary }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

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

type IncomingOrder = {
  id: string
  channel: 'dine-in' | 'delivery' | 'takeaway'
  tableLabel: string
  summary: string
  statusLabel: 'new' | 'in progress' | 'ready'
  statusColor: 'warning' | 'primary' | 'success'
}

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))

const incomingOrders = computed<IncomingOrder[]>(() => [
  {
    id: 'ORD-1042',
    channel: 'dine-in',
    tableLabel: 'Table 12',
    summary: '2x Classic Beef, 1x Smoky Bacon, 1x fries',
    statusLabel: 'new',
    statusColor: 'warning',
  },
  {
    id: 'ORD-1043',
    channel: 'delivery',
    tableLabel: 'App pickup',
    summary: '1x Crispy Chicken, 1x Garden Veggie',
    statusLabel: 'in progress',
    statusColor: 'primary',
  },
  {
    id: 'ORD-1044',
    channel: 'takeaway',
    tableLabel: 'Counter',
    summary: '2x Full English, 1x Eggs Royale',
    statusLabel: 'ready',
    statusColor: 'success',
  },
])
</script>
