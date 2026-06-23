<template>
  <MenuSource
    v-if="surface === 'source' && sourceMenu"
    :kitchen-name="sourceMenu.source?.kitchen_name"
    :menu="sourceMenu"
    :source-url="sourceUrl"
    :page-style="sourceMenu.page_style"
  />

  <MenuStructured
    v-else-if="surface === 'structured'"
    :menu="structuredMenu"
    :menu-id="menuId"
    :kitchen-slug="kitchenSlug"
    :pending="pending"
    :error="error"
  />

  <MenuStructured
    v-else
    :menu="null"
    :menu-id="menuId"
    :kitchen-slug="kitchenSlug"
    :pending="pending"
    :error="error"
  />

  <DevJson
    title="Menu debug"
    context="Menu surface · Menu.vue"
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
// Public detail spine: docs/concepts/family-public-detail.md and docs/concepts/family-menu.md. Route pages stay tiny; this entry chooses source vs structured from the manifest.
const {
  pending,
  error,
  surface,
  sourceMenu,
  structuredMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
const sourceUrl = computed(() => sourceMenu.value?.file?.url || '')
</script>
