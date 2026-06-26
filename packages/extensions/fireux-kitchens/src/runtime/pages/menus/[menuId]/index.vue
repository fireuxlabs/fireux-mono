<template>
  <MenuDetail :menu-id="menuId" />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: 'public-menu',
  name: 'MenuPage',
})

const menuId = useRouteParam('menuId')
</script>
