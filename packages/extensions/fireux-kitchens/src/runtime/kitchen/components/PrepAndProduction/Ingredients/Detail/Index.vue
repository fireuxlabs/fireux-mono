<template>
  <div class="mx-auto w-full max-w-xl space-y-6 workspace-surface">
    <div class="flex flex-wrap gap-2">
      <UButton
        to="/workspace/kitchen/prep/ingredients"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to kitchen ingredients
      </UButton>
    </div>

    <UAlert
      v-if="outcome === 'idle' || outcome === 'empty'"
      color="neutral"
      title="Select a kitchen"
      description="Choose a Kitchen before viewing its ingredients."
    />

    <MoleculesStateCard
      v-else-if="loadError"
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

    <KitchenPrepAndProductionIngredientsPreview
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

    <DiagnosticsDebugPanel
      title="Kitchen ingredient detail"
      scope="workspace"
      object-origin="fetched"
      :objects="{ ingredient }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIngredient } from '../../../../composables/workspace/ingredients/useKitchenWorkspaceIngredient'
import { ref, watch } from 'vue'
import { navigateTo } from '#imports'
import { useKitchenIngredientSelection } from '../../../../composables/workspace/ingredients/useKitchenIngredientSelection'
const {
  ingredient,
  ingredientId,
  kitchenId,
  canWrite,
  pending,
  outcome,
  loadError,
  debug,
} = useKitchenWorkspaceIngredient()
const deleteOpen = ref(false)
const deleting = ref(false)
const deleteError = ref('')
const { unselectIngredient, captureIntent, authorityEpoch } =
  useKitchenIngredientSelection([ingredientId, deleteOpen])
watch(
  deleteOpen,
  () => {
    deleting.value = false
    deleteError.value = ''
  },
  { flush: 'sync' }
)
watch(
  [authorityEpoch, ingredientId],
  () => {
    deleting.value = false
    deleteOpen.value = false
    deleteError.value = ''
  },
  { flush: 'sync' }
)
watch(
  canWrite,
  (allowed) => {
    if (!allowed && !deleting.value) {
      deleteOpen.value = false
      deleteError.value = ''
    }
  },
  { flush: 'sync' }
)
async function removeIngredient() {
  if (!canWrite.value || deleting.value || !ingredient.value) return
  const isCurrent = captureIntent()
  const selectedKitchen = kitchenId.value
  const selectedIngredient = ingredientId.value
  deleting.value = true
  deleteError.value = ''
  try {
    await unselectIngredient(selectedKitchen, selectedIngredient, {
      kitchenCollectionPath: 'kitchens',
    })
    if (
      isCurrent() &&
      kitchenId.value === selectedKitchen &&
      ingredientId.value === selectedIngredient
    ) {
      deleteOpen.value = false
      await navigateTo('/workspace/kitchen/prep/ingredients')
    }
  } catch (error: any) {
    if (!isCurrent()) return
    deleteError.value =
      error?.data?.statusMessage ||
      error?.message ||
      'Could not remove ingredient.'
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
</script>
