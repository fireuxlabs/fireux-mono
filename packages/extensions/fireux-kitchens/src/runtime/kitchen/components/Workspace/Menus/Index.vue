<template>
  <section v-if="kitchenId" class="workspace-surface">
    <WorkspaceKitchenMenusCrud />

    <WorkspaceKitchenMenusRoles />

    <WorkspaceKitchenMenusList />

    <WorkspaceKitchenMenusDebug />
  </section>

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
import WorkspaceKitchenMenusCrud from './Crud.vue'

const { kitchenId } = useKitchenMenusWorkspace()
</script>
