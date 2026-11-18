<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="items"
  >
    <KitchenWorkspaceMenuSummary :summary="summary" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuItems } from '../../../../composables/workspace/menu/items'
const { summary } = useKitchenWorkspaceMenuItems()
</script>
