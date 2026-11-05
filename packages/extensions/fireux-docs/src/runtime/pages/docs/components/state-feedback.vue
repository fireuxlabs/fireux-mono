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
          ready render nothing. Retry is an emitted event.
        </p>
      </UPageSection>

      <UPageSection
        id="state-card"
        title="State card"
        description="Show a read outcome in a card or banner."
      >
        <FireStateCard entity="project" kind="document" state="empty" />
        <UCard variant="subtle">
          <pre><code>{{ stateCardExample }}</code></pre>
        </UCard>
        <UTable :data="stateCardApi" :columns="apiColumns" />
        <p>
          StateCard is a separate existing presentation component. Its
          loading, empty and error contract has not been migrated to
          FireState's ReadOutcome API.
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

    <template #right><UPageAnchors :links="sections" /></template>
  </UPage>
</template>

<script setup lang="ts">
const sections = [
  { label: 'State', to: '#state' },
  { label: 'State card', to: '#state-card' },
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
const stateCardExample = `<FireStateCard
  entity="project"
  kind="document"
  state="empty"
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
      'Optional error details; enables the copy control on an error outcome.',
  },
  { name: 'retryable', purpose: 'Show the retry button for an error outcome.' },
  { name: 'retry', purpose: 'Emitted when the retry button is chosen.' },
]
const stateCardApi = [
  {
    name: 'entity',
    purpose: 'Optional noun used by the default title and description.',
  },
  { name: 'kind', purpose: 'Document or collection; defaults to collection.' },
  {
    name: 'state',
    purpose: 'Optional loading, empty or error state; defaults to empty.',
  },
  {
    name: 'surface',
    purpose: 'Card, bare or collection presentation; defaults to card.',
  },
  {
    name: 'title / description / icon',
    purpose: 'Optional overrides for the default content.',
  },
  {
    name: 'loading',
    purpose: 'Convenience flag that takes precedence over state.',
  },
  {
    name: 'layout / uppercase',
    purpose: 'Card or banner presentation and optional banner title casing.',
  },
  {
    name: 'title, description, actions slots',
    purpose: 'Optional content overrides and actions.',
  },
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
