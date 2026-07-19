<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Browse published apps across the FireUX platform."
    />

    <UPageBody>
      <!-- Core/platform CTA family: AppCTA starts onboarding; My apps is scoped, browse is the public collection. -->
      <AppCTA :controller="appsController" />
      <AppCollectionMine :controller="appsController" />

      <AppCollectionManager
        :controller="appsController"
        title="Platform directory"
        description="Published App projections from their owning Projects and Ecosystems."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePlatformAppDirectory } from '../../composables/usePlatformDirectory'

const appsController = usePlatformAppDirectory()

definePageMeta({
  tag: 'apps',
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Apps',
  description: 'Browse published FireUX apps.',
  layout: 'default',
  name: 'FireuxAppsIndexPage',
})

useSeoMeta({
  title: 'FireUX Apps',
  description:
    'Browse published apps across the FireUX platform, including direct Project Apps and Ecosystem Apps.',
})

</script>
