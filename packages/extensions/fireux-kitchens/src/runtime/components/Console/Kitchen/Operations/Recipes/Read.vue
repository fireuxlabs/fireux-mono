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

      <p v-if="pending" class="text-sm text-dimmed">
        Loading recipes...
      </p>

      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Recipes unavailable"
        description="The recipes for this kitchen could not be loaded. Please try again."
      />

      <div v-else-if="cards.length" class="space-y-3">
        <ConsoleKitchenOperationsRecipesCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
          :data-service-state="
            isRecipeInService(card.id) ? 'active' : 'inactive'
          "
          :class="
            isRecipeInService(card.id)
              ? ''
              : 'opacity-45 saturate-50'
          "
        />
      </div>

      <p v-else-if="outcome === 'empty'" class="text-sm text-dimmed">
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
import { useRecipeInterface } from '../../../../../composables/fireux/recipe/useRecipeInterface'
import { useKitchenRecipesWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Recipes/useKitchenRecipesWorkspace'

const {
  recipes,
  pending,
  error,
  outcome,
  debug,
  isRecipeInService,
} = useKitchenRecipesWorkspace()
const { cell } = useRecipeInterface()
const cards = computed(() =>
  recipes.value
    .map((recipe) => cell(recipe))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
