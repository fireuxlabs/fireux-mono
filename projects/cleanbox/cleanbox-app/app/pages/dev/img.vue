<template>
  <section class="dev-img">
    <header class="dev-img__header">
      <h1>Cleanbox Image Debug</h1>
      <p>
        Validate shared ecosystem assets before pushing updates. Ensure guards
        and docs stay aligned with the source directories noted here.
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

const brandGroup = {
  title: 'Cleanbox Ecosystem',
  description:
    'packages/ecosystem/fireux-cleanbox/src/runtime/public/img/brand/cleanbox (served via /img/brand/cleanbox/*)',
  items: [
    { label: 'Avatar', path: '/img/brand/cleanbox/avatar.png' },
    { label: 'Logo', path: '/img/brand/cleanbox/logo.png' },
    { label: 'Wordmark', path: '/img/brand/cleanbox/wordmark.png' },
  ],
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

const groups = [runtimeGroup, brandGroup, stackGroup]

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-cleanbox-images',
    label: 'Images',
    icon: 'i-lucide-image',
    group: 'cleanbox',
    order: 45,
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
