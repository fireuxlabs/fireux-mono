<template>
  <div class="space-y-6">
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
        <NuxtLink
          v-for="card in recipeCards"
          :key="card.id"
          :to="card.to"
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
              <p class="truncate text-sm font-medium text-default">
                {{ card.title }}
              </p>
              <p v-if="card.subtitle" class="truncate text-xs text-dimmed">
                {{ card.subtitle }}
              </p>
              <p v-if="card.summary" class="text-xs text-dimmed">
                {{ card.summary }}
              </p>
              <div
                v-if="card.badges.length"
                class="flex flex-wrap items-center gap-1"
              >
                <UBadge
                  v-for="badge in card.badges"
                  :key="badge"
                  variant="soft"
                  color="neutral"
                  size="xs"
                >
                  {{ badge }}
                </UBadge>
                <UBadge
                  v-if="dishUsageCount(card.id)"
                  variant="soft"
                  color="primary"
                  size="xs"
                >
                  {{ dishUsageCount(card.id) }}
                  {{ dishUsageCount(card.id) === 1 ? 'dish' : 'dishes' }}
                </UBadge>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <p v-else class="text-sm text-dimmed">No recipes found.</p>
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen recipes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'
import { useRecipeInterface } from '../../../../../composables/fireux/firestore/runtime-kitchen/recipe/utils/view/useRecipeInterface'

type RecipeCard = NonNullable<
  ReturnType<ReturnType<typeof useRecipeInterface>['pill']>
>

const { pill } = useRecipeInterface()
const { recipes, dishUsageByRecipeId, debug } = useKitchenConsoleRecipes()
const recipeCards = computed<RecipeCard[]>(() =>
  recipes.value
    .map((recipe) => pill(recipe))
    .filter((card): card is RecipeCard => Boolean(card))
)
const dishUsageCount = (recipeId: string) =>
  (dishUsageByRecipeId.value[recipeId] || []).length
const isDev = import.meta.dev
</script>
