<template>
  <UCard v-if="dish">
    <div class="space-y-6">
      <div class="flex flex-col gap-5 md:flex-row md:items-start">
        <div
          class="h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40 md:h-40 md:w-40"
          style="width: 128px; height: 128px; max-width: 128px; max-height: 128px;"
        >
          <img
            v-if="dish.image_url"
            :src="dish.image_url"
            :alt="dish.name || dish.short_name || 'Dish image'"
            class="h-full w-full object-cover"
            style="width: 100%; height: 100%; object-fit: cover;"
            loading="lazy"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-dimmed"
          >
            <UIcon name="i-lucide-utensils" class="size-6" />
          </div>
        </div>

        <div class="min-w-0 flex-1 space-y-5">
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

          <div class="grid gap-3 md:grid-cols-2">
            <UCard variant="soft">
              <div class="space-y-3">
                <div class="text-sm font-medium text-highlighted">
                  Components
                </div>
                <ol v-if="components.length" class="space-y-1 text-sm">
                  <li
                    v-for="(component, index) in components"
                    :key="`${index}:${component}`"
                    class="flex gap-2"
                  >
                    <span class="w-5 shrink-0 text-xs font-medium text-dimmed">
                      {{ index + 1 }}.
                    </span>
                    <span class="min-w-0 text-highlighted">{{ component }}</span>
                  </li>
                </ol>
                <p v-else class="text-xs text-dimmed">
                  Components not set.
                </p>
              </div>
            </UCard>

            <UCard variant="soft">
              <div class="space-y-3">
                <div class="text-sm font-medium text-highlighted">Build</div>
                <ol v-if="build.length" class="space-y-1 text-sm">
                  <li
                    v-for="(step, index) in build"
                    :key="`${index}:${step}`"
                    class="flex gap-2"
                  >
                    <span class="w-5 shrink-0 text-xs font-medium text-dimmed">
                      {{ index + 1 }}.
                    </span>
                    <span class="min-w-0 text-highlighted">{{ step }}</span>
                  </li>
                </ol>
                <p v-else class="text-xs text-dimmed">
                  Build not set.
                </p>
              </div>
            </UCard>
          </div>

          <UCard v-if="subRecipes.length" variant="soft">
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium text-highlighted">
                  Sub-recipes
                </div>
                <p class="text-xs text-dimmed">
                  Prep recipes used inside this dish.
                </p>
              </div>

              <div class="flex flex-wrap gap-1.5">
                <UButton
                  v-for="recipeId in subRecipes"
                  :key="recipeId"
                  :to="`/console/kitchen/recipes/${encodeURIComponent(recipeId)}`"
                  size="xs"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-book-open-check"
                >
                  {{ subRecipeLabel(recipeId) }}
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard variant="soft">
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium text-highlighted">Menu usage</div>
                <p class="text-xs text-dimmed">
                  Where this dish is currently sold.
                </p>
              </div>

              <div v-if="menuUsageSorted.length" class="space-y-2">
                <div
                  v-for="usage in menuUsageSorted"
                  :key="usageKey(usage)"
                  class="pill"
                >
                  <div class="flex min-w-0 items-start gap-2">
                    <UChip
                      :color="usage.active ? 'success' : 'error'"
                      inset
                      class="mt-1 shrink-0"
                    />
                    <div class="min-w-0 flex-1 space-y-1">
                      <p class="truncate text-sm font-medium text-highlighted">
                        {{ usage.menuName || usage.menuId || 'Untitled menu' }}
                      </p>
                      <p class="truncate text-xs text-toned">
                        {{ usage.sectionLabel || 'Unsectioned' }}
                      </p>
                    </div>
                  </div>

                  <UBadge
                    variant="soft"
                    color="neutral"
                    size="xs"
                    class="shrink-0"
                  >
                    {{ formatPrice(usage.priceMinor, usage.currencyCode) }}
                  </UBadge>
                </div>
              </div>

              <p v-else class="text-sm text-dimmed">
                Not currently on a menu.
              </p>
            </div>
          </UCard>

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
                <div class="text-sm font-medium text-highlighted">
                  Kitchen build
                </div>
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
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { KitchenDishMenuUsage } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const props = withDefaults(
  defineProps<{
    dish: Dish | null
    menuUsage?: KitchenDishMenuUsage[]
  }>(),
  {
    menuUsage: () => [],
  }
)

const recipeCount = computed(() =>
  Array.isArray(props.dish?.recipe_ids) ? props.dish.recipe_ids.length : 0
)

const ingredientCount = computed(() =>
  Array.isArray(props.dish?.ingredient_ids) ? props.dish.ingredient_ids.length : 0
)

const miseCount = computed(() =>
  Array.isArray(props.dish?.mise_ids) ? props.dish.mise_ids.length : 0
)

const stringList = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => String(entry ?? '').trim()).filter(Boolean)
    : []

const components = computed(() =>
  stringList((props.dish as { components?: unknown } | null)?.components)
)

const build = computed(() =>
  stringList((props.dish as { build?: unknown } | null)?.build)
)

const subRecipes = computed(() =>
  stringList((props.dish as { sub_recipe_ids?: unknown } | null)?.sub_recipe_ids)
)

const subRecipeLabel = (recipeId: string) =>
  recipeId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')

const menuUsageSorted = computed(() =>
  [...props.menuUsage].sort((a, b) => {
    if (a.menuName !== b.menuName) return a.menuName.localeCompare(b.menuName)
    if (a.sectionLabel !== b.sectionLabel) {
      return a.sectionLabel.localeCompare(b.sectionLabel)
    }
    return a.itemLabel.localeCompare(b.itemLabel)
  })
)

const usageKey = (usage: KitchenDishMenuUsage) =>
  [usage.menuId, usage.sectionId, usage.itemId, usage.itemLabel].join(':')

const formatPrice = (valueMinor: number, currencyCode?: string) => {
  const normalizedCurrency = String(currencyCode || 'CHF').trim().toUpperCase()
  const currency = /^[A-Z]{3}$/.test(normalizedCurrency)
    ? normalizedCurrency
    : 'CHF'

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(valueMinor || 0) / 100)
}
</script>
