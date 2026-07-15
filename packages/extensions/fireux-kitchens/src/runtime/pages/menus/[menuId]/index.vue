<template>
  <MenuDetail
    :menu-id="menuTarget.menuId"
    :menu-context="menuTarget.context"
    menu-route-mode="single-kitchen-app"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { parseMenuRouteTarget } from '../../../utils/menu-context'

definePageMeta({
  layout: 'menu',
  name: 'MenuPage',
})

const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
</script>
