<template>
  <MenuBrowse
    v-if="isBrowse"
    :menu-id="menuTarget.menuId"
    :menu-route-scope="props.menuRouteScope"
    page-canvas
    propagate-response-status
  />

  <MenuOrder
    v-else-if="isOrder"
    :menu-id="menuTarget.menuId"
    :menu-context="orderContext"
    :menu-route-scope="props.menuRouteScope"
    page-canvas
    propagate-response-status
  />

  <MenuJson v-else :endpoint="endpoint" :query="query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  menuRouteProjection,
  parseMenuRouteTarget,
  type MenuRouteScope,
} from '../../utils/kitchen-menu-route'

const props = defineProps<{
  menuRouteScope: MenuRouteScope
  routeMenuId: unknown
}>()

const menuTarget = computed(() => parseMenuRouteTarget(props.routeMenuId))
const projection = computed(() => menuRouteProjection(menuTarget.value.context))
const isBrowse = computed(() => projection.value === 'browse')
const isOrder = computed(() => projection.value === 'order')
const orderContext = computed(() => {
  const context = menuTarget.value.context

  return context === 'delivery' || context === 'pre_order' || context === 'kiosk'
    ? context
    : 'collection'
})
const endpoint = computed(() =>
  `/api/menus/${encodeURIComponent(menuTarget.value.menuId)}`
)
const query = computed(() => {
  const value = {
    ...(props.menuRouteScope.kind === 'directory'
      ? { kitchenSlug: props.menuRouteScope.kitchenSlug }
      : {}),
    ...(projection.value === 'diagnostic'
      ? { context: menuTarget.value.context }
      : {}),
  }

  return Object.keys(value).length ? value : undefined
})
</script>
