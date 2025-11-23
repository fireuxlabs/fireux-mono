<template>
  <section class="dev-img">
    <header class="dev-img__header">
      <h1>FireUX Image Debug</h1>
      <p>
        Shared runtime and marketing assets surfaced for quick QA. Update the
        corresponding package directories before committing changes.
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

const stackGroup = {
  title: 'Tech Stack Badges',
  description:
    'projects/fireux/fireux-app/public/img/stack (served via /img/stack/*)',
  items: [
    { label: 'Nuxt · Light', path: '/img/stack/nuxt-black.png' },
    { label: 'Nuxt · Dark', path: '/img/stack/nuxt-white.png' },
    { label: 'Firebase · Light', path: '/img/stack/firebase-black.png' },
    { label: 'Firebase · Dark', path: '/img/stack/firebase-white.png' },
    { label: 'Stripe · Light', path: '/img/stack/stripe-black.png' },
    { label: 'Stripe · Dark', path: '/img/stack/stripe-white.png' },
    { label: 'GitHub · Light', path: '/img/stack/github-black.png' },
    { label: 'GitHub · Dark', path: '/img/stack/github-white.png' },
    { label: 'PWA · Light', path: '/img/stack/pwa-black.png' },
    { label: 'PWA · Dark', path: '/img/stack/pwa-white.png' },
  ],
}

const groups = [runtimeGroup, stackGroup]

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-images',
    label: 'Images',
    icon: 'i-lucide-image',
    group: 'fireux',
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
