<template>
  <MenuThemeSurface :page-style="pageStyle">
    <MenuHeader
      :kitchen-name="kitchenName || ''"
      :name="menu.name"
      :description="menu.description"
    />

    <MenuAllergenNotice class="source-menu__notice" />

    <MenuDocument
      v-if="sourceUrl"
      :menu="menu"
      :menu-id="menuId"
      :source-url="sourceUrl"
      :file-url="sourceUrl"
    />

    <p v-else class="source-menu__empty">
      Menu source unavailable.
    </p>
  </MenuThemeSurface>
</template>

<script setup lang="ts">
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'

type MenuSourceModel = {
  id?: string
  name: string
  description?: string
  file?: {
    url?: string
    type?: string
  }
  file_kind?: string
  doc_url?: string
  doc_type?: string
  kind?: string
}

const props = defineProps<{
  kitchenName?: string
  menu: MenuSourceModel
  sourceUrl: string
  pageStyle?: Partial<PageStyle> | null
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuId = computed(() => text(props.menu.id))
</script>

<style scoped>
.source-menu__notice {
  margin-bottom: 1.25rem;
}

.source-menu__empty {
  margin: 0;
  color: var(--menu-muted);
  text-align: center;
}
</style>
