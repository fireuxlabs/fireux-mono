<template>
  <UDashboardPanel id="dashboard-kitchen-haccaaap">
    <template #header>
      <LayoutsDashboardNavbar title="HACCAAAP" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">HACCAAAP checks</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Food safety checks and compliance windows for active service.
              </p>
            </div>
          </template>

          <div class="text-xs text-dimmed">{{ checks.length }} checks scheduled</div>
        </UCard>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="check in checks"
            :key="check.id"
            class="rounded-md border border-default p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ check.title }}</p>
                <p class="text-xs text-dimmed">{{ check.windowLabel }}</p>
              </div>

              <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
                <UChip :color="check.statusColor" inset />
                <span>{{ check.statusLabel }}</span>
              </div>
            </div>

            <p class="mt-2 text-xs text-dimmed">
              Owner: {{ check.owner }} · Frequency: {{ check.frequency }}
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
    key: 'dashboard-kitchen-haccaaap',
    label: 'HACCAAAP',
    icon: 'i-lucide-shield-check',
    order: 9,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

type HaccaaapCheck = {
  id: string
  title: string
  windowLabel: string
  owner: string
  frequency: string
  statusLabel: 'due now' | 'on track' | 'overdue'
  statusColor: 'warning' | 'success' | 'error'
}

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))

const checks = computed<HaccaaapCheck[]>(() => [
  {
    id: 'check-cold-holding',
    title: 'Cold Holding Temps',
    windowLabel: 'Service window',
    owner: 'Prep Station',
    frequency: 'Every 2 hours',
    statusLabel: 'on track',
    statusColor: 'success',
  },
  {
    id: 'check-hot-holding',
    title: 'Hot Holding Temps',
    windowLabel: 'Live pass',
    owner: 'Grill Station',
    frequency: 'Hourly',
    statusLabel: 'due now',
    statusColor: 'warning',
  },
  {
    id: 'check-sanitiser',
    title: 'Sanitiser Strength',
    windowLabel: 'Open + close',
    owner: 'Kitchen Lead',
    frequency: 'Twice daily',
    statusLabel: 'overdue',
    statusColor: 'error',
  },
])
</script>
