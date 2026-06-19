<template>
  <Menu :menu-id="menuId" />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const menuId = useRouteParam('menuId')
</script>
