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

      <p v-if="pending" class="text-sm text-dimmed">Loading recipes...</p>

      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Recipes unavailable"
        description="The recipes for this kitchen could not be loaded. Please try again."
      />

      <div v-else-if="cards.length" class="space-y-3">
        <WorkspaceKitchenOperationsRecipesCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
          data-service-state="active"
        />
      </div>

      <p v-else-if="outcome === 'empty'" class="text-sm text-dimmed">
        No recipes found.
      </p>
    </UCard>

    <DevDebugPanel
      title="Kitchen recipes"
      scope="workspace"
      object-origin="fetched"
      :objects="{ recipes }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecipeInterface } from '../../../../composables/recipe/useRecipeInterface'
import { useKitchenRecipesWorkspace } from '../../../../composables/workspace/operations/Recipes/useKitchenRecipesWorkspace'

const { recipes, pending, error, outcome, debug } = useKitchenRecipesWorkspace()
const { cell } = useRecipeInterface()
const cards = computed(() =>
  recipes.value
    .map((recipe) => cell(recipe))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
