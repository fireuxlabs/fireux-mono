<template>
  <section class="dev-img">
    <header class="dev-img__header">
      <h1>Richies Reinigung Image Debug</h1>
      <p>
        This tenant inherits Cleanbox ecosystem branding. Upload custom tenant
        assets to /public/img/brand/richies and confirm the previews below.
      </p>
    </header>

    <DevImageDebug :groups="groups" />
  </section>
</template>

<script setup lang="ts">
const runtimeGroup = {
  title: 'FireUX Runtime',
  description:
    'packages/core/fireux-core/src/runtime/public/img/brand/fireux (served via /img/brand/fireux/*)',
  items: [
    {
      label: 'Wordmark · Light',
      path: '/img/brand/fireux/wordmark-light.png',
    },
    {
      label: 'Wordmark · Dark',
      path: '/img/brand/fireux/wordmark-dark.png',
    },
    {
      label: 'Logo · Primary',
      path: '/img/brand/fireux/logo.png',
    },
    {
      label: 'Wordmark · SVG',
      path: '/img/brand/fireux/wordmark-light.svg',
    },
  ],
}

const ecosystemGroup = {
  title: 'Cleanbox Ecosystem',
  description:
    'packages/ecosystem/fireux-cleanbox/src/runtime/public/img/brand/cleanbox (served via /img/brand/cleanbox/*)',
  items: [
    { label: 'Avatar', path: '/img/brand/cleanbox/avatar.png' },
    { label: 'Logo', path: '/img/brand/cleanbox/logo.png' },
    { label: 'Wordmark', path: '/img/brand/cleanbox/wordmark.png' },
  ],
}

const tenantGroup = {
  title: 'Tenant Brand (expected)',
  description:
    'projects/cleanbox/richies-reinigung/public/img/brand/richies (served via /img/brand/richies/*)',
  items: [],
}

const groups = [runtimeGroup, ecosystemGroup, tenantGroup]

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-richies-images',
    label: 'Images (tenant)',
    icon: 'i-lucide-image',
    group: 'cleanbox',
    order: 46,
    layouts: ['dev'],
    desktop: true,
    mobile: false,
  },
})
</script>

<style scoped>
.dev-img {
  display: grid;
  gap: 1.5rem;
}

.dev-img__header {
  display: grid;
  gap: 0.5rem;
}

.dev-img__header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.dev-img__header p {
  color: rgba(100, 116, 139, 0.85);
  max-width: 48rem;
}
</style>
