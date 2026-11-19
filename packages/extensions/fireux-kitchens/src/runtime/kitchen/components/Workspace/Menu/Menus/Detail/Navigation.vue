<template>
  <nav aria-label="Menu configuration" class="kitchen-record-navigation">
    <UButton
      v-for="item in items"
      :key="item.view"
      @click="select(item.view)"
      :label="item.label"
      :icon="item.icon"
      :color="view === item.view ? 'primary' : 'neutral'"
      :variant="view === item.view ? 'soft' : 'ghost'"
      :aria-pressed="view === item.view"
    />
  </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../../composables/workspace/menu/menus/useKitchenMenuRecordContext'
import { useMenuRecordView } from '../../../../../composables/workspace/menu/menus/useMenuRecordView'
const { menu } = useKitchenMenuRecordContext()
const { view, select } = useMenuRecordView()
const items = computed(() =>
  [
    {
      label:
        menu.value?.schedule === 'daily'
          ? 'Dates & selections'
          : menu.value?.format === 'document' || menu.value?.doc?.url
            ? 'Document'
            : 'Items & prices',
      icon:
        menu.value?.schedule === 'daily'
          ? 'i-lucide-calendar-days'
          : 'i-lucide-list-tree',
      view: 'content' as const,
    },
    {
      label: 'Publishing',
      icon: 'i-lucide-globe',
      view: 'publishing' as const,
    },
    {
      label: 'Import & source',
      icon: 'i-lucide-file-scan',
      view: 'source' as const,
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings-2',
      view: 'details' as const,
    },
  ].filter(
    (item) =>
      item.view !== 'source' ||
      !(menu.value?.format === 'document' || menu.value?.doc?.url)
  )
)
</script>
<style scoped>
@import '../../../record-tools.css';
</style>
