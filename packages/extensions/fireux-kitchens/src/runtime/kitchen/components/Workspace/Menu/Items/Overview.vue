<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="items"
  >
    <KitchenWorkspaceMenuSummary :overview="overview" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuItemsOverview } from './useOverview'

const { overview } = useKitchenWorkspaceMenuItemsOverview()
</script>
