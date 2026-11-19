<template>
  <div class="menu-record-header">
    <KitchenWorkspaceMenuMenusDetailIdentity v-if="menu" />
    <h1 v-else class="fx-type-page-title">
      {{ menuLabel }}
    </h1>
    <KitchenWorkspaceMenuMenusDetailNavigation v-if="menu" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../../composables/workspace/menu/menus/useKitchenMenuRecordContext'

const { menu, source } = useKitchenMenuRecordContext()
const menuLabel = computed(() =>
  String(
    menu.value?.internal_name || menu.value?.name || source.value?.id || 'Menu'
  ).trim()
)
</script>
<style scoped>
.menu-record-header {
  display: grid;
  gap: calc(var(--spacing) * 3);
}
</style>
