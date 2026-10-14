<template>
  <div />
</template>

<script setup lang="ts">
import {
  menuRouteIndexPath,
  menuRoutePath,
  tenantMenuRouteScope,
} from 'fireux-kitchens/runtime/menu/utils/menu-route'
import { normalizeMenuRouteContext } from 'fireux-kitchens/runtime/menu/utils/menu-context'
import kitchenConfig from '../config/kitchen.config'

const route = useRoute()
const context = normalizeMenuRouteContext(route.query.context)
const scope = tenantMenuRouteScope()
const target = context === 'generic'
  ? menuRouteIndexPath(scope)
  : menuRoutePath({
      scope,
      menuId: kitchenConfig.primaryMenuId,
      context,
    })

await navigateTo(target, {
  redirectCode: 301,
  replace: true,
})
</script>
