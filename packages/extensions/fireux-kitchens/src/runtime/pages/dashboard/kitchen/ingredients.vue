<template>
  <UDashboardPanel id="dashboard-kitchen-ingredients">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <div class="space-y-8">
        <section class="space-y-2">
          <div class="text-xs font-medium text-dimmed">My ingredients</div>
          <IngredientCollectionManager
            :collection="myIngredients"
            title="My ingredients"
            description="Ingredients attached to this kitchen."
          />
        </section>

        <section class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Global ingredients</div>
          <IngredientCollectionManager
            :collection="globalIngredients"
            title="Global ingredients"
            description="Click to attach an ingredient to this kitchen."
            :link="false"
            @select="handleGlobalSelect"
          />
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useKitchenIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenIngredientCreate } from '../../../composables/fireux/firestore/ingredient/mutations/useKitchenIngredientCreate'
import type { Ingredient } from '../../../models/ingredient.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 14,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const { runtimeKitchenId, runtimeKitchenCollectionPath } = useRuntimeKitchen()

const { ingredients: kitchenIngredientsResolved } = useKitchenIngredientFetch(
  runtimeKitchenId,
  { kitchenCollectionPath: runtimeKitchenCollectionPath }
)
const { ingredients: globalIngredientsResolved } = useIngredientFetch()
const { createKitchenIngredient } = useKitchenIngredientCreate()
const toast = useToastify()

const myIngredients = computed(() => kitchenIngredientsResolved.value ?? [])
const globalIngredients = computed(() => globalIngredientsResolved.value ?? [])

const handleGlobalSelect = async (ingredient: Ingredient) => {
  const kitchenId = String(runtimeKitchenId || '').trim()
  if (!kitchenId) {
    toast.error('Kitchen id missing')
    return
  }

  try {
    console.info('[dashboard-kitchen-ingredients] attach click', {
      kitchenId,
      kitchenCollectionPath: runtimeKitchenCollectionPath,
      ingredientId: ingredient.id,
    })
    await createKitchenIngredient(kitchenId, {
      ingredient_id: ingredient.id,
    }, {
      kitchenCollectionPath: runtimeKitchenCollectionPath,
    })
    toast.success('Ingredient attached to kitchen')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to attach ingredient'))
  }
}
</script>
