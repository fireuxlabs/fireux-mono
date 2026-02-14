<template>
  <UDashboardPanel id="dashboard-kitchen-ingredients">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <IngredientCollectionManager
          :collection="kitchenIngredients"
          title="My ingredients"
          description="Ingredients attached to this kitchen."
        />

        <IngredientCollectionManager
          v-if="mode !== 'read-only'"
          :collection="globalIngredients"
          title="Global library"
          description="Shared ingredient catalog."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const { ingredients: globalIngredients } = useIngredientFetch()

const mode = runtime.mode
const kitchenIngredients = computed(() => runtime.data.value.kitchenIngredients ?? [])

</script>
