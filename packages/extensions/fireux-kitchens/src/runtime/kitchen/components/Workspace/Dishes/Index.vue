<template>
  <section class="workspace-surface">
    <div v-if="kitchenId" class="space-y-4">
      <WorkspaceKitchenDishesCrud />
      <WorkspaceKitchenDishesRead />
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
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
import WorkspaceKitchenDishesRead from './Read.vue'
import WorkspaceKitchenDishesCrud from './Crud.vue'

const { kitchenId, catalogue } = useKitchenDishesContext()
</script>
