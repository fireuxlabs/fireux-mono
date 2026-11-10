<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="menus"
  >
    <KitchenMenuSummary :summary="catalogue.menus" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useMenuGroupIndexContext } from '../../../composables/workspace/menu-group/useMenuGroupIndexContext'
const { catalogue } = useMenuGroupIndexContext()
</script>
