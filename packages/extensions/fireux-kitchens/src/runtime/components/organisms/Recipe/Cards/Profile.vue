<template>
  <UCard v-if="recipe">
    <div class="flex flex-col gap-5 md:flex-row md:items-start">
      <div
        class="shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40"
        style="width: 256px; height: 256px; max-width: 256px; max-height: 256px;"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="object-cover"
          style="width: 256px; height: 256px; max-width: 256px; max-height: 256px;"
          loading="lazy"
        >
        <div
          v-else
          class="flex h-full w-full items-center justify-center text-dimmed"
        >
          <UIcon name="i-lucide-book-copy" class="size-8" />
        </div>
      </div>

      <div class="min-w-0 flex-1 space-y-5">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UChip :color="recipe.workflow_status === 'active' ? 'success' : 'neutral'" inset />
            <h2 class="text-2xl font-semibold text-highlighted">
              {{ title }}
            </h2>
          </div>

          <p v-if="subtitle" class="text-sm text-toned">
            {{ subtitle }}
          </p>

          <p v-if="description" class="max-w-2xl text-sm text-dimmed">
            {{ description }}
          </p>
        </div>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Ingredients:
            <span class="console-summary-value">{{ ingredientLinesCount }}</span>
          </div>
          <div class="console-summary-field">
            Steps:
            <span class="console-summary-value">{{ stepsCount }}</span>
          </div>
          <div class="console-summary-field">
            Prep:
            <span class="console-summary-value">{{ recipe.prep_minutes || 0 }}m</span>
          </div>
          <div class="console-summary-field">
            Cook:
            <span class="console-summary-value">{{ recipe.cook_minutes || 0 }}m</span>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <UCard variant="soft">
            <div class="space-y-1">
              <div class="text-sm font-medium text-highlighted">Linked dish</div>
              <p class="text-xs text-dimmed">
                {{ recipe.primary_dish_id || 'No primary dish linked yet.' }}
              </p>
            </div>
          </UCard>

          <UCard variant="soft">
            <div class="space-y-1">
              <div class="text-sm font-medium text-highlighted">Method</div>
              <p class="text-xs text-dimmed">
                Recipe method, steps, and prep guidance will live here.
              </p>
            </div>
          </UCard>

          <UCard variant="soft">
            <div class="space-y-1">
              <div class="text-sm font-medium text-highlighted">Controls</div>
              <p class="text-xs text-dimmed">
                Publishing, visibility, and training controls will live here.
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
import type { Recipe } from '../../../../models/recipe.model'

const props = defineProps<{
  recipe: Recipe | null
}>()

const title = computed(
  () =>
    String(props.recipe?.published_summary?.title || props.recipe?.name || '').trim() ||
    'Untitled recipe'
)

const imageUrl = computed(() =>
  String(props.recipe?.published_summary?.hero_image_url || '').trim()
)

const description = computed(
  () =>
    String(
      props.recipe?.published_summary?.description ||
        props.recipe?.description ||
        ''
    ).trim()
)

const subtitle = computed(() =>
  [
    props.recipe?.recipe_type,
    props.recipe?.workflow_status,
    props.recipe?.visibility,
  ]
    .filter(Boolean)
    .join(' · ')
)

const ingredientLinesCount = computed(() =>
  Array.isArray(props.recipe?.ingredient_lines)
    ? props.recipe.ingredient_lines.length
    : 0
)

const stepsCount = computed(() =>
  Array.isArray(props.recipe?.steps) ? props.recipe.steps.length : 0
)
</script>
