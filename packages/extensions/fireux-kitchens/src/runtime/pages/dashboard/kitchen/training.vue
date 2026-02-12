<template>
  <UDashboardPanel id="dashboard-kitchen-training">
    <template #header>
      <LayoutsDashboardNavbar title="Training" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Training board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Track kitchen onboarding and role progression training.
              </p>
            </div>
          </template>

          <div class="text-xs text-dimmed">{{ modules.length }} core modules</div>
        </UCard>

        <div class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="module in modules"
            :key="module.id"
            class="rounded-md border border-default p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ module.title }}</p>
                <p class="text-xs text-dimmed">{{ module.owner }}</p>
              </div>

              <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
                <UChip :color="module.statusColor" inset />
                <span>{{ module.statusLabel }}</span>
              </div>
            </div>

            <p class="mt-2 text-xs text-dimmed">
              {{ module.description }}
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
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-training',
    label: 'Training',
    icon: 'i-lucide-graduation-cap',
    order: 8,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

type TrainingModule = {
  id: string
  title: string
  owner: string
  description: string
  statusLabel: 'ready' | 'in progress' | 'planned'
  statusColor: 'success' | 'warning' | 'error'
}

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))

const modules = computed<TrainingModule[]>(() => [
  {
    id: 'module-station-basics',
    title: 'Station Basics',
    owner: 'Head Chef',
    description: 'Line setup, handoff protocol, and pace targets by station.',
    statusLabel: 'ready',
    statusColor: 'success',
  },
  {
    id: 'module-food-safety',
    title: 'Food Safety',
    owner: 'Kitchen Manager',
    description: 'Cold chain, contamination prevention, and cleaning standards.',
    statusLabel: 'in progress',
    statusColor: 'warning',
  },
  {
    id: 'module-service-recovery',
    title: 'Service Recovery',
    owner: 'Floor Lead',
    description: 'How to recover delayed tickets and quality misses during service.',
    statusLabel: 'planned',
    statusColor: 'error',
  },
])
</script>
