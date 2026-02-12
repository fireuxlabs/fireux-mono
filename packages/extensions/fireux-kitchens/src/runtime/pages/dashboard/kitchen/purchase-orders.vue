<template>
  <UDashboardPanel id="dashboard-kitchen-orders-out">
    <template #header>
      <LayoutsDashboardNavbar title="Orders Out" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Outgoing purchase orders</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Orders sent from the kitchen to suppliers for stock replenishment.
              </p>
            </div>
          </template>

          <div class="text-xs text-dimmed">{{ purchaseOrders.length }} purchase orders</div>
        </UCard>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="order in purchaseOrders"
            :key="order.id"
            class="rounded-md border border-default p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ order.id }}</p>
                <p class="text-xs text-dimmed">{{ order.supplierName }} · {{ order.etaLabel }}</p>
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
    key: 'dashboard-kitchen-orders-out',
    label: 'Orders Out',
    icon: 'i-lucide-truck',
    order: 13,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

type PurchaseOrder = {
  id: string
  supplierName: string
  etaLabel: string
  summary: string
  statusLabel: 'draft' | 'sent' | 'received'
  statusColor: 'neutral' | 'primary' | 'success'
}

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))

const purchaseOrders = computed<PurchaseOrder[]>(() => [
  {
    id: 'PO-2201',
    supplierName: 'wholesaler',
    etaLabel: 'Needed tomorrow',
    summary: 'Potatoes 20kg, fryer oil 4 x 20L',
    statusLabel: 'draft',
    statusColor: 'neutral',
  },
  {
    id: 'PO-2202',
    supplierName: 'butcher',
    etaLabel: 'ETA today 14:00',
    summary: 'Beef patties 120pc, bacon slices 80pc',
    statusLabel: 'sent',
    statusColor: 'primary',
  },
  {
    id: 'PO-2203',
    supplierName: 'grocer',
    etaLabel: 'Received today',
    summary: 'Lettuce 24pc, tomatoes 18pc, onions 10kg',
    statusLabel: 'received',
    statusColor: 'success',
  },
])
</script>
