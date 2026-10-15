<template>
  <MenuBrowse
    v-if="isBrowse"
    :menu-id="menuTarget.menuId"
    :menu-route-scope="menuRouteScope"
    page-canvas
    propagate-response-status
  />

  <ClientOnly
    v-else-if="
      isOrder &&
      ['collection', 'delivery', 'table'].includes(menuTarget.context)
    "
  >
    <MenuOrder
      :menu-id="menuTarget.menuId"
      :context="menuTarget.context as 'collection' | 'delivery' | 'table'"
      :route-scope="menuRouteScope"
    />
    <template #fallback><p class="p-6">Loading ordering…</p></template>
  </ClientOnly>
  <UAlert
    v-else-if="isOrder"
    title="Ordering is unavailable for this entrance"
    color="neutral"
  />

  <MenuDiagnosticsJson v-else :endpoint="endpoint" :query="query" />
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
} from '../utils/menu-route'

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
