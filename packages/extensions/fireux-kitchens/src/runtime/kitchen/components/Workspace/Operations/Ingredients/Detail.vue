<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-2">
      <UButton
        to="/workspace/kitchen/ingredients"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to kitchen ingredients
      </UButton>

      <UButton
        v-if="rootIngredientPath"
        :to="rootIngredientPath"
        color="neutral"
        variant="soft"
        icon="i-lucide-library"
        size="sm"
      >
        View root ingredient
      </UButton>
    </div>

    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      title="Ingredient details could not be loaded"
      description="The Kitchen link is still intact, but its shared Ingredient details are temporarily unavailable."
    />

    <UAlert
      v-else-if="pending"
      color="neutral"
      variant="soft"
      title="Loading ingredient"
      description="Fetching the selected Kitchen Ingredient and its shared identity."
    />

    <IngredientProfile v-else-if="profile" :model="profile" />

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
import { computed } from 'vue'
import { useKitchenWorkspaceIngredient } from '../../../../composables/workspace/operations/Ingredients/useKitchenWorkspaceIngredient'
import { useIngredientInterface } from '../../../../../ingredient/composables/useIngredientInterface'
import IngredientProfile from '../../../../../ingredient/components/Cards/Profile.vue'

const { profile: makeProfile } = useIngredientInterface()
const {
  ingredient,
  ingredientId,
  pending,
  loadError,
  debug,
} = useKitchenWorkspaceIngredient()
const profile = computed(() => makeProfile(ingredient.value))
const rootIngredientPath = computed(() => {
  const id = String(
    ingredient.value?.ingredient_id ||
    ingredient.value?.id ||
    ingredientId.value ||
    ''
  ).trim()

  return id ? `/ingredients/${encodeURIComponent(id)}` : ''
})
</script>
