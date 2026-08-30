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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRouteProjection,
  parseMenuRouteTarget,
  rootMenuRouteScope,
  tenantMenuRouteScope,
  type MenuRouteScope,
} from '../../kitchen/utils/kitchen-menu-route'

const props = defineProps<{
  menuRouteScope?: MenuRouteScope
  routeMenuId: unknown
}>()

const fireux = useFireUXConfig()
const menuRouteScope = computed(
  () =>
    props.menuRouteScope ??
    (fireux.isTenant ? tenantMenuRouteScope() : rootMenuRouteScope())
)
const menuTarget = computed(() => parseMenuRouteTarget(props.routeMenuId))
const projection = computed(() => menuRouteProjection(menuTarget.value.context))
const isBrowse = computed(() => projection.value === 'browse')
const isOrder = computed(() => projection.value === 'order')
const orderContext = computed(() => {
  const context = menuTarget.value.context

  return context === 'delivery' ||
    context === 'pre_order' ||
    context === 'kiosk'
    ? context
    : 'collection'
})
const endpoint = computed(
  () => `/api/menus/${encodeURIComponent(menuTarget.value.menuId)}`
)
const query = computed(() => {
  const value = {
    ...(menuRouteScope.value.kind === 'directory'
      ? { kitchenSlug: menuRouteScope.value.kitchenSlug }
      : {}),
    ...(projection.value === 'diagnostic'
      ? { context: menuTarget.value.context }
      : {}),
  }

  return Object.keys(value).length ? value : undefined
})
</script>
