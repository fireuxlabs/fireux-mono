<template>
  <WorkspacePageHeader
    title="Menus"
    :description="description"
    variant="primary"
  />
  <KitchenWorkspaceMenuOverview />
  <KitchenWorkspaceMenuCreate />
  <KitchenWorkspaceMenuAi />
  <UPageGrid as="section" aria-label="Items, promotions and services summary">
    <KitchenWorkspaceMenuItemsOverview />
    <KitchenWorkspaceMenuPromotionsOverview />
    <KitchenWorkspaceMenuServicesOverview />
  </UPageGrid>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menu/index'

const { description } = useKitchenWorkspaceMenu()
</script>
