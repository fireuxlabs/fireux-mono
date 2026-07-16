<template>
  <div class="baeren-menu-layout contents">
    <MiseboxMenuClose
      :class="isKioskMenu
        ? 'fixed bottom-4 left-4 z-50 sm:bottom-8 sm:left-8'
        : 'fixed right-4 top-4 z-50 sm:right-8 sm:top-8'"
      :aria-label="isKioskMenu ? 'Kiosk verlassen' : 'Speisekarte schließen'"
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
  --menu-browse-nav-inline-end: calc(var(--misebox-menu-close-size, 4.5rem) + 1rem);
}

@media (min-width: 70rem) {
  .baeren-menu-layout {
    --menu-browse-nav-inline-end: 0rem;
  }
}
</style>
