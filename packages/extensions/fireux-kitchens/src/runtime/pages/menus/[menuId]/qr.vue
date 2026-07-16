<template>
  <MenuQR
    :menu-id="qrMenuId"
    :menu-route-scope="menuRouteScope"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import {
  parseMenuRouteTarget,
  rootMenuRouteScope,
} from '../../../utils/kitchen-menu-route'

definePageMeta({
  layout: false,
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const qrMenuId = computed(() =>
  menuTarget.value.context === 'generic' ? menuTarget.value.menuId : ''
)
const menuRouteScope = rootMenuRouteScope()
</script>
