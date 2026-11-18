<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="promotions"
  >
    <KitchenWorkspaceMenuSummary :overview="overview" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuPromotionsOverview } from './useOverview'

const { overview } = useKitchenWorkspaceMenuPromotionsOverview()
</script>
