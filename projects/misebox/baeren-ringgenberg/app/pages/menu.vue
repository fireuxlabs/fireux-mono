<template>
  <div />
</template>

<script setup lang="ts">
import {
  menuRouteIndexPath,
  menuRoutePath,
  rootMenuRouteScope,
} from 'fireux-kitchens/runtime/utils/kitchen-menu-route'
import { normalizeMenuRouteContext } from 'fireux-kitchens/runtime/utils/menu-context'
import kitchenConfig from '../config/kitchen.config'

const route = useRoute()
const context = normalizeMenuRouteContext(route.query.context)
const scope = rootMenuRouteScope()
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
