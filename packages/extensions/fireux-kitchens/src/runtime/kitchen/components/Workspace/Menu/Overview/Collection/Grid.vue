<template>
  <UPageGrid as="ul" aria-label="Kitchen menus">
    <li
      v-for="menu in menus"
      :key="menu.id"
      class="menu-overview-list-item"
      :style="menu.theme_mode === 'default' ? undefined : themeStyle"
    >
      <Collection.SpecialsCard
        v-if="menu.schedule === 'daily' && menu.purpose === 'specials'"
        :menu="menu"
        :kitchen-id="kitchenId || ''"
        :timezone="timezone || ''"
      />
      <Collection.Card v-else :menu="menu" />
    </li>
  </UPageGrid>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import * as Collection from './index'
import type { Menu } from '../../../../../../menu/models/menu.model'

const { palette } = defineProps<{
  menus: Menu[]
  kitchenId?: string
  timezone?: string
  palette?: WorkspacePalette | null
}>()
const themeStyle = computed(() =>
  palette
    ? {
        '--workspace-menu-card-background': palette.canvas,
      }
    : undefined
)
</script>
<style scoped>
.menu-overview-list-item {
  display: grid;
  min-width: 0;
}
</style>
