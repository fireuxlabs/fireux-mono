<template>
  <UPage>
    <UPageHeader
      headline="FireUX Library"
      title="Composables"
      description="Focused runtime APIs for reading and using FireUX data."
    />

    <UPageBody>
      <section>
        <h2>App</h2>
        <p>
          Start with the configured App. Its read API returns the App record and
          the state of the read; Vue computed values remain with the consumer.
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
      </section>
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
