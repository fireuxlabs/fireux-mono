<template>
  <section class="space-y-4">
    <UCard v-if="dishesSorted.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Dish Previews</div>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="dish in dishesSorted"
          :key="dish.id"
          :to="dishTo(dish)"
          class="block"
        >
          <UCard variant="soft" class="h-full transition hover:bg-elevated/60">
            <div class="flex items-start gap-3">
              <UAvatar
                :alt="dish.name"
                icon="i-lucide-utensils"
                size="lg"
                class="shrink-0"
              />

              <div class="min-w-0 flex-1 space-y-3">
                <div class="space-y-1">
                  <h3 class="truncate text-base font-semibold text-highlighted">
                    {{ dish.name }}
                  </h3>

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
                    {{ miseCount(dish) }}
                    {{ miseCount(dish) === 1 ? 'mise' : 'mise' }}
                  </UBadge>
                  <UBadge variant="soft" color="neutral" size="xs">
                    {{ ingredientCount(dish) }}
                    {{ ingredientCount(dish) === 1 ? 'ingredient' : 'ingredients' }}
                  </UBadge>
                  <UBadge
                    v-if="menuUsageCount(dish)"
                    variant="soft"
                    color="primary"
                    size="xs"
                  >
                    {{ menuUsageCount(dish) }}
                    {{ menuUsageCount(dish) === 1 ? 'menu' : 'menus' }}
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
      title="No dishes"
      description="No dishes are available for the selected kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../../models/dish.model'
import type { KitchenDishMenuUsage } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const props = withDefaults(
  defineProps<{
    collection?: Dish[]
    menuUsageByDishId?: Record<string, KitchenDishMenuUsage[]>
  }>(),
  {
    collection: () => [],
    menuUsageByDishId: () => ({}),
  }
)

const dishesSorted = computed(() =>
  [...props.collection].sort(
    (a, b) =>
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const recipeCount = (dish: Dish) =>
  Array.isArray(dish.recipe_ids) ? dish.recipe_ids.length : 0

const miseCount = (dish: Dish) =>
  Array.isArray(dish.mise_ids) ? dish.mise_ids.length : 0

const ingredientCount = (dish: Dish) =>
  Array.isArray(dish.ingredient_ids) ? dish.ingredient_ids.length : 0

const menuUsageCount = (dish: Dish) =>
  dish.id ? (props.menuUsageByDishId[dish.id] || []).length : 0

const dishTo = (dish: Dish) =>
  `/console/kitchen/dishes/${encodeURIComponent(dish.id)}`
</script>
