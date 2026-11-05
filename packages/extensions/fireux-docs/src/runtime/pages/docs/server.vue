<template>
  <UPage>
    <UPageHeader
      title="Server"
      description="Return public App data and run protected commands on the server."
    />

    <UPageBody>
      <UPageSection title="Return public App data">
        <p>
          FireUX Core’s <code>GET /api/app/meta</code> calls
          <code>readAppMeta</code> for the configured App. The reader returns
          selected public fields, including legal notices and SEO metadata.
        </p>
        <UCard variant="subtle">
          <pre><code>{{ readExample }}</code></pre>
        </UCard>
      </UPageSection>

      <UPageSection title="Protect writes">
        <p>
          A FireUX route hands protected writes to a named command owned by the
          App or package. The server verifies the caller and checks their
          permission for the exact target before making a change.
        </p>
      </UPageSection>

      <UPageSection title="Framework basics">
        <p>
          <ULink to="https://nuxt.com/docs/4.x/directory-structure/server"
            >Nuxt server routes</ULink
          >
          ·
          <ULink to="https://nuxt.com/docs/4.x/getting-started/data-fetching"
            >Nuxt data fetching</ULink
          >
        </p>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'Server' })
useSeoMeta({
  title: 'Server · FireUX Docs',
  description: 'Public App data and protected FireUX server commands.',
})

const readExample = `const { data, error, status } = await useFetch('/api/app/meta')`
</script>
