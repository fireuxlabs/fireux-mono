<template>
  <WorkspacePageHeader
    title="Ingredients"
    description="Manage the ingredients your kitchen uses in prep."
    variant="child"
  >
    <template #actions>
      <UButton
        v-if="canWrite"
        label="Add ingredient"
        icon="i-lucide-plus"
        @click="addOpen = true"
      />
    </template>
  </WorkspacePageHeader>
  <Ingredients.Controls v-if="storageKitchenId && !pending && !loadError" />
  <Ingredients.Collection />
  <Ingredients.Create
    v-if="storageKitchenId"
    v-model:open="addOpen"
    :can-write="canWrite"
  />
  <Ingredients.Ai v-if="storageKitchenId" />
  <FireDiagnosticsDebugPanel
    v-if="storageKitchenId"
    title="Kitchen ingredients"
    scope="workspace"
    object-origin="fetched"
    :objects="{ ingredients }"
    :derived="debug"
  />
</template>

<script setup lang="ts">
import * as Ingredients from './index'
import { provideKitchenWorkspacePrepIngredients } from '../../../../composables/workspace/prep/ingredients/state'
import { provideIngredientCatalogue } from './useCatalogue'

const workspace = provideKitchenWorkspacePrepIngredients()
const { storageKitchenId, pending, loadError, canWrite, ingredients, debug } =
  workspace
const { addOpen } = provideIngredientCatalogue(workspace)
</script>
