<!-- Tenant content-page component: docs/concepts/family-tenant-global.md -->
<template>
  <div class="latap-copy">
    <slot />
  </div>
</template>

<style scoped>
.latap-copy {
  display: grid;
  gap: 0.8rem;
  margin: 0 auto;
  color: var(--latap-page-copy-fg, color-mix(in srgb, var(--brand-canvas) 86%, transparent));
  font-size: 1rem;
  line-height: 1.65;
}

.latap-copy :deep(p) {
  margin: 0;
}
</style>
