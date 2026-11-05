<template>
  <UContainer>
    <UPage>
      <UBreadcrumb
        :items="[
          { label: 'Patterns', to: '/patterns' },
          { label: 'Page composition' },
        ]"
      />
      <UPageHeader
        title="Page composition"
        description="Build pages with Nuxt UI and small FireUX components."
      />
      <UPageBody>
        <UPageSection id="usage" title="Start with a page">
          <p>
            Use <code>UPageHeader</code> for the title and
            <code>UPageBody</code> for the content. Add <code>UContainer</code>
            if the layout has not already provided one.
          </p>
          <UCard variant="subtle"><pre><code>{{ usageExample }}</code></pre></UCard>
        </UPageSection>
        <UPageSection id="examples" title="Compose a list">
          <p>
            Read the collection once. Pass the records to the list and show
            loading, empty results, and errors using
            <ULink to="/docs/components/state-feedback#state">FireState</ULink>.
            If the list loads more records, keep the current rows visible when
            the next request fails.
          </p>
          <UCard variant="subtle"><pre><code>{{ collectionExample }}</code></pre></UCard>
        </UPageSection>
        <UPageSection id="api" title="Find the API">
          <p>
            Use the <ULink to="https://ui.nuxt.com/docs/components/page" target="_blank">Nuxt UI page reference</ULink>
            for page props and slots. See the
            <ULink to="/docs/components">FireUX component reference</ULink>
            for controls such as the load-more button.
          </p>
        </UPageSection>
        <UPageSection id="data" title="Keep the action with its owner">
          <p>
            Use the domain’s reader and save command. A button can offer an
            action, but the server still checks permission.
          </p>
        </UPageSection>
        <UPageSection id="theme" title="Use the shared theme">
          <p>
            Use the <ULink to="/theme">shared theme</ULink> for colour and spacing.
            Use the layout for navigation shared across pages.
          </p>
        </UPageSection>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'framework', requiresAuth: false })
useSeoMeta({
  title: 'Page composition · FireUX Patterns',
  description: 'Build pages with Nuxt UI and small FireUX components.',
})

const usageExample = `<UPage>
  <UPageHeader title="Apps" />
  <UPageBody>
    <AppCollection :apps="apps" />
  </UPageBody>
</UPage>`

const collectionExample = `<FireState v-bind="page.state" />
<AppCollection v-if="page.ready" :apps="page.apps" />
<FireCollectionPagination
  v-if="page.pagination"
  v-bind="page.pagination"
  @load-more="page.loadMore"
/>`
</script>
