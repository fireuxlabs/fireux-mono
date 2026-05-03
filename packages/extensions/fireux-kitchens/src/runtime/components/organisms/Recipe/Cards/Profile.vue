<template>
  <UCard v-if="recipe">
    <div class="space-y-6">
      <div class="flex flex-col gap-5 md:flex-row md:items-start">
        <div
          class="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40 md:h-24 md:w-24"
          style="width: 80px; height: 80px; max-width: 80px; max-height: 80px;"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="title"
            class="h-full w-full object-cover"
            style="width: 100%; height: 100%; object-fit: cover;"
            loading="lazy"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-dimmed"
          >
            <UIcon name="i-lucide-book-copy" class="size-5" />
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

            <p v-if="description" class="max-w-2xl text-sm text-dimmed">
              {{ description }}
            </p>
          </div>

          <div class="console-summary-grid">
            <div class="console-summary-field">
              Yield:
              <span class="console-summary-value">{{ yieldLabel }}</span>
            </div>
            <div class="console-summary-field">
              Prep:
              <span class="console-summary-value">{{ recipe.prep_minutes || 0 }}m</span>
            </div>
            <div class="console-summary-field">
              Cook:
              <span class="console-summary-value">{{ recipe.cook_minutes || 0 }}m</span>
            </div>
            <div class="console-summary-field">
              Type:
              <span class="console-summary-value">{{ recipe.recipe_type || 'Recipe' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <UCard variant="soft">
          <div class="space-y-3">
            <div class="text-sm font-medium text-highlighted">
              Ingredients
            </div>
            <div v-if="ingredientLines.length" class="space-y-2">
              <div
                v-for="line in ingredientLines"
                :key="line.id"
                class="rounded-md border border-default bg-default/60 p-3"
              >
                <div class="flex gap-2 text-sm">
                  <span class="shrink-0 font-medium text-highlighted">
                    {{ line.quantityLabel }}
                  </span>
                  <span class="min-w-0 text-highlighted">
                    {{ line.ingredientName }}
                  </span>
                </div>
                <p v-if="line.prepNote" class="mt-1 text-xs text-dimmed">
                  {{ line.prepNote }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-dimmed">
              Ingredients not set.
            </p>
          </div>
        </UCard>

        <UCard variant="soft">
          <div class="space-y-3">
            <div class="text-sm font-medium text-highlighted">Method</div>
            <ol v-if="methodSteps.length" class="space-y-3 text-sm">
              <li
                v-for="step in methodSteps"
                :key="step.id"
                class="flex gap-3"
              >
                <span class="w-5 shrink-0 text-xs font-medium text-dimmed">
                  {{ step.order }}.
                </span>
                <div class="min-w-0 space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p v-if="step.title" class="font-medium text-highlighted">
                      {{ step.title }}
                    </p>
                    <UBadge
                      v-if="step.minutes"
                      variant="soft"
                      color="neutral"
                      size="xs"
                    >
                      {{ step.minutes }}m
                    </UBadge>
                  </div>
                  <p class="text-highlighted">
                    {{ step.instruction }}
                  </p>
                </div>
              </li>
            </ol>
            <p v-else class="text-sm text-dimmed">
              Method not set.
            </p>
          </div>
        </UCard>
      </div>

      <UCard variant="soft">
        <div class="space-y-3">
          <div>
            <div class="text-sm font-medium text-highlighted">Dish usage</div>
            <p class="text-xs text-dimmed">
              Sellable dishes that depend on this recipe.
            </p>
          </div>

          <div v-if="dishUsageSorted.length" class="space-y-2">
            <div
              v-for="usage in dishUsageSorted"
              :key="usage.dishId"
              class="pill"
            >
              <div class="flex min-w-0 items-start gap-2">
                <UAvatar
                  :src="usage.dishImageUrl || undefined"
                  :alt="usage.dishName"
                  icon="i-lucide-utensils"
                  size="sm"
                  class="shrink-0"
                />

                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-center gap-2">
                    <UChip
                      :color="usage.active ? 'success' : 'error'"
                      inset
                    />
                    <p class="truncate text-sm font-medium text-highlighted">
                      {{ usage.dishName || usage.dishId || 'Untitled dish' }}
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center gap-1">
                    <UBadge
                      v-if="usage.isPrimary"
                      variant="soft"
                      color="primary"
                      size="xs"
                    >
                      Primary
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-else class="text-sm text-dimmed">
            Not currently used by a dish.
          </p>
        </div>
      </UCard>

      <div class="grid gap-3 md:grid-cols-2">
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
            <div class="text-sm font-medium text-highlighted">Controls</div>
            <p class="text-xs text-dimmed">
              Publishing, visibility, and training controls will live here.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '../../../../models/recipe.model'
import type { KitchenRecipeDishUsage } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'

const props = withDefaults(
  defineProps<{
    recipe: Recipe | null
    dishUsage?: KitchenRecipeDishUsage[]
  }>(),
  {
    dishUsage: () => [],
  }
)

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

const yieldLabel = computed(() =>
  props.recipe?.yield_qty
    ? `${props.recipe.yield_qty} ${props.recipe.yield_unit || 'portion'}`
    : 'Not set'
)

const ingredientLines = computed(() =>
  Array.isArray(props.recipe?.ingredient_lines)
    ? props.recipe.ingredient_lines.map((line) => ({
        id: String(line.id || line.ingredient_id || line.ingredient_name),
        ingredientName: String(line.ingredient_name || 'Ingredient'),
        quantityLabel: [line.quantity, line.unit].filter(Boolean).join(' '),
        prepNote: String(line.prep_note || '').trim(),
      }))
    : []
)

const methodSteps = computed(() =>
  Array.isArray(props.recipe?.steps)
    ? [...props.recipe.steps]
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map((step, index) => ({
          id: String(step.id || index),
          order: Number(step.order || index + 1),
          title: String(step.title || '').trim(),
          instruction: String(step.instruction || '').trim(),
          minutes: Number(step.minutes || 0),
        }))
    : []
)

const dishUsageSorted = computed(() =>
  [...props.dishUsage].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
    return a.dishName.localeCompare(b.dishName)
  })
)
</script>
