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
            description="Purchasable ingredients attached to this kitchen."
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
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/useRuntimeKitchen'
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
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)
const toast = useToastify()
const { createKitchenIngredient } = useKitchenIngredientCreate()
const { ingredients: firestoreGlobalIngredients } = useIngredientFetch()
const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(runtimeKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const dummyMyIngredients = ref([...dummyKitchenScenario.kitchenIngredients])

const myIngredients = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? dummyMyIngredients.value
    : [...(firestoreKitchenIngredients.value ?? [])]
)
const globalIngredients = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.globalIngredients]
    : [...(firestoreGlobalIngredients.value ?? [])]
)

const myIngredientsDevJson = computed(() => ({
  kitchenId: String(runtimeKitchenId.value || '').trim(),
  kitchenCollectionPath: runtimeKitchenCollectionPath.value,
  kitchenIngredientsPath: `${runtimeKitchenCollectionPath.value}/${runtimeKitchenId.value}/ingredients`,
  runtimeKitchenMode: runtimeKitchenMode.value,
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

    if (runtimeKitchenMode.value === 'dummy') {
      dummyMyIngredients.value = [
        buildKitchenIngredient(ingredient, kitchenId),
        ...myIngredients.value,
      ]
      toast.success('Ingredient attached (dummy)')
      return
    }

    await createKitchenIngredient(
      kitchenId,
      {
        ingredient_id: String(ingredient.id || '').trim(),
        id: String(ingredient.id || '').trim(),
      },
      {
        kitchenCollectionPath: runtimeKitchenCollectionPath.value,
      }
    )
    toast.success('Ingredient attached')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to attach ingredient'))
  }
}
</script>
