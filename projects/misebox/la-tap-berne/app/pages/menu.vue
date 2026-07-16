<template>
  <div />
</template>

<script setup lang="ts">
import { menuRouteIndexPath, rootMenuRouteScope } from 'fireux-kitchens/runtime/utils/kitchen-menu-route'

await navigateTo(menuRouteIndexPath(rootMenuRouteScope()), {
  redirectCode: 301,
  replace: true,
})
</script>
