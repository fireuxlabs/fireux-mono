<template>
  <section class="dev-img">
    <header class="dev-img__header">
      <h1>Tenant Image Debug</h1>
      <p>
        FireUX tenant sandbox shares the platform runtime assets. Add
        tenant-specific branding under /public/img/brand when you introduce a
        dedicated identity.
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

const tenantGroup = {
  title: 'Tenant Brand (expected)',
  description:
    'projects/fireux/tennant/public/img/brand/<tenant> (served via /img/brand/<tenant>/*)',
  items: [],
}

const stackGroup = {
  title: 'Stack Badges',
  description:
    'projects/fireux/fireux-app/public/img/stack (served via /img/stack/*)',
  items: [
    { label: 'Nuxt · Light', path: '/img/stack/nuxt-black.png' },
    { label: 'Nuxt · Dark', path: '/img/stack/nuxt-white.png' },
    { label: 'Firebase · Light', path: '/img/stack/firebase-black.png' },
    { label: 'Firebase · Dark', path: '/img/stack/firebase-white.png' },
    { label: 'Stripe · Light', path: '/img/stack/stripe-black.png' },
    { label: 'Stripe · Dark', path: '/img/stack/stripe-white.png' },
  ],
}

const groups = [runtimeGroup, tenantGroup, stackGroup]

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-tenant-images',
    label: 'Images (tenant)',
    icon: 'i-lucide-image',
    group: 'fireux',
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
