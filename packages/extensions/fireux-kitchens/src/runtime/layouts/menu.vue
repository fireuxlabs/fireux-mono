<template>
  <div
    class="fireux-menu-layout"
    data-menu-layout="package"
    :data-menu-layout-scope="routeScope.kind"
  >
    <MenuClose
      v-if="!isKioskMenu"
      class="menu-close--layout"
      :class="isKioskMenu ? 'menu-close--bottom-left' : 'menu-close--top-right'"
      :aria-label="exitLabel"
      :kind="exitKind"
      :to="exitPath"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useMenuExit } from '../menu/composables/useMenuExit'

const { exitKind, exitLabel, exitPath, isKioskMenu, routeScope } = useMenuExit()
</script>

<style scoped>
.fireux-menu-layout {
  --menu-close-size: 3.5rem;
  --menu-close-icon-size: 2rem;

  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  color: var(--menu-text, #0f172a);
  background: var(--menu-bg, #f8fafc);
}

:global(.fireux-menu-layout:has(.menu-identity) > .menu-close--layout) {
  display: none;
}

@media (min-width: 40rem) {
  .fireux-menu-layout {
    --menu-close-size: 4.5rem;
    --menu-close-icon-size: 2.5rem;
  }
}
</style>
