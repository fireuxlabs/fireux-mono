<template>
  <UDashboardPanel id="console-kitchen-dev">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Runtime Dev" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Runtime ID</div>
              <div class="text-sm font-mono break-all">{{ runtimeId || 'unset' }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Mode</div>
              <div class="text-sm font-medium">{{ runtimeMode }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Document Path</div>
              <div class="text-sm font-mono">{{ documentCollectionPath }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Data Path</div>
              <div class="text-sm font-mono">{{ collectionPath }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ready</div>
              <div class="text-sm font-medium">{{ isReady ? 'yes' : 'no' }}</div>
            </div>
          </div>
        </UCard>

        <DevJson
          title="Kitchen Runtime (JSON)"
          context="console/kitchen/dev · current runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="true"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-dev',
    label: 'Dev',
    icon: 'i-lucide-braces',
    order: 120,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  name: 'ConsoleKitchenDevPage',
})

const runtime = useRuntimeKitchen()

const runtimeId = computed(() => String(runtime.id.value || '').trim())
const runtimeMode = computed(() => runtime.mode.value)
const documentCollectionPath = computed(() => runtime.documentCollectionPath.value)
const collectionPath = computed(() => runtime.collectionPath.value)
const isReady = computed(() => runtime.isReady.value)

const runtimeSnapshot = computed(() => {
  const data = runtime.data.value
  return {
    id: runtime.id.value,
    mode: runtime.mode.value,
    isDemo: runtime.isDemo.value,
    documentCollectionPath: runtime.documentCollectionPath.value,
    collectionPath: runtime.collectionPath.value,
    pending: runtime.pending.value,
    isLoading: runtime.isLoading.value,
    isReady: runtime.isReady.value,
    doc: runtime.doc.value,
    data,
    counts: {
      kitchenIngredients: data.kitchenIngredients?.length ?? 0,
      stations: data.stations?.length ?? 0,
      menus: data.menus?.length ?? 0,
      dishes: data.dishes?.length ?? 0,
      recipes: data.recipes?.length ?? 0,
      miseTasks: data.miseTasks?.length ?? 0,
      teamMembers: data.teamMembers?.length ?? 0,
      suppliers: data.suppliers?.length ?? 0,
      supplierIngredients: data.supplierIngredients?.length ?? 0,
      purchases: data.purchases?.length ?? 0,
      kitchenOrders: data.kitchenOrders?.length ?? 0,
      incomingOrders: data.incomingOrders?.length ?? 0,
      trainingModules: data.trainingModules?.length ?? 0,
      haccpChecks: data.haccpChecks?.length ?? 0,
    },
  }
})
</script>
