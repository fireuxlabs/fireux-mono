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
  { label: 'Components', to: '/docs/components' },
  { label: 'Composables', to: '/docs/composables' },
  { label: 'Patterns', to: '/patterns' },
]
</script>
