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
const kitchenIngredients = computed(() => {
  const kitchenItems = runtime.data.value.kitchenIngredients ?? []
  const globalById = new Map(
    (globalIngredients.value ?? [])
      .map((ingredient) => [String(ingredient.id || '').trim(), ingredient] as const)
      .filter(([id]) => Boolean(id))
  )

  return kitchenItems.map((entry) => {
    const ingredientId = String((entry as any).ingredient_id || entry.id || '').trim()
    if (!ingredientId) return entry

    const global = globalById.get(ingredientId)
    if (!global) return entry

    const entryImage = String((entry as any).image_url || '').trim()
    const globalImage = String((global as any).image_url || '').trim()
    const entryName = String((entry as any).name || '').trim()
    const globalName = String((global as any).name || '').trim()

    return {
      ...global,
      ...entry,
      ingredient_id: ingredientId,
      image_url: entryImage || globalImage,
      name: entryName || globalName,
    }
  })
})

</script>
