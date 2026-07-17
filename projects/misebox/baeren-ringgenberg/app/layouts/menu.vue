<template>
  <div class="baeren-menu-layout contents">
    <MenuClose
      :class="isKioskMenu
        ? 'menu-close--bottom-left'
        : 'menu-close--top-right'"
      :aria-label="isKioskMenu ? 'Kiosk verlassen' : 'Speisekarte schließen'"
      kind="close"
      to="/"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseMenuRouteTarget } from 'fireux-kitchens/runtime/utils/kitchen-menu-route'

const route = useRoute()
const isKioskMenu = computed(() =>
  parseMenuRouteTarget(route.params.menuId).context === 'kiosk'
)
</script>

<style scoped>
.baeren-menu-layout {
  --menu-browse-nav-inline-end: calc(var(--menu-close-size, 4.5rem) + 1rem);
  --menu-browse-identity-top-offset: calc(var(--menu-close-size, 4.5rem) + 1rem + env(safe-area-inset-top));
}

@media (min-width: 70rem) {
  .baeren-menu-layout {
    --menu-browse-nav-inline-end: 0rem;
  }
}
</style>
