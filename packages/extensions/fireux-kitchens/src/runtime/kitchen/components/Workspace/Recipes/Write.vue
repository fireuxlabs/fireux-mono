<template>
  <WorkspaceKitchenRecipesForm
    :kitchen-id="kitchenId"
    :can-write="canWrite"
    :root-collection="rootCollection"
    :database-id="databaseId"
    @saved="onSaved"
  />
</template>
<script setup lang="ts">
import { navigateTo } from '#imports'
import { useKitchenRecipesContext } from '../../../composables/workspace/recipes/useKitchenRecipesContext'
const { kitchenId, canWrite, rootCollection, databaseId } =
  useKitchenRecipesContext()
const onSaved = (id: string) =>
  navigateTo(`/workspace/kitchen/food/recipes/${encodeURIComponent(id)}`)
</script>
