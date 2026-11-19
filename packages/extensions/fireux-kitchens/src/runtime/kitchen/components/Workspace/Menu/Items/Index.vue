<template>
  <WorkspacePageHeader
    title="Items"
    description="Manage items across your menus."
    variant="child"
  />
  <Items.Controls />
  <Items.Collection />
  <Items.Create />
  <Items.Ai />
</template>

<script setup lang="ts">
import * as Items from './index'
import { useKitchenWorkspaceMenuItems } from '../../../../composables/workspace/menu/items/useItemCatalogue'

useKitchenWorkspaceMenuItems()
</script>
