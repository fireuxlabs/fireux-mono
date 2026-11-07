<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />
    <div class="fx-layout-main">
      <UContainer>
        <details class="docs-mobile-navigation">
          <summary>Browse docs and library</summary>
          <UNavigationMenu
            :items="navigation"
            orientation="vertical"
            aria-label="Mobile developer docs"
          />
        </details>
        <UPage>
          <template #left>
            <UPageAside>
              <UNavigationMenu
                :items="navigation"
                orientation="vertical"
                aria-label="Developer docs"
              />
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </div>
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { fireuxDocsCatalogue } from '../models/catalogue'

defineOptions({ name: 'docs' })

const navigation = [
  [
    { label: 'Guides', type: 'label' as const },
    { label: 'Overview', to: '/docs', exact: true },
    { label: 'Ignight', to: '/getting-started' },
    { label: 'Fuel', type: 'label' as const },
    { label: 'App configuration', to: '/docs/configuration' },
    { label: 'app.vue', to: '/docs/app' },
    { label: 'Pages', to: '/docs/pages' },
    { label: 'Layouts', to: '/docs/layouts' },
    { label: 'Components', to: '/docs/components', exact: true },
    { label: 'Composables', to: '/docs/composables' },
    { label: 'Server', to: '/docs/server' },
  ],
  [
    { label: 'Component library', type: 'label' as const },
    { label: 'All Core components', to: '/docs/components', exact: true },
    { label: 'Booking form (Extension)', to: '/docs/components/bookings' },
    ...fireuxDocsCatalogue.map((entry) => ({
      label: entry.title,
      to: `/docs/components/${entry.slug}`,
    })),
    {
      label: 'Read states',
      to: '/docs/components/state-feedback',
    },
    { label: 'Collections', to: '/docs/components/collections' },
    { label: 'Surfaces', to: '/docs/components/surfaces' },
    { label: 'Selection', to: '/docs/components/selection' },
    { label: 'Diagnostics', to: '/docs/components/diagnostics' },
  ],
  [
    { label: 'Compositions', type: 'label' as const },
    { label: 'Patterns', to: '/patterns' },
    { label: 'Templates', to: '/templates' },
    { label: 'Packages', to: '/packages' },
    { label: 'Nuxt', to: 'https://nuxt.com/docs', target: '_blank' },
    {
      label: 'Nuxt UI',
      to: 'https://ui.nuxt.com/docs/components',
      target: '_blank',
    },
  ],
]
</script>

<style scoped>
.docs-mobile-navigation {
  padding-block: calc(var(--spacing) * 4);
}

.docs-mobile-navigation summary {
  cursor: pointer;
  font-weight: 600;
}

@media (min-width: 64rem) {
  .docs-mobile-navigation {
    display: none;
  }
}
</style>
