<template>
  <UPage>
    <UPageHeader
      title="Components"
      description="Use Nuxt UI controls and add FireUX components for shared App behavior."
    />

    <UPageBody>
      <p>
        Use Nuxt UI for buttons, inputs, and dialogs. FireUX Core adds the
        shared behavior around them, such as showing read outcomes and saving
        edits in place.
      </p>
      <p>
        See
        <ULink to="https://nuxt.com/docs/4.x/directory-structure/app/components"
          >Nuxt components</ULink
        >
        for component discovery and the
        <ULink to="https://ui.nuxt.com/docs/components"
          >Nuxt UI catalogue</ULink
        >
        for controls and their APIs.
      </p>
      <UPageSection
        v-for="group in groups"
        :key="group.title"
        :title="group.title"
      >
        <UPageGrid>
          <UPageCard
            v-for="guide in group.guides"
            :key="guide.to"
            :to="guide.to"
            :title="guide.title"
            :description="guide.description"
          />
        </UPageGrid>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const groups = [
  {
    title: 'Read and list records',
    guides: [
      {
        title: 'State and feedback',
        description: 'Show a FireUX reader’s loading, empty, or error state.',
        to: '/docs/components/state-feedback',
      },
      {
        title: 'Collections',
        description:
          'Compose records, rows, and load-more controls around one reader.',
        to: '/docs/components/collections',
      },
    ],
  },
  {
    title: 'Edit in place',
    guides: [
      {
        title: 'Edit a text field',
        description:
          'Display a saved value, open an edit, and handle save or cancel.',
        to: '/docs/components/editable-text',
      },
      {
        title: 'Replace an image',
        description:
          'Show the current image and pass a selected file to your App.',
        to: '/docs/components/editable-image-picker',
      },
    ],
  },
  {
    title: 'Compose a page or flow',
    guides: [
      {
        title: 'Surfaces and disclosure',
        description:
          'Give a record surface an action or reveal optional details.',
        to: '/docs/components/surfaces',
      },
      {
        title: 'Create shell',
        description: 'Give a create form separate Write and Preview tabs.',
        to: '/docs/components/create-shell',
      },
      {
        title: 'Onboarding shell',
        description: 'Show progress and content for the current setup step.',
        to: '/docs/components/onboarding-system',
      },
    ],
  },
  {
    title: 'More examples',
    guides: [
      {
        title: 'Selection',
        description: 'Find controls for single and multiple choices.',
        to: '/docs/components/selection',
      },
      {
        title: 'Debug panel',
        description: 'Inspect a page’s data while developing.',
        to: '/docs/components/diagnostics',
      },
    ],
  },
]

definePageMeta({ layout: 'docs', title: 'Components' })
useSeoMeta({
  title: 'Components · FireUX Docs',
  description: 'Examples and reference for FireUX components.',
})
</script>
