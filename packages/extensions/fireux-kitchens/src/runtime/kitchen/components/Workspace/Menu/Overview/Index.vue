<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Your menus"
  >
    <FireState
      v-if="
        menusOutcome === 'pending' ||
        menusOutcome === 'idle' ||
        menusOutcome === 'error'
      "
      :outcome="menusOutcome === 'idle' ? 'pending' : menusOutcome"
      entity="menus"
    />
    <template v-else>
      <KitchenWorkspaceMenuOverviewControls
        v-model:query="query"
        v-model:show-archived="showArchived"
        :can-create-menu="canCreateMenu"
        :create-blocked-message="createBlockedMessage"
        :has-archived="archivedCount > 0"
        :count="visibleMenus.length"
        @create="openCreate"
      />
      <KitchenWorkspaceMenuOverviewList
        :menus="visibleMenus"
        :searching="Boolean(query)"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuOverview } from '../../../../composables/workspace/menu/overview'
const {
  menusOutcome,
  query,
  showArchived,
  archivedCount,
  visibleMenus,
  canCreateMenu,
  createBlockedMessage,
  openCreate,
} = useKitchenWorkspaceMenuOverview()
</script>
