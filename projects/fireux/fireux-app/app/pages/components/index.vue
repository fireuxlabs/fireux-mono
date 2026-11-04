<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Components"
        description="FireUX Core components extend native Nuxt UI controls with shared product-neutral responsibilities."
      >
        <template #links>
          <UButton
            to="https://ui.nuxt.com/docs/components"
            target="_blank"
            label="Nuxt UI components"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageHeader>
      <UPageBody>
        <UPageSection
          title="Try the controls"
          description="A local preview of native Nuxt UI controls and shared FireUX interactions."
        >
          <FrameworkPlayground />
        </UPageSection>

        <UPageSection
          title="Core components"
          description="Browse shared FireUX components by the responsibility they own. Nuxt UI controls and their native APIs remain documented upstream."
        >
          <UPageGrid>
            <UPageCard
              title="Collections"
              description="Reusable cells, section headers, rows and load-more feedback."
              icon="i-lucide-list"
              to="/components/collections"
            />
            <UPageCard
              title="State and feedback"
              description="Shared read outcomes, empty-state cards and error copying."
              icon="i-lucide-circle-dot"
              to="/components/state-feedback"
            />
            <UPageCard
              title="Selection"
              description="Visible multi-select choices and compact single selection."
              icon="i-lucide-list-checks"
              to="/components/selection"
            />
            <UPageCard
              title="Surfaces and disclosure"
              description="Shared action surfaces and disclosure controls."
              icon="i-lucide-panels-top-left"
              to="/components/surfaces"
            />
            <UPageCard
              title="Developer diagnostics"
              description="Inspect passed data and derived values during development."
              icon="i-lucide-scan-search"
              to="/components/diagnostics"
            />
          </UPageGrid>
        </UPageSection>

        <UPageSection
          title="Guides and patterns"
          description="Composition guidance uses Core components and native Nuxt UI; it does not add another component API."
        >
          <UPageGrid>
            <UPageCard
              title="Page composition"
              description="Compose a route from Nuxt UI page structure and named domain components."
              icon="i-lucide-panels-top-left"
              to="/components/page"
            />
          </UPageGrid>
        </UPageSection>

        <UPageCTA
          title="Explore the source packages"
          description="Inspect the package sources and their consumers."
          :links="[
            {
              label: 'Package library',
              to: '/packages',
              color: 'neutral',
              variant: 'outline',
            },
          ]"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: {
    key: 'framework-components',
    label: 'Components',
    order: 20,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Components · FireUX',
  description:
    'Explore shared FireUX Core components, composed from native Nuxt UI controls.',
})
</script>
