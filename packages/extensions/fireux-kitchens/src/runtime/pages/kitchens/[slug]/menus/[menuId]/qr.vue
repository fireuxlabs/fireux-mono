<template>
  <MenuQR
    :menu-id="menuId"
    :menu-route-scope="menuRouteScope"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { directoryMenuRouteScope } from '../../../../../utils/kitchen-menu-route'

definePageMeta({
  layout: false,
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const route = useRoute()
const menuId = computed(() => String(route.params.menuId || '').trim())
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(route.params.slug)
)
</script>
