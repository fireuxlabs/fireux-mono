<template>
  <UDashboardPanel id="console-kitchen-recipes">
    <template #header>
      <LayoutsConsoleNavbar title="Recipes" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
          <span>Mode: <span class="font-medium">{{ mode }}</span></span>
          <span>·</span>
          <span>Recipes: <span class="font-medium">{{ recipesVisible.length }}</span></span>
          <template v-if="selectedDish">
            <span>·</span>
            <span>Dish: <span class="font-medium">{{ selectedDishLabel }}</span></span>
          </template>
        </div>

        <UAlert
          v-if="selectedDish"
          color="neutral"
          variant="soft"
          :title="`Recipes for ${selectedDishLabel}`"
          description="This view is filtered from the selected dish context."
        />

        <div v-if="recipesVisible.length" class="space-y-3">
          <UCard
            v-for="(recipe, index) in recipesVisible"
            :key="recipeKey(recipe, index)"
          >
            <div class="space-y-2">
              <div class="text-sm font-semibold">
                {{ recipeName(recipe) }}
              </div>
              <p v-if="recipeDescription(recipe)" class="text-xs text-dimmed">
                {{ recipeDescription(recipe) }}
              </p>
              <div class="text-xs text-dimmed">
                {{ recipeMeta(recipe) }}
              </div>
              <div
                v-if="recipeIngredientLabel(recipe)"
                class="text-xs text-dimmed"
              >
                Ingredients: {{ recipeIngredientLabel(recipe) }}
              </div>
              <div
                v-if="recipeStepLabel(recipe)"
                class="text-xs text-dimmed"
              >
                Steps: {{ recipeStepLabel(recipe) }}
              </div>
            </div>
          </UCard>
        </div>

        <p v-else class="text-sm text-dimmed">
          {{ selectedDish ? 'No recipes linked to this dish yet.' : 'No recipes yet.' }}
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
  tag: 'recipes',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-text',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const recipes = computed(() => runtime.data.value.recipes ?? [])
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
const selectedDishRecipeIds = computed(() => {
  const ids = new Set<string>()
  const primaryRecipeId = String(selectedDish.value?.primary_recipe_id || '').trim()
  if (primaryRecipeId) ids.add(primaryRecipeId)
  for (const recipeId of selectedDish.value?.recipe_ids ?? []) {
    const resolved = String(recipeId || '').trim()
    if (resolved) ids.add(resolved)
  }
  return ids
})

const recipesVisible = computed(() => {
  if (!selectedDish.value) return recipes.value

  return recipes.value.filter((recipe: Record<string, unknown>) => {
    const recipeId = normalize(recipe.id)
    if (recipeId && selectedDishRecipeIds.value.has(recipeId)) return true
    return normalize(recipe.primary_dish_id) === String(selectedDish.value?.id || '').trim()
  })
})

const normalize = (value: unknown) => String(value || '').trim()
const recipeKey = (recipe: Record<string, unknown>, index: number) =>
  normalize(recipe.id) || `recipe-${index}`
const recipeName = (recipe: Record<string, unknown>) =>
  normalize(recipe.name) || normalize(recipe.id) || 'Untitled recipe'
const recipeDescription = (recipe: Record<string, unknown>) => normalize(recipe.description)
const toNumber = (value: unknown) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}
const recipeMeta = (recipe: Record<string, unknown>) => {
  const status = normalize(recipe.workflow_status || recipe.status) || 'draft'
  const yieldQty = toNumber((recipe as { yield_qty?: unknown }).yield_qty)
  const yieldUnit = normalize((recipe as { yield_unit?: unknown }).yield_unit)
  const prepMinutes = toNumber((recipe as { prep_minutes?: unknown }).prep_minutes)
  const cookMinutes = toNumber((recipe as { cook_minutes?: unknown }).cook_minutes)
  const totalMinutes = prepMinutes + cookMinutes

  const summaryParts = [status]
  if (yieldQty > 0) {
    summaryParts.push(`yield ${yieldQty}${yieldUnit ? ` ${yieldUnit}` : ''}`)
  }
  if (totalMinutes > 0) {
    summaryParts.push(`${totalMinutes} min total`)
  }

  return summaryParts.join(' · ')
}

const recipeIngredientLabel = (recipe: Record<string, unknown>) => {
  const lines = Array.isArray((recipe as { ingredient_lines?: unknown[] }).ingredient_lines)
    ? ((recipe as { ingredient_lines?: Array<Record<string, unknown>> }).ingredient_lines ?? [])
    : []

  return lines
    .map((line) => {
      const ingredientName = normalize(line.ingredient_name)
      const quantity = toNumber(line.quantity)
      const unit = normalize(line.unit)
      if (!ingredientName) return ''
      if (quantity > 0) return `${ingredientName} (${quantity}${unit ? ` ${unit}` : ''})`
      return ingredientName
    })
    .filter(Boolean)
    .join(', ')
}

const recipeStepLabel = (recipe: Record<string, unknown>) => {
  const steps = Array.isArray((recipe as { steps?: unknown[] }).steps)
    ? ((recipe as { steps?: Array<Record<string, unknown>> }).steps ?? [])
    : []

  return steps
    .slice()
    .sort((left, right) => toNumber(left.order) - toNumber(right.order))
    .map((step, index) => {
      const title = normalize(step.title)
      if (!title) return ''
      const order = toNumber(step.order) || index + 1
      return `${order}. ${title}`
    })
    .filter(Boolean)
    .join(' / ')
}
</script>
