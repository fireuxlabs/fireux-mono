<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside><FrameworkComponentDocsNav /></UPageAside>
      </template>

      <UBreadcrumb
        :items="[
          { label: 'Components', to: '/components' },
          { label: 'Collections' },
        ]"
      />
      <UPageHeader
        title="Collections"
        description="Core presentation components for collection cells, section headings, rows and pagination. Readers and record meaning stay with their owning domains."
      />

      <UPageBody>
        <UPageSection
          id="cell"
          title="Collection cell"
          description="FireCollectionCell renders one supplied cell model. The list supplies records, search, filtering and navigation policy."
        >
          <FireCollectionCell :cell="cell" />
          <UCard variant="subtle">
            <pre><code>{{ cellExample }}</code></pre>
          </UCard>
          <UTable :data="cellApi" :columns="apiColumns" />
        </UPageSection>

        <UPageSection
          id="header"
          title="Collection header"
          description="FireCollectionHeader owns the collection section title and optional controls slot. It is separate from the route heading."
        >
          <FireCollectionHeader
            title="Example collection"
            description="A short description of the collection."
          >
            <template #controls>
              <UButton label="Create item" color="neutral" variant="outline" />
            </template>
          </FireCollectionHeader>
          <UCard variant="subtle">
            <pre><code>{{ headerExample }}</code></pre>
          </UCard>
          <UTable :data="headerApi" :columns="apiColumns" />
        </UPageSection>

        <UPageSection
          id="pagination"
          title="Collection pagination"
          description="FireCollectionPagination presents load-more availability and pagination errors. It emits an event and never fetches records."
        >
          <FireCollectionPagination
            :has-more="true"
            :loading="false"
            @load-more="loadMoreCount++"
          />
          <p>Load-more requested {{ loadMoreCount }} times.</p>
          <UCard variant="subtle">
            <pre><code>{{ paginationExample }}</code></pre>
          </UCard>
          <UTable :data="paginationApi" :columns="apiColumns" />
        </UPageSection>

        <UPageSection
          id="row"
          title="Collection row"
          description="FireCollectionRow aligns supplied content, an optional value and optional actions. The surrounding list owns its semantics and separators."
        >
          <FireCollectionRow>
            <span>Example item</span>
            <template #value>CHF 12</template>
            <template #actions>
              <UButton label="Edit" color="neutral" variant="ghost" size="sm" />
            </template>
          </FireCollectionRow>
          <UCard variant="subtle">
            <pre><code>{{ rowExample }}</code></pre>
          </UCard>
          <UTable :data="rowApi" :columns="apiColumns" />
        </UPageSection>
      </UPageBody>

      <template #right><UPageAnchors :links="sections" /></template>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const sections = [
  { label: 'Collection cell', to: '#cell' },
  { label: 'Collection header', to: '#header' },
  { label: 'Collection pagination', to: '#pagination' },
  { label: 'Collection row', to: '#row' },
]
const apiColumns = [
  { accessorKey: 'name', header: 'Input' },
  { accessorKey: 'purpose', header: 'Purpose' },
]
const cell = {
  title: 'Example place',
  description: 'A public profile presented by its owning domain.',
  to: '/components/collections',
  imageText: 'EP',
  imageStyle: 'avatar' as const,
  meta: 'Ringgenberg',
  badges: ['Open'],
  actionLabel: 'View place',
}
const cellExample = `<FireCollectionCell
  :cell="{
    title: 'Example place',
    description: 'A public profile presented by its owning domain.',
    to: '/components/collections',
    imageText: 'EP',
    imageStyle: 'avatar',
    meta: 'Ringgenberg',
    badges: ['Open'],
    actionLabel: 'View place'
  }"
/>`
const headerExample = `<FireCollectionHeader
  title="Suppliers"
  description="Find suppliers and explore their catalogues."
>
  <template #controls>
    <UButton label="Add supplier" />
  </template>
</FireCollectionHeader>`
const paginationExample = `<FireCollectionPagination
  :has-more="page.hasMore"
  :loading="page.loadingMore"
  :error="page.nextPageError"
  @load-more="page.loadMore"
/>`
const rowExample = `<FireCollectionRow>
  <span>{{ item.name }}</span>
  <template #value>{{ item.total }}</template>
  <template #actions>
    <UButton label="Edit" />
  </template>
</FireCollectionRow>`
const loadMoreCount = ref(0)
const cellApi = [
  {
    name: 'cell',
    purpose: 'Required CollectionCellData with title and destination.',
  },
  {
    name: 'image fields',
    purpose:
      'Optional image, avatar/cover style, fit, fallback icon, text and background.',
  },
  {
    name: 'content fields',
    purpose: 'Optional description, metadata, badges and action label.',
  },
]
const headerApi = [
  { name: 'title', purpose: 'Required collection section heading.' },
  { name: 'description', purpose: 'Optional supporting copy.' },
  { name: 'eyebrow', purpose: 'Optional label; defaults to Browse.' },
  { name: 'compact', purpose: 'Use the compact heading scale when true.' },
  {
    name: 'controls slot',
    purpose: 'Optional controls aligned with the heading.',
  },
]
const paginationApi = [
  {
    name: 'hasMore',
    purpose: 'Required flag that controls load-more visibility.',
  },
  { name: 'loading', purpose: 'Optional busy state for the button.' },
  {
    name: 'error',
    purpose: 'Optional next-page error shown through FireState.',
  },
  {
    name: 'load-more',
    purpose: 'Emitted when the user requests another page.',
  },
]
const rowApi = [
  {
    name: 'as',
    purpose: 'Optional article, div or li root; defaults to article.',
  },
  { name: 'default slot', purpose: 'Main row content.' },
  { name: 'value slot', purpose: 'Optional right-aligned value.' },
  { name: 'actions slot', purpose: 'Optional trailing actions.' },
]

definePageMeta({ layout: 'framework', requiresAuth: false })
useSeoMeta({
  title: 'Collections · FireUX components',
  description:
    'Use FireUX Core collection presentation components with domain-owned data and commands.',
})
</script>
