<template>
  <UPage>
    <UPageHeader
      title="Pages"
      description="Build a Nuxt page with FireUX collection states and pagination."
    />

    <UPageBody>
      <UPageSection title="Compose a collection page">
        <p>
          Read the collection once in a composable and pass the records to the
          list. FireUX provides <code>FireState</code> for loading, empty
          results and errors, and <code>FireCollectionPagination</code> for the
          load-more control.
        </p>
        <p>
          The <ULink to="/apps">Apps directory</ULink> uses this pattern. See
          <ULink to="/patterns/page-composition">Page composition</ULink> for
          the code.
        </p>
      </UPageSection>

      <UPageSection title="Framework basics">
        <p>
          <ULink to="https://nuxt.com/docs/4.x/directory-structure/app/pages"
            >Nuxt pages and routing</ULink
          >
          ·
          <ULink to="https://ui.nuxt.com/docs/components/page"
            >Nuxt UI Page</ULink
          >
        </p>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'Pages' })
useSeoMeta({
  title: 'Pages · FireUX Docs',
  description:
    'Build a Nuxt page with FireUX collection states and pagination.',
})
</script>
