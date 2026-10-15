<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-briefcase-business"
    secondary-label="For professionals"
  >
    <ProfessionalDirectory />

    <template #secondary>
      <!-- Profile CTA family: Professional is a profile layer attached to a User. -->
      <ProfessionalCurrent />
    </template>
  </CollectionPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  tag: 'professionals',
  nav: {
    visibility: { profiles: ['professional'] },
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 62,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description:
    'Meet skilled professionals and explore the work they bring to the network.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Professionals'
const pageDescription =
  'Meet skilled professionals and explore the work they bring to the network.'

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/professionals',
})
</script>
