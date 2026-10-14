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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  parseMenuRouteTarget,
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../menu/utils/menu-route'

definePageMeta({
  layout: false,
  middleware: 'menu-tenant-route',
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const fireux = useFireUXConfig()
const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const menuRouteScope = fireux.isTenant
  ? tenantMenuRouteScope()
  : rootMenuRouteScope()
</script>
