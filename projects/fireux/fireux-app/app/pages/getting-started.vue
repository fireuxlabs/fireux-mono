<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Getting started"
        description="Run the starter App, then add what your product needs."
      >
        <template #links>
          <UButton to="/docs" label="Developer docs" />
        </template>
      </UPageHeader>

      <UPageBody>
        <UPageSection id="starter" title="Run the starter">
          <p>With the workspace dependencies installed, run this from the repository root.</p>
          <UCard variant="subtle">
            <pre><code>pnpm --dir projects/templates/fireux-template dev</code></pre>
          </UCard>
          <p>
            Open <ULink to="http://localhost:3010" target="_blank">localhost:3010</ULink>
            after the development server starts.
          </p>
        </UPageSection>

        <UPageSection title="Make it your own">
          <p>
            Open the starter’s <code>nuxt.config.ts</code> to see its App identity,
            Ecosystem, layers, and modules. Use your App’s approved identity and
            backend configuration when setting up a real project.
          </p>
          <UPageGrid>
            <UPageCard
              title="Components"
              description="See the FireUX controls you can use in your App."
              to="/docs/components"
            />
            <UPageCard
              title="Patterns"
              description="See how to put a page together."
              to="/patterns"
            />
            <UPageCard
              title="Nuxt UI"
              description="Look up the underlying controls and theme options."
              to="https://ui.nuxt.com/docs/getting-started"
              target="_blank"
            />
          </UPageGrid>
        </UPageSection>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: {
    key: 'framework-docs',
    label: 'Docs',
    order: 10,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Getting started · FireUX',
  description: 'Run the starter App and build with FireUX.',
})
</script>
