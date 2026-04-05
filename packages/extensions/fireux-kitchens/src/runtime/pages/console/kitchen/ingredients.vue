<template>
  <UDashboardPanel id="console-kitchen-ingredients">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UAlert
          v-if="!kitchenId"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before managing ingredients."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <div class="text-xs text-dimmed">
            Mode: <span class="font-medium">{{ mode }}</span>
            · Kitchen: <span class="font-mono">{{ kitchenId }}</span>
            <template v-if="selectedDish">
              · Dish: <span class="font-medium">{{ selectedDishLabel }}</span>
            </template>
          </div>

          <UAlert
            v-if="selectedDish"
            color="neutral"
            variant="soft"
            :title="`Ingredients for ${selectedDishLabel}`"
            description="This view is filtered from the selected dish context."
          />

          <IngredientCollectionManager
            :collection="kitchenIngredientsVisible"
            :title="selectedDish ? 'Linked ingredients' : 'My ingredients'"
            :description="selectedDish
              ? 'Ingredients linked to the selected dish.'
              : mode === 'demo'
                ? 'Ingredients attached to this kitchen.'
                : 'Ingredients attached to this kitchen. Click to remove.'"
            :link="mode === 'demo'"
            @select="handleRemoveFromKitchen"
          />

          <IngredientCollectionManager
            v-if="mode !== 'demo' && !selectedDish"
            :collection="globalIngredientsAvailable"
            title="Global library"
            description="Shared ingredient catalog. Click to add to this kitchen."
            :link="false"
            @select="handleAddToKitchen"
          />
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useKitchenIngredientAdd } from '../../../composables/fireux/firestore/runtime-kitchen/ingredients/mutations/useKitchenIngredientAdd'
import { useKitchenIngredientRemove } from '../../../composables/fireux/firestore/runtime-kitchen/ingredients/mutations/useKitchenIngredientRemove'
import type { Dish } from '../../../models/dish.model'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const { ingredients: globalIngredients } = useIngredientFetch()
const { addIngredientToKitchen } = useKitchenIngredientAdd()
const { removeIngredientFromKitchen } = useKitchenIngredientRemove()
const toast = useToastify()
const transferBusyIds = new Set<string>()

const mode = runtime.mode
const kitchenId = computed(() => String(runtime.id.value || '').trim())
const dishes = computed(() => runtime.data.value.dishes ?? [])
const route = useRoute()
const selectedDishId = computed(() => String(route.query.dishId || '').trim())
const selectedDish = computed<Dish | null>(() => {
  if (!selectedDishId.value) return null
  return dishes.value.find((dish) => String(dish.id || '').trim() === selectedDishId.value) || null
})
const selectedDishLabel = computed(
  () => selectedDish.value?.name || selectedDish.value?.id || 'Selected dish'
)
const kitchenIngredientIds = computed(() => {
  const out = new Set<string>()
  const kitchenItems = runtime.data.value.kitchenIngredients ?? []
  for (const entry of kitchenItems) {
    const ingredientId = String((entry as any).ingredient_id || (entry as any).id || '').trim()
    if (ingredientId) out.add(ingredientId)
  }
  return out
})

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

const kitchenIngredientsVisible = computed(() => {
  if (!selectedDish.value) return kitchenIngredients.value

  const ingredientIds = new Set(
    (selectedDish.value.ingredient_ids ?? [])
      .map((id) => String(id || '').trim())
      .filter(Boolean)
  )

  return kitchenIngredients.value.filter((ingredient: any) => {
    const ingredientId = String(ingredient?.ingredient_id || ingredient?.id || '').trim()
    return ingredientId ? ingredientIds.has(ingredientId) : false
  })
})

const globalIngredientsAvailable = computed(() =>
  (globalIngredients.value ?? []).filter((ingredient) => {
    const id = String((ingredient as any)?.id || '').trim()
    if (!id) return false
    return !kitchenIngredientIds.value.has(id)
  })
)

const resolveRuntimeKitchenWriteContext = () => {
  if (mode.value === 'demo') {
    throw new Error('Read-only kitchen cannot be modified')
  }

  if (!kitchenId.value) throw new Error('No runtime kitchen selected')

  const kitchenCollectionPath = String(runtime.kitchenCollectionPath.value || '').trim()
  if (!kitchenCollectionPath) throw new Error('No runtime kitchen collection path')

  return { kitchenId: kitchenId.value, kitchenCollectionPath }
}

const withIngredientTransferGuard = async (
  ingredientId: string,
  action: () => Promise<void>
) => {
  const id = String(ingredientId || '').trim()
  if (!id) return
  if (transferBusyIds.has(id)) return

  transferBusyIds.add(id)
  try {
    await action()
  } finally {
    transferBusyIds.delete(id)
  }
}

const handleAddToKitchen = async (ingredient: any) => {
  const ingredientId = String(ingredient?.id || '').trim()
  if (!ingredientId) return

  await withIngredientTransferGuard(ingredientId, async () => {
    try {
      const { kitchenId, kitchenCollectionPath } = resolveRuntimeKitchenWriteContext()
      await addIngredientToKitchen(
        kitchenId,
        {
          id: ingredientId,
          name: String(ingredient?.name || '').trim(),
          slug: String(ingredient?.slug || '').trim(),
          image_url: String(ingredient?.image_url || '').trim(),
        },
        { kitchenCollectionPath }
      )
      toast.success('Added to kitchen')
    } catch (error: any) {
      toast.error(String(error?.message || 'Failed to add ingredient'))
    }
  })
}

const handleRemoveFromKitchen = async (ingredient: any) => {
  const ingredientId = String((ingredient as any)?.ingredient_id || ingredient?.id || '').trim()
  if (!ingredientId) return

  await withIngredientTransferGuard(ingredientId, async () => {
    try {
      const { kitchenId, kitchenCollectionPath } = resolveRuntimeKitchenWriteContext()
      await removeIngredientFromKitchen(kitchenId, ingredientId, { kitchenCollectionPath })
      toast.success('Removed from kitchen')
    } catch (error: any) {
      toast.error(String(error?.message || 'Failed to remove ingredient'))
    }
  })
}

</script>
