<template>
  <ConsoleKitchenChildLayout
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '../../../../../models/recipe.model'
import { useRecipeInterface } from '../../../../../composables/fireux/firestore/runtime-kitchen/recipe/utils/view/useRecipeInterface'

type RecipeCard = NonNullable<ReturnType<ReturnType<typeof useRecipeInterface>['pill']>>

const props = defineProps<{
  recipes: Recipe[]
  pending: boolean
}>()

const { pill } = useRecipeInterface()
const countLabel = computed(() => String(props.recipes.length))
const recipeCards = computed<RecipeCard[]>(() =>
  props.recipes
    .map((recipe) => pill(recipe))
    .filter((card): card is RecipeCard => Boolean(card))
)
</script>
