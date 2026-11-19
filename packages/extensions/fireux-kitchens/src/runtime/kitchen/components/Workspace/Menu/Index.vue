<template>
  <WorkspacePageHeader
    title="Menus"
    :description="description"
    variant="primary"
  />
  <Menu.Overview />
  <Menu.Create />
  <section aria-labelledby="menu-tools-heading" class="kitchen-overview-group">
    <h2 id="menu-tools-heading" class="fx-type-card-heading">Menu tools</h2>
    <UPageGrid>
      <Menu.ItemsOverview />
      <Menu.PromotionsOverview />
      <Menu.ServicesOverview />
    </UPageGrid>
  </section>
  <details class="kitchen-record-assistant">
    <summary>Ask KitchenAI about your menus</summary>
    <Menu.Ai />
  </details>
</template>

<script setup lang="ts">
import * as Menu from './index'
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menu/index'

const { description } = useKitchenWorkspaceMenu()
</script>

<style scoped>
@import '../overview.css';
@import '../record-tools.css';
</style>
