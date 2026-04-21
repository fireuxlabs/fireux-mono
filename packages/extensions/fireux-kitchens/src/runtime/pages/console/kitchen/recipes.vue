<template>
  <UDashboardPanel id="console-kitchen-recipes">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Recipes" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen recipes."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleKitchenChildLayout
          v-else
          description="Selected kitchen and recipe collection in scope."
          item-label="Recipes"
          :item-count="countLabel"
          :pending="pending"
          pending-title="Loading recipes"
          pending-description="Fetching recipes for the selected kitchen."
        >
          <UCard>
            <template #header>
              <div class="console-card-header">
                <div class="console-card-header__title">Recipes</div>
                <p class="console-card-header__description">
                  Browse recipes for the selected kitchen.
                </p>
              </div>
            </template>

            <div v-if="recipeCards.length" class="space-y-2">
              <div
                v-for="card in recipeCards"
                :key="card.id"
                class="rounded-lg border border-default p-3"
              >
                <div class="flex items-start gap-3">
                  <UAvatar
                    :src="card.imageUrl || undefined"
                    :alt="card.title || ''"
                    :text="card.title || undefined"
                    icon="i-lucide-book-open"
                    size="sm"
                  />

                  <div class="min-w-0 flex-1 space-y-1">
                    <p class="truncate text-sm font-medium text-default">{{ card.title }}</p>
                    <p v-if="card.subtitle" class="truncate text-xs text-dimmed">{{ card.subtitle }}</p>
                    <p v-if="card.summary" class="text-xs text-dimmed">{{ card.summary }}</p>
                    <div v-if="card.badges.length" class="flex flex-wrap items-center gap-1">
                      <UBadge
                        v-for="badge in card.badges"
                        :key="badge"
                        variant="soft"
                        color="neutral"
                        size="xs"
                      >
                        {{ badge }}
                      </UBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-dimmed">No recipes found.</p>
          </UCard>
        </ConsoleKitchenChildLayout>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleChildFocus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleChildFocus'
import { useKitchenRecipeCollection } from '../../../composables/fireux/firestore/runtime-kitchen/recipe/fetch/useKitchenRecipeCollection'
import { useRecipeInterface } from '../../../composables/fireux/firestore/runtime-kitchen/recipe/utils/view/useRecipeInterface'

type RecipeCard = NonNullable<ReturnType<ReturnType<typeof useRecipeInterface>['pill']>>

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-copy',
    position: 'top',
    requiresSelection: true,
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen, kitchenId } = useKitchenConsoleChildFocus()
const { recipes, count, pending } = useKitchenRecipeCollection(kitchenId)
const { pill } = useRecipeInterface()
const countLabel = computed(() => String(count.value))
const recipeCards = computed<RecipeCard[]>(() =>
  recipes.value
    .map((recipe) => pill(recipe))
    .filter((card): card is RecipeCard => Boolean(card))
)
</script>
