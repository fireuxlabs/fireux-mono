<template>
  <div class="latap-menu-layout contents">
    <MenuClose
      class="menu-close--top-right"
      aria-label="Close menu"
      kind="close"
      to="/"
    />

    <slot />
  </div>
</template>

<style scoped>
.latap-menu-layout {
  --menu-browse-nav-inline-end: calc(var(--menu-close-size, 4.5rem) + 1rem);
  --menu-browse-identity-top-offset: calc(var(--menu-close-size, 4.5rem) + 1rem + env(safe-area-inset-top));
}

@media (min-width: 70rem) {
  .latap-menu-layout {
    --menu-browse-nav-inline-end: 0rem;
  }
}
</style>
