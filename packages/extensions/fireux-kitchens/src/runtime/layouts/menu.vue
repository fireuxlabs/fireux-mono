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
const kitchenCollectionRecoverySlug = computed(() => {
  if (route.params.menuId) return ''

  const suffix = '.collection'
  return kitchenSlug.value.endsWith(suffix)
    ? kitchenSlug.value.slice(0, -suffix.length)
    : ''
})
const routeScope = computed(() => {
  const directorySlug = kitchenCollectionRecoverySlug.value || kitchenSlug.value
  if (directorySlug) return directoryMenuRouteScope(directorySlug)
  return fireux.isTenant ? tenantMenuRouteScope() : rootMenuRouteScope()
})
const isKioskMenu = computed(() =>
  parseMenuRouteTarget(route.params.menuId).context === 'kiosk'
)
const exitPath = computed(() => {
  if (kitchenCollectionRecoverySlug.value) {
    return `/kitchens/${encodeURIComponent(kitchenCollectionRecoverySlug.value)}`
  }

  return fireux.isTenant ? '/' : menuRouteIndexPath(routeScope.value)
})
const exitKind = computed(() =>
  fireux.isTenant && !kitchenCollectionRecoverySlug.value ? 'close' : 'back'
)
const exitLabel = computed(() => {
  if (kitchenCollectionRecoverySlug.value) return 'Back to kitchen'

  return fireux.isTenant ? 'Close menu' : 'Back to menus'
})
</script>

<style scoped>
.fireux-menu-layout {
  --menu-close-size: 3.5rem;
  --menu-close-icon-size: 2rem;
  --menu-browse-nav-inline-end: calc(var(--menu-close-size, 4.5rem) + 1rem);
  --menu-browse-identity-top-offset: calc(var(--menu-close-size, 4.5rem) + 1rem + env(safe-area-inset-top));

  min-height: 100vh;
  min-height: 100svh;
  color: var(--menu-text, #0f172a);
  background: var(--menu-bg, #f8fafc);
}

@media (min-width: 40rem) {
  .fireux-menu-layout {
    --menu-close-size: 4.5rem;
    --menu-close-icon-size: 2.5rem;
  }
}

@media (min-width: 70rem) {
  .fireux-menu-layout {
    --menu-browse-nav-inline-end: 0rem;
  }
}
</style>
