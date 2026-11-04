<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />
    <main class="fx-layout-main">
      <UContainer>
        <UNavigationMenu :items="navigation" aria-label="Developer docs" />
        <slot />
      </UContainer>
    </main>
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'docs' })

const navigation = [
  { label: 'Docs', to: '/docs', exact: true },
  { label: 'Getting started', to: '/getting-started' },
  {
    label: 'Fuel',
    children: [
      { label: 'App configuration', to: '/docs/configuration' },
      { label: 'Pages', to: '/docs/pages' },
      { label: 'Layouts', to: '/docs/layouts' },
      { label: 'Components', to: '/docs/components' },
      { label: 'Composables', to: '/docs/composables' },
    ],
  },
  { label: 'Server', to: '/docs/server' },
  { label: 'Patterns', to: '/patterns' },
]
</script>
