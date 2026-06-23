<template>
  <MenuTheme :page-style="pageStyle">
    <MenuHeader
      :kitchen-name="kitchenName || ''"
      :name="menu.name"
      :description="menu.description"
    />

    <MenuDocumentViewer
      v-if="documentUrl"
      :menu="menu"
      :menu-id="menuId"
      :document-url="documentUrl"
      :file-url="documentUrl"
    />

    <p v-else class="document-menu__empty">
      Menu document unavailable.
    </p>
  </MenuTheme>
</template>

<script setup lang="ts">
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'

type MenuDocumentModel = {
  id?: string
  name: string
  description?: string
  file?: {
    url?: string
    type?: string
  }
  file_kind?: string
  kind?: string
}

const props = defineProps<{
  kitchenName?: string
  menu: MenuDocumentModel
  documentUrl: string
  pageStyle?: Partial<PageStyle> | null
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
