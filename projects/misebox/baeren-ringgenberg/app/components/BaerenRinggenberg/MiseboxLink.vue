<!-- Tenant content-page component: docs/concepts/family-tenant-global.md -->
<template>
  <a
    class="baeren-misebox-link"
    :href="baerenRinggenbergContent.links.miseboxPlace"
    target="_blank"
    rel="noopener"
    :aria-label="`Find ${baerenRinggenbergContent.brand.name} on Misebox`"
  >
    <AppBrandWordmark
      :light-src="baerenRinggenbergContent.assets.miseboxWordmark.lightSrc"
      :dark-src="baerenRinggenbergContent.assets.miseboxWordmark.darkSrc"
      alt="Misebox"
      size="small"
      class="baeren-misebox-link__wordmark"
    />
  </a>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../config/content.config'
</script>

<style scoped>
.baeren-misebox-link {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  margin-top: 0.25rem;
  color: var(--baeren-page-fg, var(--brand-canvas));
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
  opacity: 0.9;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.baeren-misebox-link:hover {
  opacity: 1;
  transform: translateY(-1px);
}

:global(.baeren-misebox-link__wordmark) {
  height: 1.35rem;
  max-width: none;
  filter: none;
}
</style>
