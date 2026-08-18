<template>
  <MenuQR
    :menu-id="menuTarget.menuId"
    :menu-context="menuTarget.context"
    :menu-route-scope="menuRouteScope"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import {
  directoryMenuRouteScope,
  parseMenuRouteTarget,
} from '../../../../../kitchen/utils/kitchen-menu-route'

definePageMeta({
  layout: false,
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const kitchenSlug = useRouteParam('slug')
const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))
</script>
