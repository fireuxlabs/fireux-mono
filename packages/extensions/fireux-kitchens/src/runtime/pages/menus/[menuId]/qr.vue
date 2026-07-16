<template>
  <MenuQR
    :menu-id="menuId"
    :menu-route-scope="menuRouteScope"
  />
</template>

<script setup lang="ts">
import { rootMenuRouteScope } from '../../../utils/kitchen-menu-route'

definePageMeta({
  layout: false,
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const route = useRoute()
const menuId = String(route.params.menuId || '').trim()
const menuRouteScope = rootMenuRouteScope()
</script>
