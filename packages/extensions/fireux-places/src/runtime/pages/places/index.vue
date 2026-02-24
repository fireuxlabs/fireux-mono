<template>
  <UPage>
    <UPageHeader class="border-b-0" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <PlaceCTA />
      <PlaceCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePlaces } from '../../composables/fireux/firestore/place/usePlaces'

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
const pageDescription = ''

useHead({ title: `${appName} | ${pageTitle}` })

const { collection } = usePlaces<Record<string, any>>()
</script>
