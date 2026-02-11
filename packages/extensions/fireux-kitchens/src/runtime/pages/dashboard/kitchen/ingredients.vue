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
            dev-json-title="Kitchen ingredients (JSON)"
            dev-json-context="dashboard kitchen · my ingredients"
            :dev-json-data="myIngredientsDevJson"
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
import { computed, ref } from 'vue'
import { buildKitchenIngredient, dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'
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

const runtimeKitchen = useRuntimeKitchen()
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = 'test-kitchens'
const toast = useToastify()

const myIngredients = ref([...dummyKitchenScenario.kitchenIngredients])
const globalIngredients = computed(() => dummyKitchenScenario.globalIngredients)

const myIngredientsDevJson = computed(() => ({
  kitchenId: String(runtimeKitchenId.value || '').trim(),
  kitchenCollectionPath: runtimeKitchenCollectionPath,
  kitchenIngredientsPath: `${runtimeKitchenCollectionPath}/${runtimeKitchenId.value}/ingredients`,
  count: myIngredients.value.length,
  ingredients: myIngredients.value,
}))

const handleGlobalSelect = async (ingredient: Ingredient) => {
  const kitchenId = String(runtimeKitchenId.value || '').trim()
  if (!kitchenId) {
    toast.error('Kitchen id missing')
    return
  }

  try {
    const exists = myIngredients.value.some(
      (entry) => String(entry.ingredient_id || entry.id || '').trim() === String(ingredient.id)
    )
    if (exists) {
      toast.info('Ingredient already attached')
      return
    }

    myIngredients.value = [
      buildKitchenIngredient(ingredient, kitchenId),
      ...myIngredients.value,
    ]
    toast.success('Ingredient attached (dummy)')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to attach ingredient'))
  }
}
</script>
