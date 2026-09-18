<template>
  <div class="mx-auto w-full max-w-xl space-y-6">
    <div class="flex flex-wrap gap-2">
      <UButton
        to="/workspace/kitchen/food/ingredients"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to kitchen ingredients
      </UButton>
    </div>

    <MoleculesStateCard
      v-if="loadError"
      state="error"
      title="Ingredient unavailable"
      description="Ingredient details could not be loaded. Please try again."
    />

    <UAlert
      v-else-if="pending"
      color="neutral"
      variant="soft"
      title="Loading ingredient"
    />

    <WorkspaceKitchenIngredientsPreview
      v-else-if="ingredient && !ingredient.missing_root_ingredient"
      :ingredient="ingredient"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Ingredient not found"
      :description="`No ingredient was found for ${ingredientId || 'this route'}.`"
    />

    <DevDebugPanel
      title="Kitchen ingredient detail"
      scope="workspace"
      object-origin="fetched"
      :objects="{ ingredient }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIngredient } from '../../../composables/workspace/ingredients/useKitchenWorkspaceIngredient'
const { ingredient, ingredientId, pending, loadError, debug } =
  useKitchenWorkspaceIngredient()
</script>
