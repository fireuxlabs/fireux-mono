<template>
  <UPage>
    <UPageHeader
      title="Components"
      description="Examples and reference for FireUX components."
    />

    <UPageBody>
      <UPageGrid>
        <UPageCard
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          :title="section.title"
          :description="section.description"
        />
        <UPageCard
          v-for="entry in fireuxDocsCatalogue"
          :key="entry.slug"
          :to="`/docs/components/${entry.slug}`"
          :title="entry.name"
          :description="entry.description"
        />
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { fireuxDocsCatalogue } from '../../../models/catalogue'

const sections = [
  {
    title: 'Collections',
    description: 'Build list headers, rows, and load-more controls.',
    to: '/docs/components/collections',
  },
  {
    title: 'State and feedback',
    description: 'Show loading, empty results, and errors.',
    to: '/docs/components/state-feedback',
  },
  {
    title: 'Selection',
    description: 'Let people choose one or several options.',
    to: '/docs/components/selection',
  },
  {
    title: 'Surfaces and disclosure',
    description: 'Make a surface clickable or reveal extra details.',
    to: '/docs/components/surfaces',
  },
  {
    title: 'Disclosure Card',
    description: 'Reveal details inside a card.',
    to: '/docs/components/disclosure-card',
  },
  {
    title: 'Debug panel',
    description: 'Inspect a page’s data while developing.',
    to: '/docs/components/diagnostics',
  },
]

definePageMeta({ layout: 'docs', title: 'Components' })
useSeoMeta({
  title: 'Components · FireUX Docs',
  description: 'Examples and reference for FireUX components.',
})
</script>
