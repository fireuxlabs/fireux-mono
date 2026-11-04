<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside><FrameworkComponentDocsNav /></UPageAside>
      </template>

      <UBreadcrumb
        :items="[
          { label: 'Components', to: '/components' },
          { label: 'Surfaces and disclosure' },
        ]"
      />
      <UPageHeader
        title="Surfaces and disclosure"
        description="These Core components provide a shared interactive surface or disclosure presentation. Native Nuxt UI behavior remains underneath."
      />

      <UPageBody>
        <UPageSection
          id="action-surface"
          title="Action surface"
          description="FireActionSurface renders supplied content as a link, button or static surface. It does not choose destination policy or own the action's domain behavior."
        >
          <FireActionSurface to="/components">
            <span>Open the component library</span>
          </FireActionSurface>
          <FireActionSurface action @activate="activationCount++">
            <span>Activate this example</span>
          </FireActionSurface>
          <p>Activated {{ activationCount }} times.</p>
          <UCard variant="subtle">
            <pre><code>{{ actionSurfaceExample }}</code></pre>
          </UCard>
          <UTable :data="actionSurfaceApi" :columns="apiColumns" />
        </UPageSection>

        <UPageSection
          id="disclosure-panel"
          title="Disclosure panel"
          description="FireDisclosurePanel composes Nuxt UI's UCollapsible with a labelled trigger for optional details."
        >
          <FireDisclosurePanel
            v-model:open="panelOpen"
            title="Optional details"
            description="Additional information for this example."
            icon="i-lucide-info"
          >
            <p>Consumers supply the content revealed by the panel.</p>
          </FireDisclosurePanel>
          <UCard variant="subtle">
            <pre><code>{{ disclosurePanelExample }}</code></pre>
          </UCard>
          <UTable :data="disclosurePanelApi" :columns="apiColumns" />
          <p>
            Use <ULink to="/components/disclosure-card">Disclosure Card</ULink>
            when the disclosure needs the shared card-cell surface.
          </p>
        </UPageSection>
      </UPageBody>

      <template #right><UPageAnchors :links="sections" /></template>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const sections = [
  { label: 'Action surface', to: '#action-surface' },
  { label: 'Disclosure panel', to: '#disclosure-panel' },
]
const apiColumns = [
  { accessorKey: 'name', header: 'Input' },
  { accessorKey: 'purpose', header: 'Purpose' },
]
const activationCount = ref(0)
const panelOpen = ref(false)
const actionSurfaceExample = `<FireActionSurface to="/projects/123">
  <ProjectSummary />
</FireActionSurface>

<FireActionSurface action @activate="openProjectMenu">
  <ProjectSummary />
</FireActionSurface>`
const disclosurePanelExample = `<FireDisclosurePanel
  v-model:open="detailsOpen"
  title="Additional details"
  description="Optional supporting information."
  icon="i-lucide-info"
>
  <ProjectDetails />
</FireDisclosurePanel>`
const actionSurfaceApi = [
  { name: 'to', purpose: 'Optional route; renders the surface as a link.' },
  {
    name: 'action',
    purpose: 'Render a button when no destination is supplied.',
  },
  { name: 'disabled', purpose: 'Disable link or button activation.' },
  { name: 'default slot', purpose: 'Surface content.' },
  { name: 'activate', purpose: 'Emitted when an action button is activated.' },
]
const disclosurePanelApi = [
  { name: 'title', purpose: 'Required trigger title.' },
  {
    name: 'description / icon',
    purpose: 'Optional supporting text and leading icon.',
  },
  {
    name: 'open / defaultOpen',
    purpose: 'Optional controlled or initial open state.',
  },
  {
    name: 'disabled / unmountOnHide',
    purpose: 'Forwarded disclosure behavior.',
  },
  {
    name: 'color / variant / size / block',
    purpose: 'Trigger button options from Nuxt UI.',
  },
  { name: 'update:open', purpose: 'Emitted when open state changes.' },
  { name: 'default slot', purpose: 'Content revealed by the disclosure.' },
]

definePageMeta({ layout: 'framework', requiresAuth: false })
useSeoMeta({
  title: 'Surfaces and disclosure · FireUX components',
  description: 'Use shared FireUX action surfaces and disclosure panels.',
})
</script>
