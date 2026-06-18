<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Browse canonical place records for this runtime."
    />

    <UPageBody>
      <PlaceCTA />

      <PlaceCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Places',
  description: 'Saved places.',
  nav: {
    key: 'places',
    label: 'Places',
    icon: 'i-lucide-map-pin',
    order: 25,
    desktop: false,
    mobile: false,
    layouts: ['default', 'landing'],
  },
  name: 'PlacesIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Places'
useHead({ title: `${appName} | ${pageTitle}` })
</script>
