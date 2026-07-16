<template>
  <div class="contents">
    <MiseboxMenuClose
      class="latap-glass fixed right-4 top-4 z-50 sm:right-8 sm:top-8"
      to="/"
    />

    <MenuDetail
      menu-id="main"
      menu-context="pre_order"
      :menu-route-scope="menuRouteScope"
    />
  </div>
</template>

<script setup lang="ts">
import { rootMenuRouteScope } from 'fireux-kitchens/runtime/utils/kitchen-menu-route'

const menuRouteScope = rootMenuRouteScope()

definePageMeta({
  layout: 'menu',
})
</script>

<style scoped></style>
