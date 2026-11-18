<template>
  <WorkspacePageHeader
    title="Menus"
    :description="description"
    variant="primary"
  />
  <Menu.Overview />
  <Menu.Create />
  <UPageGrid as="section" aria-label="Items, promotions and services summary">
    <Menu.ItemsOverview />
    <Menu.PromotionsOverview />
    <Menu.ServicesOverview />
  </UPageGrid>
  <Menu.Ai />
</template>

<script setup lang="ts">
import * as Menu from './index'
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menu/index'

const { description } = useKitchenWorkspaceMenu()
</script>
