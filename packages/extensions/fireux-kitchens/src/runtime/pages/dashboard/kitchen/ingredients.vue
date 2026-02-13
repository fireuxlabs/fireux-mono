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
          :collection="globalIngredients"
          title="Global library"
          description="Shared ingredient catalog."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import IngredientCollectionManager from '../../../components/organisms/Ingredient/Collection/Manager.vue'
import { useRuntimeKitchen, useRuntimeKitchenSelection } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
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

const { runtimeKitchenId, runtimeKitchenMode } = useRuntimeKitchenSelection()
const runtime = useRuntimeKitchen({
  kitchenId: runtimeKitchenId,
  mode: runtimeKitchenMode,
})

const mode = runtime.mode
const kitchenIngredients = runtime.data.kitchenIngredients
const { ingredients: globalIngredients } = useIngredientFetch()

</script>
