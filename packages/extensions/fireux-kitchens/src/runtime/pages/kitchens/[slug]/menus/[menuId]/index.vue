<template>
  <MenuRoute
    :menu-route-scope="menuRouteScope"
    :route-menu-id="routeMenuId"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../../utils/kitchen-menu-route'

definePageMeta({
  middleware: 'menu-projection-layout',
  name: 'KitchenMenuPage',
})

const kitchenSlug = useRouteParam('slug')
const routeMenuId = useRouteParam('menuId')
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))
</script>
