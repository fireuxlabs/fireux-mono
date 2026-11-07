<template>
  <UPage>
    <UPageHeader
      title="Layouts"
      description="Share navigation across App pages with FireuxApp and Workspace."
    />

    <UPageBody>
      <UPageSection title="What FireuxApp provides">
        <p>
          Core’s <code>FireuxApp</code> sets up Nuxt UI’s <code>UApp</code> and
          renders ordinary routes in a Nuxt layout. Workspace routes share a
          sidebar, page header and breadcrumbs. Each Workspace page supplies its
          own content.
        </p>
      </UPageSection>

      <UPageSection title="Choose a layout">
        <p>
          Core provides <code>default</code> for ordinary site pages,
          <code>landing</code> for marketing pages, <code>dashboard</code> for
          signed-in navigation, <code>auth</code> for sign-in and
          <code>diagnostics</code> for inspection tools.
        </p>
        <p>
          The <ULink to="/about">FireUX About page</ULink> uses Core’s
          <code>landing</code> layout for its shared header and footer.
        </p>
        <UCard variant="subtle">
          <pre><code>{{ example }}</code></pre>
        </UCard>
      </UPageSection>

      <UPageSection title="Framework basics">
        <p>
          <ULink to="https://nuxt.com/docs/4.x/directory-structure/app/layouts"
            >Nuxt layouts</ULink
          >
          ·
          <ULink to="https://ui.nuxt.com/docs/components/app"
            >Nuxt UI App</ULink
          >
        </p>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'Layouts' })
useSeoMeta({
  title: 'Layouts · FireUX Docs',
  description: 'How FireuxApp, Nuxt layouts and FireUX Core fit together.',
})

const example = `definePageMeta({ layout: 'landing' })`
</script>
