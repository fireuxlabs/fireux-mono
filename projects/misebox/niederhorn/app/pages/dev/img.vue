<template>
  <section class="dev-img">
    <header class="dev-img__header">
      <h1>Niederhorn Image Debug</h1>
      <p>
        Niederhorn currently inherits Misebox branding. When custom assets are
        ready, drop them in /public/img/brand/niederhorn and verify them here.
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
  title: 'Misebox Ecosystem',
  description:
    'packages/ecosystem/fireux-misebox/src/runtime/public/img/brand/misebox (served via /img/brand/misebox/*)',
  items: [
    { label: 'Avatar', path: '/img/brand/misebox/avatar.png' },
    { label: 'Logo', path: '/img/brand/misebox/logo.png' },
    { label: 'Logo (SVG)', path: '/img/brand/misebox/logo.svg' },
    { label: 'Wordmark · Dark', path: '/img/brand/misebox/wordmark-dark.svg' },
    {
      label: 'Wordmark · Light',
      path: '/img/brand/misebox/wordmark-light.svg',
    },
    { label: 'Wordmark · PNG', path: '/img/brand/misebox/wordmark.png' },
  ],
}

const tenantGroup = {
  title: 'Tenant Brand (expected)',
  description:
    'projects/misebox/niederhorn/public/img/brand/niederhorn (served via /img/brand/niederhorn/*)',
  items: [],
}

const groups = [runtimeGroup, ecosystemGroup, tenantGroup]

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-niederhorn-images',
    label: 'Images (tenant)',
    icon: 'i-lucide-image',
    group: 'misebox',
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
