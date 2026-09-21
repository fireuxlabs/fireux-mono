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

    <UButton
      v-if="ingredient && canWrite && !pending && !loadError"
      label="Delete Ingredient"
      icon="i-lucide-trash-2"
      color="error"
      variant="soft"
      @click="deleteOpen = true"
    />
    <UModal
      v-model:open="deleteOpen"
      title="Remove from this Kitchen?"
      description="The shared ingredient and other Kitchens stay unchanged. Ingredients still in use cannot be removed."
    >
      <template #body>
        <p class="font-medium">{{ ingredient?.name }}</p>
        <MoleculesStateCard
          v-if="deleteError"
          state="error"
          title="Ingredient not removed"
          :description="deleteError"
        />
      </template>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="deleting"
            @click="deleteOpen = false"
          />
          <UButton
            label="Remove from Kitchen"
            color="error"
            :loading="deleting"
            :disabled="!canWrite"
            @click="removeIngredient"
          />
        </div>
      </template>
    </UModal>

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
import { ref, watch } from 'vue'
import { navigateTo } from '#imports'
import { useKitchenIngredientSelection } from '../../../composables/workspace/ingredients/useKitchenIngredientSelection'
const {
  ingredient,
  ingredientId,
  kitchenId,
  canWrite,
  pending,
  loadError,
  debug,
} = useKitchenWorkspaceIngredient()
const { unselectIngredient } = useKitchenIngredientSelection()
const deleteOpen = ref(false)
const deleting = ref(false)
const deleteError = ref('')
watch([kitchenId, ingredientId, canWrite], () => {
  deleteOpen.value = false
  deleteError.value = ''
})
async function removeIngredient() {
  if (!canWrite.value || deleting.value || !ingredient.value) return
  const selectedKitchen = kitchenId.value
  const selectedIngredient = ingredientId.value
  deleting.value = true
  deleteError.value = ''
  try {
    await unselectIngredient(selectedKitchen, selectedIngredient, {
      kitchenCollectionPath: 'kitchens',
    })
    if (
      kitchenId.value === selectedKitchen &&
      ingredientId.value === selectedIngredient
    ) {
      deleteOpen.value = false
      await navigateTo('/workspace/kitchen/food/ingredients')
    }
  } catch (error: any) {
    deleteError.value =
      error?.data?.statusMessage ||
      error?.message ||
      'Could not remove ingredient.'
  } finally {
    deleting.value = false
  }
}
</script>
