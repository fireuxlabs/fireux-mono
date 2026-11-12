<template>
  <UPage>
    <UBreadcrumb
      :items="[
        { label: 'Components', to: '/docs/components' },
        { label: 'State and feedback' },
      ]"
    />
    <UPageHeader
      title="State and feedback"
      description="Show loading, empty results, and errors."
    />

    <UPageBody>
      <UPageSection
        id="state"
        title="State"
        description="Pass the read outcome to show the matching message."
      >
        <FireState outcome="empty" entity="projects" />
        <UCard variant="subtle">
          <pre><code>{{ stateExample }}</code></pre>
        </UCard>
        <UTable :data="stateApi" :columns="apiColumns" />
        <p>
          The shared outcomes are idle, pending, error, empty and ready.
          FireState renders a message for pending, error and empty; idle and
          ready render nothing. Retry is an emitted event. Use native UAlert or
          UCard for domain-specific messages and actions.
        </p>
      </UPageSection>

      <UPageSection
        id="copy-error"
        title="Copy error"
        description="Let people copy an error message."
      >
        <FireCopyError message="The example could not be loaded." />
        <UCard variant="subtle">
          <pre><code>{{ copyErrorExample }}</code></pre>
        </UCard>
        <UTable :data="copyErrorApi" :columns="apiColumns" />
      </UPageSection>
    </UPageBody>

    <template #right><UPageAnchors :links="sections" /> </template>
  </UPage>
</template>

<script setup lang="ts">
const sections = [
  { label: 'State', to: '#state' },
  { label: 'Copy error', to: '#copy-error' },
]
const apiColumns = [
  { accessorKey: 'name', header: 'Input' },
  { accessorKey: 'purpose', header: 'Purpose' },
]
const stateExample = `<FireState
  :outcome="page.outcome"
  entity="projects"
  :error="page.error"
  retryable
  @retry="page.refresh()"
/>`
const copyErrorExample = `<FireCopyError :message="error.message" />`
const stateApi = [
  { name: 'outcome', purpose: 'Required shared ReadOutcome.' },
  {
    name: 'entity',
    purpose: 'Optional noun used in pending, empty and error copy.',
  },
  {
    name: 'error',
    purpose:
      'Optional error details; otherwise the copy control uses the displayed error message.',
  },
  { name: 'retryable', purpose: 'Show the retry button for an error outcome.' },
  { name: 'retry', purpose: 'Emitted when the retry button is chosen.' },
]
const copyErrorApi = [
  {
    name: 'message',
    purpose: 'Required string copied through the browser clipboard API.',
  },
]

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: 'State and feedback · FireUX components',
  description:
    'Present shared FireUX read outcomes and copyable error messages.',
})
</script>
