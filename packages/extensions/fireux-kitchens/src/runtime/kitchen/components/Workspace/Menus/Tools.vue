<template>
  <nav
    v-if="ready"
    class="menu-tools"
    :aria-label="`Actions for ${selectedMenu?.name || 'selected Menu'}`"
  >
    <UButton
      :to="`${menuPath}/content`"
      label="Items & prices"
      icon="i-lucide-list-tree"
      color="primary"
      variant="soft"
    />
    <UButton
      :to="`${menuPath}/publishing`"
      label="Publishing"
      icon="i-lucide-globe"
      color="neutral"
      variant="outline"
    />
    <UButton
      :to="`${menuPath}#menu-services`"
      label="Linked services"
      icon="i-lucide-shopping-bag"
      color="neutral"
      variant="outline"
    />
  </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const { selectedMenu, derived } = useKitchenMenusContext()
const ready = computed(
  () => derived.value.status === 'ready' && Boolean(selectedMenu.value)
)
const menuPath = computed(
  () =>
    `/workspace/kitchen/menus/${encodeURIComponent(selectedMenu.value?.slug || '')}`
)
</script>
<style scoped>
.menu-tools {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
</style>
