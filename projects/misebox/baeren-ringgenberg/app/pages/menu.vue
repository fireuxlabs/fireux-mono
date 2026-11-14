<template>
  <div />
</template>

<script setup lang="ts">
import {
  menuRouteIndexPath,
  menuRoutePath,
  tenantMenuRouteScope,
} from 'fireux-kitchens/runtime/menu/utils/navigation/route'
import { normalizeMenuRouteContext } from 'fireux-kitchens/runtime/menu/utils/navigation/context'

import { baerenRinggenbergContent } from '../content/site'

const route = useRoute()
const context = normalizeMenuRouteContext(route.query.context)
const scope = tenantMenuRouteScope()
const target =
  context === 'generic'
    ? menuRouteIndexPath(scope)
    : menuRoutePath({
        scope,
        menuId: baerenRinggenbergContent.primaryMenuId,
        context,
      })

await navigateTo(target, {
  redirectCode: 301,
  replace: true,
})
</script>
