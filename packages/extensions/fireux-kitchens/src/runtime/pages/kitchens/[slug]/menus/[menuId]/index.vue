<template>
  <MenuEntry :menu-route-scope="menuRouteScope" :route-menu-id="routeMenuId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../../menu/utils/menu-route'

definePageMeta({
  middleware: ['menu-projection-layout', 'kitchen-embedding'],
  name: 'KitchenMenuPage',
})

const kitchenSlug = useRouteParam('slug')
const routeMenuId = useRouteParam('menuId')
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
</script>
