<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="promotions"
  >
    <KitchenWorkspaceMenuSummary :summary="summary" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuPromotions } from '../../../../composables/workspace/menu/promotions'
const { summary } = useKitchenWorkspaceMenuPromotions()
</script>
