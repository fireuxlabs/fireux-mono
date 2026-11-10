<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="promotions"
  >
    <KitchenMenuSummary :summary="catalogue.promotions" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useMenuGroupIndexContext } from '../../../composables/workspace/menu-group/useMenuGroupIndexContext'
const { catalogue } = useMenuGroupIndexContext()
</script>
