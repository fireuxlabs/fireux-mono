<template>
  <UPage>
    <UBreadcrumb
      :items="[
        { label: 'Components', to: '/docs/components' },
        { label: 'Selection' },
      ]"
    />
    <UPageHeader
      title="Selection"
      description="Give people a short list of choices."
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
          For searchable or long lists, use a native Nuxt UI selection component
          such as USelectMenu or UListbox.
        </p>
      </UPageSection>

      <UPageSection id="segmented-selector" title="Single choice">
        <p>
          Use
          <ULink to="https://ui.nuxt.com/docs/components/radio-group"
            >Nuxt UI RadioGroup</ULink
          >
          when people can pick one option.
        </p>
      </UPageSection>
    </UPageBody>

    <template #right><UPageAnchors :links="sections" /></template>
  </UPage>
</template>

<script setup lang="ts">
const sections = [
  { label: 'Multi-select', to: '#multi-select' },
  { label: 'Single choice', to: '#segmented-selector' },
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

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: 'Selection · FireUX components',
  description:
    'Use FireUX multi-select for short lists and Nuxt UI RadioGroup for single choices.',
})
</script>
