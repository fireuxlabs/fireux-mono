<template>
  <section class="recipe-detail">
    <div class="recipe-detail-heading">
      <UButton
        to="/workspace/kitchen/food/recipes"
        label="Recipes"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      /><UButton
        v-if="recipe && canWrite"
        :label="editing ? 'Cancel' : 'Edit recipe'"
        :icon="editing ? 'i-lucide-x' : 'i-lucide-pencil'"
        color="neutral"
        variant="soft"
        @click="editing = !editing"
      />
    </div>
    <MoleculesStateCard
      v-if="error"
      state="error"
      title="Recipe unavailable"
      :description="String(error)"
    />
    <template v-else-if="recipe">
      <WorkspaceKitchenRecipesForm
        v-if="editing"
        :key="recipe.id"
        :recipe="recipe"
        :kitchen-id="kitchenId"
        :root-collection="rootCollection"
        :database-id="databaseId"
        :can-write="canWrite"
        @saved="editing = false"
      />
      <template v-else
        ><h1>{{ recipe.name }}</h1>
        <WorkspaceKitchenRecipesPreparation
          :recipe="recipe"
          :ingredient-names="ingredientNames"
          :prep-item-names="prepItemNames"
          :prep-items="prepItems"
      /></template>
      <div v-if="canWrite && !editing" class="recipe-delete">
        <UButton
          label="Delete recipe"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          :loading="deleting"
          @click="deleteSelectedRecipe"
        />
      </div>
    </template>
    <USkeleton v-else-if="pending" class="h-64" />
    <UAlert v-else title="Recipe not found" color="neutral" variant="soft" />
    <DevDebugPanel
      launcher
      title="Kitchen recipe"
      object-origin="fetched"
      :objects="{ recipe }"
      :derived="debug"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenPrepItems } from '../../../composables/prep-item/useKitchenPrepItems'
import { navigateTo } from '#imports'
import { computed, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceRecipe } from '../../../composables/workspace/recipes/useKitchenWorkspaceRecipe'
import { useRecipeDelete } from '../../../composables/recipe/useRecipeDelete'
import { useKitchenIngredients } from '../../../composables/workspace/ingredients/useKitchenIngredients'
const {
  recipe,
  recipeId,
  kitchenId,
  rootCollection,
  databaseId,
  dishUsage,
  pending,
  canWrite,
  debug,
  error,
} = useKitchenWorkspaceRecipe()
const { ingredients } = useKitchenIngredients(kitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const { prepItems } = useKitchenPrepItems(kitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const prepItemNames = computed(() =>
  Object.fromEntries(prepItems.value.map((item) => [item.id, item.name]))
)
const ingredientNames = computed(() =>
  Object.fromEntries(
    ingredients.value.map((item) => [
      item.ingredient_id,
      item.name || item.ingredient_id,
    ])
  )
)
const editing = ref(false)
const deleting = ref(false)
const toast = useToastify()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const { deleteRecipe } = useRecipeDelete({
  databaseId,
  kitchenCollectionPath: rootCollection,
})
watch([kitchenId, recipeId], () => {
  editing.value = false
})
const deleteSelectedRecipe = async () => {
  if (!canWrite.value || !recipe.value || deleting.value) return

  const title = normalizeString(recipe.value.name || recipeId.value)
  const usageCount = dishUsage.value.length
  const usageNote = usageCount
    ? `\n\n${usageCount} dish record${usageCount === 1 ? '' : 's'} reference this recipe. This delete will not cascade.`
    : ''
  const ok = window.confirm(
    `Delete recipe "${title}"?\n\nThis will only delete the recipe document.${usageNote}`
  )
  if (!ok) return

  deleting.value = true

  try {
    await deleteRecipe(recipeId.value, { kitchenId: kitchenId.value })
    toast.add({ title: 'Recipe deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/workspace/kitchen/food/recipes')
  } catch (error) {
    const message = String(
      (error as any)?.message || error || 'Failed to delete recipe'
    )
    toast.add({
      title: 'Recipe delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    deleting.value = false
  }
}
</script>
<style scoped>
.recipe-detail {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 28px;
}
.recipe-detail-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h1 {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.recipe-delete {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--ui-border);
}
</style>
