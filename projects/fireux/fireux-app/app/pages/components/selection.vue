<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside><FrameworkComponentDocsNav /></UPageAside>
      </template>

      <UBreadcrumb
        :items="[
          { label: 'Components', to: '/components' },
          { label: 'Selection' },
        ]"
      />
      <UPageHeader
        title="Selection"
        description="Core offers two focused selection controls. Their consumer supplies the options, eligibility and persistence."
      />

      <UPageBody>
        <UPageSection
          id="multi-select"
          title="Multi-select"
          description="FireMultiSelect presents short visible lists of toggle choices."
        >
          <FireMultiSelect
            v-model="selectedServices"
            label="Services"
            :items="serviceOptions"
          />
          <p>Selected: {{ selectedServices.join(', ') || 'none' }}</p>
          <UCard variant="subtle">
            <pre><code>{{ multiSelectExample }}</code></pre>
          </UCard>
          <UTable :data="multiSelectApi" :columns="apiColumns" />
          <p>
            For searchable or long lists, use a native Nuxt UI selection
            component such as USelectMenu or UListbox.
          </p>
        </UPageSection>

        <UPageSection
          id="segmented-selector"
          title="Segmented selector"
          description="FireSegmentedSelector presents one choice from a compact set using Nuxt UI's radio group behavior."
        >
          <FireSegmentedSelector
            v-model="selectedView"
            label="Display mode"
            :items="viewOptions"
          />
          <p>Selected: {{ selectedView }}</p>
          <UCard variant="subtle">
            <pre><code>{{ segmentedExample }}</code></pre>
          </UCard>
          <UTable :data="segmentedApi" :columns="apiColumns" />
        </UPageSection>
      </UPageBody>

      <template #right><UPageAnchors :links="sections" /></template>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const sections = [
  { label: 'Multi-select', to: '#multi-select' },
  { label: 'Segmented selector', to: '#segmented-selector' },
]
const apiColumns = [
  { accessorKey: 'name', header: 'Input' },
  { accessorKey: 'purpose', header: 'Purpose' },
]
const serviceOptions = [
  { label: 'Dine in', value: 'dine-in' },
  { label: 'Takeaway', value: 'takeaway' },
  { label: 'Delivery', value: 'delivery' },
]
const selectedServices = ref(['dine-in'])
const viewOptions = [
  { label: 'List', value: 'list' },
  { label: 'Grid', value: 'grid' },
]
const selectedView = ref('list')
const multiSelectExample = `<script setup lang="ts">
const selected = ref(['dine-in'])
const services = [
  { label: 'Dine in', value: 'dine-in' },
  { label: 'Takeaway', value: 'takeaway' }
]
<\/script>

<FireMultiSelect
  v-model="selected"
  label="Services"
  :items="services"
/>`
const segmentedExample = `<FireSegmentedSelector
  v-model="selectedView"
  label="Display mode"
  :items="[
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' }
  ]"
/>`
const multiSelectApi = [
  {
    name: 'model',
    purpose: 'Required string array updated as choices are toggled.',
  },
  { name: 'label', purpose: 'Required accessible group label.' },
  {
    name: 'items',
    purpose:
      'Required items with label and value; description and disabled are optional.',
  },
  { name: 'disabled', purpose: 'Disable all choices.' },
]
const segmentedApi = [
  { name: 'model', purpose: 'Required selected string value.' },
  { name: 'label', purpose: 'Required accessible radio group label.' },
  {
    name: 'items',
    purpose: 'Required items with label and value; each item may be disabled.',
  },
  { name: 'disabled', purpose: 'Disable the full group.' },
]

definePageMeta({ layout: 'framework', requiresAuth: false })
useSeoMeta({
  title: 'Selection · FireUX components',
  description:
    'Choose between shared FireUX selection controls for short visible lists and compact single-choice groups.',
})
</script>
