<template>
  <MenuDetailStructured
    :menu="structuredMenu"
    :menu-id="menuId"
    :kitchen-slug="kitchenSlug"
    :pending="pending"
    :error="error"
  />

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
// Public detail spine: keep the active menu doorway boring first. Document/theme rendering is parked until the structured path is clean.
const {
  pending,
  error,
  structuredMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
</script>
