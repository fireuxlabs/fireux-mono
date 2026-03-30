<template>
  <UDashboardPanel id="console-kitchen-mise">
    <template #header>
      <LayoutsConsoleNavbar title="Mise en Place" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
          <template v-if="selectedDish">
            · Dish: <span class="font-medium">{{ selectedDishLabel }}</span>
          </template>
        </div>

        <UAlert
          v-if="selectedDish"
          color="neutral"
          variant="soft"
          :title="`Mise en place for ${selectedDishLabel}`"
          description="This view is filtered from the selected dish context."
        />

        <MiseCollectionManager
          v-if="miseTasksVisible.length"
          :collection="miseTasksVisible"
          title="Mise Tasks"
          description="Prep tasks for the selected runtime kitchen."
        />

        <p v-else class="text-sm text-dimmed">
          {{ selectedDish ? 'No mise tasks linked to this dish yet.' : 'No mise tasks yet.' }}
        </p>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../models/dish.model'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-mise',
    label: 'Mise en place',
    icon: 'i-lucide-clipboard-check',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const miseTasks = computed(() => runtime.data.value.miseTasks ?? [])
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
const selectedDishRecipeIds = computed(() => new Set((selectedDish.value?.recipe_ids ?? []).map((id) => String(id || '').trim()).filter(Boolean)))
const selectedDishMiseIds = computed(() => new Set((selectedDish.value?.mise_ids ?? []).map((id) => String(id || '').trim()).filter(Boolean)))

const miseTasksVisible = computed(() => {
  if (!selectedDish.value) return miseTasks.value

  return miseTasks.value.filter((task: Record<string, unknown>) => {
    const taskId = String(task.id || '').trim()
    if (taskId && selectedDishMiseIds.value.has(taskId)) return true
    const recipeId = String(task.recipe_id || '').trim()
    return recipeId ? selectedDishRecipeIds.value.has(recipeId) : false
  })
})
</script>
