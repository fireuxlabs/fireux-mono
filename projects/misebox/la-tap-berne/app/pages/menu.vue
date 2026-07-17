<template>
  <div />
</template>

<script setup lang="ts">
import { menuRouteIndexPath, tenantMenuRouteScope } from 'fireux-kitchens/runtime/utils/kitchen-menu-route'

await navigateTo(menuRouteIndexPath(tenantMenuRouteScope()), {
  redirectCode: 301,
  replace: true,
})
</script>
