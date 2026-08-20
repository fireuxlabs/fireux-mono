<template>
  <section class="workspace-surface">
    <div v-if="kitchenId" class="space-y-4">
      <WorkspaceKitchenOperationsDishesRead />

      <WorkspaceKitchenOperationsDishesTools />
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      :description="`Choose a kitchen before managing ${catalogue.plural}.`"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../../composables/workspace/operations/Dishes/useKitchenDishesWorkspace'
import WorkspaceKitchenOperationsDishesRead from './Read.vue'
import WorkspaceKitchenOperationsDishesTools from './Tools.vue'

const {
  kitchenId,
  catalogue,
} = useKitchenDishesWorkspace()
</script>
