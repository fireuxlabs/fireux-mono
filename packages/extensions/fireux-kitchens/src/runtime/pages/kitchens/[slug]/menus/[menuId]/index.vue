<template>
  <MenuDetail
    :menu-id="menuTarget.menuId"
    :menu-context="menuTarget.context"
    :kitchen-slug="kitchenSlug"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { parseMenuRouteTarget } from '../../../../../utils/menu-context'

definePageMeta({
  layout: 'menu',
  name: 'KitchenMenuPage',
})

const routeMenuId = useRouteParam('menuId')
const menuTarget = computed(() => parseMenuRouteTarget(routeMenuId.value))
const kitchenSlug = useRouteParam('slug')
</script>
