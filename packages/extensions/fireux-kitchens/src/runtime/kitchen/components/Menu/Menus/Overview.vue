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
      <KitchenMenuMenusOverviewControls
        v-model:query="query"
        v-model:show-archived="showArchived"
        :can-create-menu="canCreateMenu"
        create-blocked-message=""
        :has-archived="archivedCount > 0"
        :count="visibleMenus.length"
        @create="actions.openCreate"
      />
      <KitchenMenuMenusOverviewList
        :menus="visibleMenus"
        :searching="Boolean(query)"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { useMenuGroupIndex } from '../../../composables/workspace/menu-group/useMenuGroupIndex'
import { useKitchenMenus } from '../../../composables/workspace/menus/useKitchenMenus'
import { useMenuList } from '../../../composables/workspace/menus/useMenuList'

const { actions } = useKitchenMenus()
// Temporary presentation switch while reviewing the menu overview.
const canCreateMenu = true
const { menusOutcome } = useMenuGroupIndex()
const { query, showArchived, archivedCount, visibleMenus } = useMenuList()
</script>
