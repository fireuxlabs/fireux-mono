<template>
  <WorkspacePageHeader
    class="border border-red-500"
    title="Menus"
    :description="description"
    variant="primary"
  />
  <KitchenMenuMenusOverview class="border border-blue-500" /> 1
  <KitchenMenuMenusCreateDialog class="border border-orange-500" />2
  <KitchenMenuAI class="border border-purple-500" />3
  <UPageGrid
    as="section"
    class="border border-pink-500"
    aria-label="Items, promotions and services summary"
  >
    <KitchenMenuItemsOverview class="border border-green-500" />4
    <KitchenMenuPromotionsOverview class="border border-yellow-500" />5
    <KitchenMenuServicesOverview class="border border-cyan-500" />6
  </UPageGrid>
</template>

<script setup lang="ts">
import { useKitchenMenusWorkspace } from '../../composables/workspace/menus/useKitchenMenusWorkspace'

const { description } = useKitchenMenusWorkspace()
</script>
