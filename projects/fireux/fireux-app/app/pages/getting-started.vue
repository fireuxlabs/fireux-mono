<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Getting started"
        description="Run the FireUX starter App and see how it brings Core, Nuxt UI, and an Ecosystem together."
      >
        <template #links>
          <UButton to="/docs" label="Developer docs" />
        </template>
      </UPageHeader>

      <UPageBody>
        <UPageSection id="starter" title="Run the starter">
          <p>
            With the workspace dependencies installed, run this from the
            repository root.
          </p>
          <UCard variant="subtle">
            <pre><code>pnpm --dir projects/templates/fireux-template dev</code></pre>
          </UCard>
          <p>
            Open
            <ULink to="http://localhost:3010" target="_blank"
              >localhost:3010</ULink
            >
            after the development server starts.
          </p>
        </UPageSection>

        <UPageSection title="Make it your own">
          <p>
            The starter comes with FireUX Core and the Blogs and Products
            layers. Open <code>nuxt.config.ts</code> to see how they fit
            together, then set your App’s identity and backend configuration.
          </p>
          <UPageGrid>
            <UPageCard
              title="App configuration"
              description="Set your App’s identity and choose its packages."
              to="/docs/configuration"
            />
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
          </UPageGrid>
        </UPageSection>

        <UPageSection title="Framework basics">
          <p>
            <ULink to="https://nuxt.com/docs/4.x/getting-started/introduction">
              Getting started with Nuxt</ULink
            >
            and
            <ULink to="https://ui.nuxt.com/docs/components"
              >Nuxt UI components</ULink
            >.
          </p>
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
