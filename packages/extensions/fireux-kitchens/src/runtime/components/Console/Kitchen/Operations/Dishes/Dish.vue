<template>
  <section class="console-surface">
    <UBreadcrumb :items="breadcrumbItems" />

    <UAlert
      v-if="!dish"
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading dish' : 'Dish not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen dish.'
          : `No dish was found for ${dishId || 'this route'}.`
      "
    />

    <template v-else>
      <ConsoleKitchenOperationsDishesCardsProfile :dish="dish" />

      <div
        v-if="menuPlacements.length"
        class="flex flex-wrap gap-2"
        aria-label="Menu placements"
      >
        <UBadge
          v-for="placement in menuPlacements"
          :key="placement.key"
          color="neutral"
          variant="soft"
        >
          {{ placement.label }}
        </UBadge>
      </div>

      <ConsoleKitchenOperationsDishesFinance
        :finance="finance"
        :pending="financePending"
        :error="financeError"
      />

      <UCard v-if="dishSpec">
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                Spec
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge color="neutral" variant="soft">
                {{ dishSpec.station }}
              </UBadge>
              <UBadge
                v-if="dishSpec.portion"
                color="neutral"
                variant="soft"
              >
                {{ dishSpec.portion }} portion
              </UBadge>
            </div>
          </div>
        </template>

        <p class="text-sm text-toned">
          {{ dishSpec.summary }}
        </p>

        <div v-if="componentViews.length" class="mt-5">
          <h2 class="text-sm font-semibold text-highlighted">
            Components
          </h2>
          <ul class="mt-2 grid gap-2 sm:grid-cols-2">
            <li
              v-for="component in componentViews"
              :key="component.id"
              class="flex items-start justify-between gap-3 rounded-lg border border-default bg-elevated/30 p-3"
            >
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  {{ component.name }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  {{ component.sourceLabel }}
                </p>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ component.amount }}
              </UBadge>
            </li>
          </ul>
        </div>

        <div v-if="dishSpec.assembly.length" class="mt-5">
          <h2 class="text-sm font-semibold text-highlighted">
            Assembly
          </h2>
          <ol class="mt-2 grid gap-3">
            <li
              v-for="(step, index) in dishSpec.assembly"
              :key="step"
              class="flex gap-3 text-sm text-toned"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              >
                {{ Number(index) + 1 }}
              </span>
              <span class="pt-0.5">{{ step }}</span>
            </li>
          </ol>
        </div>
      </UCard>

      <div
        v-if="prepItems.length || recipes.length || miseRequirements.length"
        class="grid gap-4 lg:grid-cols-2"
      >
        <UCard v-for="prepItem in prepItems" :key="prepItem.id">
          <template #header>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                  Prep item
                </p>
                <h2 class="mt-1 text-base font-semibold text-highlighted">
                  {{ prepItem.name }}
                </h2>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ prepItem.station }}
              </UBadge>
            </div>
          </template>

          <dl class="grid gap-2 text-sm">
            <div class="flex items-start justify-between gap-3">
              <dt class="text-muted">
                Input
              </dt>
              <dd class="text-right text-toned">
                {{ formatRecipeIngredient(prepItem.input) }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-3">
              <dt class="text-muted">
                Yield
              </dt>
              <dd class="text-right text-toned">
                {{ formatProductionAmount(prepItem.yield) }}
              </dd>
            </div>
          </dl>

          <ol class="mt-4 grid gap-1 text-sm text-toned">
            <li v-for="methodStep in prepItem.method" :key="methodStep">
              {{ methodStep }}
            </li>
          </ol>
        </UCard>

        <UCard v-for="recipe in recipes" :key="recipe.id">
          <template #header>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                Recipe
              </p>
              <h2 class="mt-1 text-base font-semibold text-highlighted">
                {{ recipe.name }}
              </h2>
              <p class="mt-1 text-xs text-muted">
                Yield · {{ formatProductionAmount(recipe.yield) }}
              </p>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 class="text-sm font-semibold text-highlighted">
                Ingredients
              </h3>
              <ul class="mt-2 grid gap-1 text-sm text-toned">
                <li
                  v-for="ingredient in recipe.ingredients"
                  :key="`${ingredient.ingredientId}:${ingredient.quantity}:${ingredient.unit}`"
                >
                  {{ formatRecipeIngredient(ingredient) }}
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-highlighted">
                Method
              </h3>
              <ol class="mt-2 grid gap-1 text-sm text-toned">
                <li v-for="methodStep in recipe.method" :key="methodStep">
                  {{ methodStep }}
                </li>
              </ol>
            </div>
          </div>
        </UCard>

        <UCard v-if="miseRequirements.length">
          <template #header>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                Mise en place
              </p>
            </div>
          </template>

          <div class="grid gap-3">
            <div
              v-for="requirement in miseRequirements"
              :key="requirement.id"
              class="flex items-start justify-between gap-3 rounded-lg border border-default bg-elevated/30 p-3"
            >
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  {{ requirement.title }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  {{ requirement.station }}
                </p>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ formatProductionAmount(requirement.amount) }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <template v-if="canWrite">
        <ConsoleKitchenOperationsDishesEdit />
        <ConsoleKitchenOperationsDishesDelete />
      </template>
    </template>

    <DevFireuxDebugPanel
      title="Kitchen dish detail"
      scope="console"
      :data="fireuxDebugData"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDish'

const {
  dish,
  dishId,
  pending,
  canWrite,
  dishSpec,
  componentViews,
  prepItems,
  recipes,
  formatProductionAmount,
  getIngredientName,
  miseRequirements,
  menuUsage,
  finance,
  financePending,
  financeError,
  debug,
} = useKitchenConsoleDish()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const formatRecipeIngredient = (ingredient: {
  ingredientId: string
  quantity: number
  unit: string
  preparation?: string
}) => {
  const preparation = normalizeString(ingredient.preparation)
  return [
    formatProductionAmount(ingredient),
    getIngredientName(ingredient.ingredientId),
    preparation ? `(${preparation})` : '',
  ].filter(Boolean).join(' ')
}
const menuPlacements = computed(() =>
  menuUsage.value.map((usage) => {
    const price = Number(usage.price)
    const priceLabel = Number.isFinite(price) && price > 0
      ? new Intl.NumberFormat('en-CH', {
          style: 'currency',
          currency: normalizeString(usage.currencyCode) || 'CHF',
          maximumFractionDigits: 2,
        }).format(price)
      : ''
    const parts = [
      normalizeString(usage.menuName),
      normalizeString(usage.sectionLabel),
      priceLabel,
    ].filter(Boolean)

    return {
      key: `${usage.menuId}:${usage.sectionId}:${usage.itemId}`,
      label: parts.join(' · '),
    }
  })
)
const breadcrumbItems = computed(() => [
  {
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    to: '/console/kitchen/dishes',
  },
  {
    label: normalizeString(dish.value?.name) || 'Dish details',
    icon: 'i-lucide-circle-dot',
  },
])

const fireuxDebugData = computed(() => ({
  ...debug.value,
  dish: dish.value,
}))
</script>
