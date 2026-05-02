<template>
  <section class="space-y-4">
    <UCard v-if="recipesSorted.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Recipe Profiles</div>
          <p class="console-card-header__description">
            Lightweight operator view of the selected kitchen's recipe library.
          </p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="recipe in recipesSorted"
          :key="recipe.id || recipe.name"
          :to="recipeTo(recipe)"
          class="block"
        >
          <UCard variant="soft" class="h-full transition hover:bg-elevated/60">
            <div class="flex items-start gap-3">
              <UAvatar
                v-if="recipeImageUrl(recipe)"
                :src="recipeImageUrl(recipe)"
                :alt="recipeTitle(recipe)"
                size="lg"
                class="shrink-0"
              />
              <div
                v-else
                class="flex size-12 shrink-0 items-center justify-center rounded-md border border-default bg-elevated/40 text-dimmed"
              >
                <UIcon name="i-lucide-scroll-text" class="size-5" />
              </div>

              <div class="min-w-0 flex-1 space-y-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <UChip
                      :color="
                        recipe.workflow_status === 'active'
                          ? 'success'
                          : 'neutral'
                      "
                      inset
                    />
                    <h3 class="truncate text-base font-semibold text-highlighted">
                      {{ recipeTitle(recipe) }}
                    </h3>
                  </div>

                  <p v-if="recipeSubtitle(recipe)" class="truncate text-xs text-toned">
                    {{ recipeSubtitle(recipe) }}
                  </p>

                  <p
                    v-if="recipeDescription(recipe)"
                    class="line-clamp-2 text-sm text-dimmed"
                  >
                    {{ recipeDescription(recipe) }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-1">
                  <UBadge variant="soft" color="neutral" size="xs">
                    {{ ingredientLinesCount(recipe) }}
                    {{ ingredientLinesCount(recipe) === 1 ? 'ingredient' : 'ingredients' }}
                  </UBadge>
                  <UBadge variant="soft" color="neutral" size="xs">
                    {{ stepsCount(recipe) }}
                    {{ stepsCount(recipe) === 1 ? 'step' : 'steps' }}
                  </UBadge>
                  <UBadge
                    v-if="dishUsageCount(recipe)"
                    variant="soft"
                    color="primary"
                    size="xs"
                  >
                    {{ dishUsageCount(recipe) }}
                    {{ dishUsageCount(recipe) === 1 ? 'dish' : 'dishes' }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No recipes"
      description="No recipes are available for the selected kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenRecipeDishUsage } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'
import type { Recipe } from '../../../../models/recipe.model'

const props = withDefaults(
  defineProps<{
    collection?: Recipe[]
    dishUsageByRecipeId?: Record<string, KitchenRecipeDishUsage[]>
  }>(),
  {
    collection: () => [],
    dishUsageByRecipeId: () => ({}),
  }
)

const recipesSorted = computed(() =>
  [...props.collection].sort((a, b) =>
    recipeTitle(a).localeCompare(recipeTitle(b))
  )
)

const safeString = (value: unknown) => String(value ?? '').trim()

const recipeTitle = (recipe: Recipe) =>
  safeString(recipe?.published_summary?.title) ||
  safeString(recipe?.name) ||
  safeString(recipe?.id) ||
  'Untitled recipe'

const recipeImageUrl = (recipe: Recipe) =>
  safeString(recipe?.published_summary?.hero_image_url)

const recipeDescription = (recipe: Recipe) =>
  safeString(recipe?.published_summary?.description) ||
  safeString(recipe?.description)

const recipeSubtitle = (recipe: Recipe) =>
  [
    safeString(recipe?.recipe_type),
    safeString(recipe?.workflow_status),
    safeString(recipe?.visibility),
  ]
    .filter(Boolean)
    .join(' · ')

const ingredientLinesCount = (recipe: Recipe) =>
  Array.isArray(recipe?.ingredient_lines) ? recipe.ingredient_lines.length : 0

const stepsCount = (recipe: Recipe) =>
  Array.isArray(recipe?.steps) ? recipe.steps.length : 0

const dishUsageCount = (recipe: Recipe) =>
  recipe.id ? (props.dishUsageByRecipeId[recipe.id] || []).length : 0

const recipeTo = (recipe: Recipe) =>
  recipe.id
    ? `/console/kitchen/recipes/${encodeURIComponent(recipe.id)}`
    : '/console/kitchen/recipes'
</script>
