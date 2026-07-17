<template>
  <MenuBrowse
    v-if="isBrowse"
    :menu-id="menuTarget.menuId"
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
  parseMenuRouteTarget,
} from '../../../../../utils/kitchen-menu-route'

definePageMeta({
  middleware: 'menu-projection-layout',
  name: 'KitchenMenuPage',
})

const kitchenSlug = useRouteParam('slug')
const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const isBrowse = computed(() => menuTarget.value.context === 'generic')
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))
const endpoint = computed(() =>
  `/api/menus/${encodeURIComponent(menuTarget.value.menuId)}`
)
const query = computed(() => ({
  kitchenSlug: kitchenSlug.value,
  ...(menuTarget.value.context === 'generic'
    ? {}
    : { context: menuTarget.value.context }),
}))
</script>
