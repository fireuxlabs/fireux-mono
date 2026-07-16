<template>
  <MenuDetail
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
} from '../../../../../utils/kitchen-menu-route'

definePageMeta({
  layout: 'menu',
  name: 'KitchenMenuPage',
})

const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const kitchenSlug = useRouteParam('slug')
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))
</script>
