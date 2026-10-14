<template>
  <MenuRecord :menu-route-scope="menuRouteScope" :route-menu-id="routeMenuId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../menu/utils/menu-route'

definePageMeta({
  layout: false,
  title: 'Menu',
  description: 'View Menu details.',
  middleware: [
    'menu-tenant-route',
    'menu-projection-layout',
    'kitchen-embedding',
  ],
  menuProjection: true,
})

const routeMenuId = useRouteParam('menuId')
const fireux = useFireUXConfig()
const menuRouteScope = computed(() =>
  fireux.isTenant ? tenantMenuRouteScope() : rootMenuRouteScope()
)
</script>
