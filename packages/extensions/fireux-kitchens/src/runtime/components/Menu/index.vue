<template>
  <MenuAllergenNotice />

  <MenuDocument
    v-if="renderKind === 'document' && documentMenu"
    :kitchen-name="documentMenu.source?.kitchen_name"
    :menu="documentMenu"
    :document-url="documentUrl"
    :page-style="documentMenu.page_style"
  />

  <MenuStructured
    v-else
    :menu="structuredMenuForRender"
    :menu-id="menuId"
    :kitchen-slug="kitchenSlug"
    :pending="pending"
    :error="error"
  />

  <DevJson
    title="Menu debug"
    context="Menu · Menu.vue"
    :data="debug"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuManifest } from '../../composables/fireux/public/menu/useMenuManifest'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const menuId = computed(() => props.menuId)
const kitchenSlug = computed(() => props.kitchenSlug)
// Public detail spine: docs/concepts/family-public-detail.md and docs/concepts/family-menu.md. Route pages stay tiny; this entry chooses document vs structured from the manifest.
const {
  pending,
  error,
  renderKind,
  documentMenu,
  structuredMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
const documentUrl = computed(() => documentMenu.value?.file?.url || '')
const structuredMenuForRender = computed(() =>
  renderKind.value === 'structured' ? structuredMenu.value : null
)
</script>
