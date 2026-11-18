<template>
  <UPageGrid as="ul" aria-label="Kitchen menus">
    <li
      v-for="menu in menus"
      :key="menu.id"
      class="menu-overview-list-item"
      :style="themeStyle"
    >
      <Card :menu="menu" />
    </li>
  </UPageGrid>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import Card from './Card.vue'
import type { Menu } from '../../../../../../menu/models/menu.model'

const { palette } = defineProps<{
  menus: Menu[]
  palette?: WorkspacePalette | null
}>()
const themeStyle = computed(() =>
  palette
    ? {
        '--ui-bg': palette.canvas,
        '--ui-text': palette.text,
        '--ui-text-highlighted': palette.text,
        '--ui-text-muted': palette.text,
        '--ui-primary': palette.accent,
        '--ui-text-inverted': palette.accent_contrast,
        '--ui-border': `color-mix(in srgb, ${palette.text} 22%, ${palette.canvas})`,
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
