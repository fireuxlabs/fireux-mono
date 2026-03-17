<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Places index"
        description="Browse canonical place records for this runtime and use the place creation flow when a new location needs to be captured."
        family="special"
        source="places collection"
        :count-label="`${collection.length} place${collection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />
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
const pageDescription = 'Canonical place index for the current runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

const { collection } = usePlaces<Record<string, any>>()
const actions = [
  {
    label: 'Create',
    cta: 'Create place',
    to: '/places/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Related',
    cta: 'Browse kitchens',
    to: '/kitchens',
    icon: 'i-lucide-chef-hat',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/places/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
