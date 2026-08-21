<template>
  <MenuRoute :menu-route-scope="menuRouteScope" :route-menu-id="routeMenuId" />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route'

definePageMeta({
  middleware: ['menu-tenant-route', 'menu-projection-layout'],
  menuProjection: true,
  name: 'MenuPage',
})

const fireux = useFireUXConfig()
const routeMenuId = useRouteParam('menuId')
const menuRouteScope = fireux.isTenant
  ? tenantMenuRouteScope()
  : rootMenuRouteScope()
</script>
