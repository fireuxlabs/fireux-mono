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
          <span>Recipes: <span class="font-medium">{{ recipes.length }}</span></span>
        </div>

        <div v-if="recipes.length" class="space-y-3">
          <UCard
            v-for="(recipe, index) in recipes"
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

        <p v-else class="text-sm text-dimmed">No recipes yet.</p>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-console',
  tag: 'recipes',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-text',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const recipes = computed(() => runtime.data.value.recipes ?? [])

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
  const status = normalize(recipe.status) || 'draft'
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
