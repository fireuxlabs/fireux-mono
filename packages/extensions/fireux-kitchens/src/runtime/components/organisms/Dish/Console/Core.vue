<template>
  <section class="space-y-4">
    <UCard v-if="dishesSorted.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Dish Profiles</div>
          <p class="console-card-header__description">
            Lightweight operator view of the selected kitchen's sellable dishes.
          </p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UCard
          v-for="dish in dishesSorted"
          :key="dish.id || dish.name"
          variant="soft"
        >
          <div class="flex items-start gap-3">
            <UAvatar
              :src="dish.image_url || undefined"
              :alt="dish.name || dish.short_name || 'Dish'"
              icon="i-lucide-utensils"
              size="lg"
              class="shrink-0"
            />

            <div class="min-w-0 flex-1 space-y-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <UChip :color="dish.active === false ? 'error' : 'success'" inset />
                  <h3 class="truncate text-base font-semibold text-highlighted">
                    {{ dish.name || dish.short_name || dish.id || 'Untitled dish' }}
                  </h3>
                </div>

                <p
                  v-if="dish.short_name && dish.short_name !== dish.name"
                  class="truncate text-xs text-toned"
                >
                  {{ dish.short_name }}
                </p>

                <p v-if="dish.description" class="line-clamp-2 text-sm text-dimmed">
                  {{ dish.description }}
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-1">
                <UBadge variant="soft" color="neutral" size="xs">
                  {{ recipeCount(dish) }}
                  {{ recipeCount(dish) === 1 ? 'recipe' : 'recipes' }}
                </UBadge>
                <UBadge variant="soft" color="neutral" size="xs">
                  {{ ingredientCount(dish) }}
                  {{ ingredientCount(dish) === 1 ? 'ingredient' : 'ingredients' }}
                </UBadge>
                <UBadge variant="soft" color="neutral" size="xs">
                  {{ miseCount(dish) }}
                  {{ miseCount(dish) === 1 ? 'mise' : 'mise' }}
                </UBadge>
              </div>

              <p v-if="dish.primary_recipe_id" class="truncate text-xs text-dimmed">
                Primary recipe: {{ dish.primary_recipe_id }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No dishes"
      description="No dishes are available for the selected kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'

const props = withDefaults(
  defineProps<{
    collection?: Dish[]
  }>(),
  {
    collection: () => [],
  }
)

const dishesSorted = computed(() =>
  [...props.collection].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const recipeCount = (dish: Dish) =>
  Array.isArray(dish.recipe_ids) ? dish.recipe_ids.length : 0

const ingredientCount = (dish: Dish) =>
  Array.isArray(dish.ingredient_ids) ? dish.ingredient_ids.length : 0

const miseCount = (dish: Dish) =>
  Array.isArray(dish.mise_ids) ? dish.mise_ids.length : 0
</script>
