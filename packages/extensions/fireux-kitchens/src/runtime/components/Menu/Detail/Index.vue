<template>
  <MenuDetailDisplayFrame :page-style="pageStyle">
    <MenuDetailDocument
      v-if="renderKind === 'document' && documentMenu"
      :kitchen-name="documentMenu.source?.kitchen_name"
      :menu="documentMenu"
      :document-url="documentUrl"
    />

    <MenuDetailStructured
      v-else
      :menu="structuredMenu"
      :menu-id="menuId"
      :kitchen-slug="kitchenSlug"
      :pending="pending"
      :error="error"
    />
  </MenuDetailDisplayFrame>

  <DevJson
    title="Menu debug"
    context="MenuDetail · Menu/Detail/Index.vue"
    :data="debug"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuManifest } from '../../../composables/fireux/public/menu/useMenuManifest'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const menuId = computed(() => props.menuId)
const kitchenSlug = computed(() => props.kitchenSlug)
// Public detail spine: docs/concepts/family-public-detail.md and docs/concepts/family-menu.md. Route pages stay tiny; MenuDetail chooses document vs structured from the manifest.
const {
  pending,
  error,
  renderKind,
  documentMenu,
  structuredMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
const documentUrl = computed(() => documentMenu.value?.file?.url || '')
// Menu display spine: page_style is data; MenuDetailDisplayFrame is only the CSS/font provider.
const pageStyle = computed(() =>
  documentMenu.value?.page_style ||
  structuredMenu.value?.presentation.pageStyle ||
  null
)
</script>
