<template>
  <div
    class="fireux-menu-layout"
    data-menu-layout="package"
    :data-menu-layout-scope="routeScope.kind"
  >
    <MenuClose
      :class="isKioskMenu
        ? 'menu-close--bottom-left'
        : 'menu-close--top-right'"
      :aria-label="exitLabel"
      :kind="exitKind"
      :to="exitPath"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  parseMenuRouteTarget,
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../utils/kitchen-menu-route'

const fireux = useFireUXConfig()
const route = useRoute()
const kitchenSlug = computed(() => {
  const value = route.params.slug
  return String(Array.isArray(value) ? value[0] : value || '').trim()
})
const routeScope = computed(() => {
  if (kitchenSlug.value) return directoryMenuRouteScope(kitchenSlug.value)
  return fireux.isTenant ? tenantMenuRouteScope() : rootMenuRouteScope()
})
const isKioskMenu = computed(() =>
  parseMenuRouteTarget(route.params.menuId).context === 'kiosk'
)
const exitPath = computed(() =>
  fireux.isTenant ? '/' : menuRouteIndexPath(routeScope.value)
)
const exitKind = computed(() => fireux.isTenant ? 'close' : 'back')
const exitLabel = computed(() =>
  fireux.isTenant ? 'Close menu' : 'Back to menus'
)
</script>

<style scoped>
.fireux-menu-layout {
  --menu-browse-nav-inline-end: calc(var(--menu-close-size, 4.5rem) + 1rem);
  --menu-browse-identity-top-offset: calc(var(--menu-close-size, 4.5rem) + 1rem + env(safe-area-inset-top));

  min-height: 100vh;
  min-height: 100svh;
  color: var(--menu-text, #0f172a);
  background: var(--menu-bg, #f8fafc);
}

@media (min-width: 70rem) {
  .fireux-menu-layout {
    --menu-browse-nav-inline-end: 0rem;
  }
}
</style>
