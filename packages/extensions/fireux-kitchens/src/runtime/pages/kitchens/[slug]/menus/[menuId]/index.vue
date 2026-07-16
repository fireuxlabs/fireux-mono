<template>
  <MenuJson :endpoint="endpoint" :query="query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { parseMenuRouteTarget } from '../../../../../utils/kitchen-menu-route'

const kitchenSlug = useRouteParam('slug')
const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
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
