<template>
  <UPage>
    <UBreadcrumb
      :items="[
        { label: 'Components', to: '/docs/components' },
        { label: 'Developer diagnostics' },
      ]"
    />
    <UPageHeader
      title="Developer diagnostics"
      description="Use FireDiagnosticsDebugPanel to inspect a page’s data during development."
    />

    <UPageBody>
      <UPageSection
        id="example"
        title="Example"
        description="The panel appears in development when it has data to show."
      >
        <FireDiagnosticsDebugPanel
          :objects="exampleObjects"
          :derived="exampleDerived"
          context="Component documentation"
          :launcher="false"
          :include-route="false"
          :open="true"
        />
        <UCard variant="subtle">
          <pre><code>{{ example }}</code></pre>
        </UCard>
        <p>
          Callers provide diagnostic facts. The panel owns its generic title,
          route context and collapsed launcher defaults; it does not acquire
          application records.
        </p>
      </UPageSection>

      <UPageSection
        id="api"
        title="API"
        description="Objects and derived facts are required inputs. Display and contract options are optional."
      >
        <UTable :data="apiRows" :columns="apiColumns" />
      </UPageSection>
    </UPageBody>

    <template #right><UPageAnchors :links="sections" /></template>
  </UPage>
</template>

<script setup lang="ts">
const sections = [
  { label: 'Example', to: '#example' },
  { label: 'API', to: '#api' },
]
const apiColumns = [
  { accessorKey: 'name', header: 'Input' },
  { accessorKey: 'purpose', header: 'Purpose' },
]
const exampleObjects = {
  apps: [{ id: 'fireux-app', name: 'FireUX' }],
}
const exampleDerived = { appCount: 1 }
const example = `<FireDiagnosticsDebugPanel
  :objects="objects"
  :derived="derived"
  context="Project collection"
  :launcher="false"
  :include-route="false"
/>`
const apiRows = [
  { name: 'objects', purpose: 'Required object or array being inspected.' },
  {
    name: 'derived',
    purpose: 'Required derived values; may be an object or scalar.',
  },
  {
    name: 'objectOrigin',
    purpose: 'Passed or fetched label; defaults to passed.',
  },
  {
    name: 'contract / contracts',
    purpose: 'Optional shape contracts checked against supplied objects.',
  },
  {
    name: 'derivedDependencies',
    purpose: 'Optional dependency notes for derived values.',
  },
  {
    name: 'context / parent / title',
    purpose: 'Optional display context; title defaults to Debug.',
  },
  { name: 'open / defaultOpen', purpose: 'Control initial expanded state.' },
  {
    name: 'hideWhenEmpty / launcher',
    purpose: 'Control empty-data visibility and the collapsed launcher.',
  },
  {
    name: 'includeRoute / scope',
    purpose: 'Include route facts or identify an inline diagnostics scope.',
  },
  {
    name: 'opened / closed',
    purpose: 'Emitted when the panel is shown or hidden.',
  },
]

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: 'Developer diagnostics · FireUX components',
  description:
    'Inspect development-only diagnostic data with the shared FireUX Debug Panel.',
})
</script>
