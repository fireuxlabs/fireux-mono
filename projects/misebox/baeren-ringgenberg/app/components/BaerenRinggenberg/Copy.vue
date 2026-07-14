<!-- Tenant content-page component: docs/concepts/family-tenant-global.md -->
<template>
  <div class="baeren-copy">
    <slot />
  </div>
</template>

<style scoped>
.baeren-copy {
  display: grid;
  gap: 0.8rem;
  margin: 0 auto;
  color: var(--baeren-page-copy-fg, color-mix(in srgb, var(--brand-canvas) 86%, transparent));
  font-size: 1rem;
  line-height: 1.65;
}

.baeren-copy :deep(p) {
  margin: 0;
}
</style>
