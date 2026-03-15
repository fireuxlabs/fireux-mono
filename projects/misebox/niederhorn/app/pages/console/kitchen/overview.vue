<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Niederhorn Kitchen Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <UCard>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeKitchen } from 'fireux-kitchens/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { computed } from 'vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-chef-hat',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const overview = computed(() => {
  const data = runtime.data.value
  return [
    { key: 'ingredients', label: 'Kitchen Ingredients', count: data.kitchenIngredients?.length ?? 0 },
    { key: 'mise', label: 'Mise Tasks', count: data.miseTasks?.length ?? 0 },
    { key: 'recipes', label: 'Recipes', count: data.recipes?.length ?? 0 },
    { key: 'dishes', label: 'Dishes', count: data.dishes?.length ?? 0 },
    { key: 'menus', label: 'Menus', count: data.menus?.length ?? 0 },
    { key: 'team', label: 'Team Members', count: data.teamMembers?.length ?? 0 },
    { key: 'stations', label: 'Stations', count: data.stations?.length ?? 0 },
    { key: 'suppliers', label: 'Suppliers', count: data.suppliers?.length ?? 0 },
    { key: 'supplierIngredients', label: 'Supplier Ingredients', count: data.supplierIngredients?.length ?? 0 },
    { key: 'purchases', label: 'Orders Out', count: data.purchases?.length ?? 0 },
    { key: 'incomingOrders', label: 'Orders In', count: data.incomingOrders?.length ?? 0 },
    { key: 'trainingModules', label: 'Training Modules', count: data.trainingModules?.length ?? 0 },
    { key: 'haccpChecks', label: 'HACCP Checks', count: data.haccpChecks?.length ?? 0 },
  ]
})
</script>
