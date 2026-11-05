<template>
  <UPage>
    <UPageHeader
      headline="FireUX Library"
      title="Composables"
      description="Read FireUX records with the right App scope and a shared set of read outcomes."
    />

    <UPageBody>
      <UPageSection title="Read the configured App">
        <p>
          <code>useAppRead()</code> waits for sign-in, checks that the response
          belongs to the configured App, and tells the page whether the read is
          idle, pending, in error, empty, or ready.
        </p>
        <UPageGrid>
          <UPageCard
            to="/docs/composables/useApp#read"
            title="App"
            description="Read the App and use its focused composables."
          >
            <code>useAppRead(appId)</code>
          </UPageCard>
        </UPageGrid>
      </UPageSection>
      <p>
        For standard request handling, see
        <ULink to="https://nuxt.com/docs/4.x/getting-started/data-fetching"
          >Nuxt data fetching</ULink
        >. For how composables become available in a page, see
        <ULink to="https://nuxt.com/docs/4.x/guide/concepts/auto-imports"
          >Nuxt auto-imports</ULink
        >.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'Composables' })
useSeoMeta({
  title: 'Composables · FireUX Docs',
  description: 'Reference for FireUX runtime composables.',
})
</script>
