<template>
  <MenuBrowse
    v-if="isBrowse"
    :menu-id="menuTarget.menuId"
    :menu-route-scope="menuRouteScope"
    page-canvas
    propagate-response-status
  />

  <MenuOrder
    v-else-if="isOrder"
    :menu-id="menuTarget.menuId"
    :menu-context="orderContext"
    :menu-route-scope="menuRouteScope"
    page-canvas
    propagate-response-status
  />

  <MenuJson v-else :endpoint="endpoint" :query="query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import {
  directoryMenuRouteScope,
  menuRouteProjection,
  parseMenuRouteTarget,
} from '../../../../../utils/kitchen-menu-route'

definePageMeta({
  middleware: 'menu-projection-layout',
  name: 'KitchenMenuPage',
})

const kitchenSlug = useRouteParam('slug')
const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const projection = computed(() => menuRouteProjection(menuTarget.value.context))
const isBrowse = computed(() => projection.value === 'browse')
const isOrder = computed(() => projection.value === 'order')
const orderContext = computed(() => {
  const context = menuTarget.value.context

  return context === 'delivery' || context === 'pre_order'
    ? context
    : 'collection'
})
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))
const endpoint = computed(() =>
  `/api/menus/${encodeURIComponent(menuTarget.value.menuId)}`
)
const query = computed(() => ({
  kitchenSlug: kitchenSlug.value,
  ...(projection.value === 'diagnostic'
    ? { context: menuTarget.value.context }
    : {}),
}))
</script>
