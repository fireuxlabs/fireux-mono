<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Recipes</h2>
            <p>Browse recipes for the selected kitchen.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <div v-if="cards.length" class="space-y-3">
        <RecipeCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No recipes found.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen recipes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecipeInterface } from '../../../../../composables/fireux/firestore/recipe/utils/view/useRecipeInterface'
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/console/kitchen/operations/Recipes/useKitchenConsoleRecipes'

const { recipes, debug } = useKitchenConsoleRecipes()
const { cell } = useRecipeInterface()
const cards = computed(() =>
  recipes.value
    .map((recipe) => cell(recipe))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
