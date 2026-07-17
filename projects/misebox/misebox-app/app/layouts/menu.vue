<template>
  <div class="misebox-menu-layout min-h-screen">
    <MenuClose
      class="menu-close--top-right"
      aria-label="Back to menus"
      kind="back"
      :to="indexPath"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  rootMenuRouteScope,
} from 'fireux-kitchens/runtime/utils/kitchen-menu-route'

const route = useRoute()
const kitchenSlug = computed(() => {
  const value = route.params.slug
  return String(Array.isArray(value) ? value[0] : value || '').trim()
})
const indexPath = computed(() =>
  menuRouteIndexPath(
    kitchenSlug.value
      ? directoryMenuRouteScope(kitchenSlug.value)
      : rootMenuRouteScope()
  )
)
</script>

<style scoped>
.misebox-menu-layout {
  --menu-browse-nav-inline-end: calc(var(--menu-close-size, 4.5rem) + 1rem);
  --menu-browse-identity-top-offset: calc(var(--menu-close-size, 4.5rem) + 1rem + env(safe-area-inset-top));

  background: var(--menu-bg, #f8fafc);
  color: var(--menu-text, #0f172a);
}

@media (min-width: 70rem) {
  .misebox-menu-layout {
    --menu-browse-nav-inline-end: 0rem;
  }
}
</style>
