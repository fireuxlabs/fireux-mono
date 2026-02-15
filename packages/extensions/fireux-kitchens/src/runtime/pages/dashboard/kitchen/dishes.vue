<template>
  <UDashboardPanel id="dashboard-kitchen-dishes">
    <template #header>
      <LayoutsDashboardNavbar title="Dishes" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <DishCollectionManager
          :collection="dishes"
          title="Dishes"
          description="Service-ready items for this kitchen."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const dishes = computed(() => runtime.data.value.dishes ?? [])
</script>
