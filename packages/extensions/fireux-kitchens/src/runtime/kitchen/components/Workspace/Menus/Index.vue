<template>
  <div v-if="kitchenId" class="grid gap-4">
    <WorkspaceKitchenMenusRoles />

    <WorkspaceKitchenMenusList />

    <WorkspaceKitchenMenusDebug />
  </div>

  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Select a kitchen"
    description="Choose a kitchen before managing menus."
  />
</template>

<script setup lang="ts">
import { useKitchenMenusWorkspace } from '../../../composables/workspace/Menus/useKitchenMenusWorkspace'

const { kitchenId } = useKitchenMenusWorkspace()
</script>
