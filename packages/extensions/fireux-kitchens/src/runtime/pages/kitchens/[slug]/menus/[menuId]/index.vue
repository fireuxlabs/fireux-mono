<template>
  <MenuDetail
    :menu-id="menuId"
    :kitchen-slug="kitchenSlug"
  />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: 'menu',
  name: 'KitchenMenuPage',
})

const menuId = useRouteParam('menuId')
const kitchenSlug = useRouteParam('slug')
</script>
