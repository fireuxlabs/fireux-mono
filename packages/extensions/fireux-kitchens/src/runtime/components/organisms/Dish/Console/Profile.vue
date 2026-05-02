<template>
  <UCard v-if="dish">
    <div class="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div class="overflow-hidden rounded-lg border border-default bg-elevated/40">
        <img
          v-if="dish.image_url"
          :src="dish.image_url"
          :alt="dish.name || dish.short_name || 'Dish image'"
          class="aspect-square w-full object-cover"
          loading="lazy"
        >
        <div
          v-else
          class="flex aspect-square w-full items-center justify-center text-dimmed"
        >
          <UIcon name="i-lucide-utensils" class="size-8" />
        </div>
      </div>

      <div class="space-y-5">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UChip :color="dish.active === false ? 'error' : 'success'" inset />
            <h2 class="text-2xl font-semibold text-highlighted">
              {{ dish.name || dish.short_name || dish.id || 'Untitled dish' }}
            </h2>
          </div>

          <p
            v-if="dish.short_name && dish.short_name !== dish.name"
            class="text-sm text-toned"
          >
            {{ dish.short_name }}
          </p>

          <p v-if="dish.description" class="max-w-2xl text-sm text-dimmed">
            {{ dish.description }}
          </p>
        </div>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Primary recipe:
            <span class="console-summary-value">
              {{ dish.primary_recipe_id || 'Not linked' }}
            </span>
          </div>
          <div class="console-summary-field">
            Recipes:
            <span class="console-summary-value">
              {{ recipeCount }}
            </span>
          </div>
          <div class="console-summary-field">
            Ingredients:
            <span class="console-summary-value">
              {{ ingredientCount }}
            </span>
          </div>
          <div class="console-summary-field">
            Mise:
            <span class="console-summary-value">
              {{ miseCount }}
            </span>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <UCard variant="soft">
            <div class="space-y-1">
              <div class="text-sm font-medium text-highlighted">Sales</div>
              <p class="text-xs text-dimmed">
                Menu usage, pricing, upsells, allergens, and sales notes will live here.
              </p>
            </div>
          </UCard>

          <UCard variant="soft">
            <div class="space-y-1">
              <div class="text-sm font-medium text-highlighted">Kitchen build</div>
              <p class="text-xs text-dimmed">
                Recipe, station, build steps, timing, and plating checks will live here.
              </p>
            </div>
          </UCard>

          <UCard variant="soft">
            <div class="space-y-1">
              <div class="text-sm font-medium text-highlighted">Training</div>
              <p class="text-xs text-dimmed">
                Competency, sign-off, and service talking points will live here.
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'

const props = defineProps<{
  dish: Dish | null
}>()

const recipeCount = computed(() =>
  Array.isArray(props.dish?.recipe_ids) ? props.dish.recipe_ids.length : 0
)

const ingredientCount = computed(() =>
  Array.isArray(props.dish?.ingredient_ids) ? props.dish.ingredient_ids.length : 0
)

const miseCount = computed(() =>
  Array.isArray(props.dish?.mise_ids) ? props.dish.mise_ids.length : 0
)
</script>
