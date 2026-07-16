<template>
  <MenuJson :endpoint="endpoint" :query="query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { parseMenuRouteTarget } from '../../../utils/kitchen-menu-route'

definePageMeta({
  name: 'MenuJsonPage',
})

const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const endpoint = computed(() =>
  `/api/menus/${encodeURIComponent(menuTarget.value.menuId)}`
)
const query = computed(() =>
  menuTarget.value.context === 'generic'
    ? undefined
    : { context: menuTarget.value.context }
)
</script>
