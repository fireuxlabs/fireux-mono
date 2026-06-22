<template>
  <MenuSource
    v-if="isSourceMenu && menu"
    :kitchen-name="menu.source?.kitchen_name"
    :menu="menu"
    :source-url="sourceUrl"
    :page-style="menu.page_style"
  />

  <MenuStructured
    v-else
    :menu="renderMenu"
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
const {
  menu,
  pending,
  error,
  renderMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
const isSourceMenu = computed(() => menu.value?.kind === 'doc')
const sourceUrl = computed(() => menu.value?.file?.url || '')
</script>
