<template>
  <UDashboardPanel id="dashboard-kitchen-dishes">
    <template #header>
      <LayoutsDashboardNavbar title="Dishes" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
          <span class="mx-2">·</span>
          Kitchen: <span class="font-medium">{{ kitchenId || 'none' }}</span>
          <span class="mx-2">·</span>
          Dishes loaded: <span class="font-medium">{{ dishes.length }}</span>
        </div>

        <UCard v-if="dishes.length">
          <div class="space-y-2">
            <div
              v-for="dish in dishes"
              :key="dish.id"
              class="rounded border border-default p-3"
            >
              <div class="font-bold">{{ dish.name || dish.id }}</div>
              <div class="text-sm text-dimmed">
                {{ dish.active ? 'Active' : 'Inactive' }} · Sort: {{ dish.sort_order || 0 }}
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No dishes loaded"
          description="No dish documents found for the current kitchen context."
        />

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
const kitchenId = runtime.id
const dishes = computed(() => runtime.data.value.dishes ?? [])
</script>
