<template>
  <MenuDetailDocumentHeader
    :kitchen-name="kitchenName || ''"
    :name="menu.name"
    :description="menu.description"
  />

  <MenuDetailDocumentViewer
    v-if="documentUrl"
    :menu="menu"
    :menu-id="menuId"
    :document-url="documentUrl"
    :file-url="documentUrl"
  />

  <p v-else class="document-menu__empty">Menu document unavailable.</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuDocumentPayload } from '../../../models/menu-detail.model.ts'

const props = defineProps<{
  kitchenName?: string
  menu: MenuDocumentPayload
  documentUrl: string
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuId = computed(() => text(props.menu.id))
</script>

<style scoped>
.document-menu__empty {
  margin: 0;
  color: var(--menu-muted);
  text-align: center;
}
</style>
