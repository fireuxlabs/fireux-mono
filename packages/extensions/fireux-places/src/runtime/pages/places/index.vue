<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-info"
          to="/places/learn-more"
        >
          Learn more
        </UButton>

        <UButton
          size="xs"
          color="primary"
          icon="i-lucide-plus"
          to="/places/create"
        >
          Create
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <OrganismsObjectsPlaceSearchSection
        :type="placeType"
        @confirmed="onPlaceCreated"
      />

      <OrganismsObjectsPlaceCollectionView
        :keyword="keyword"
        :type="placeType"
        :title="collectionTitle"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { normalizePlaceType } from '../../composables/fireux/firestore/objects/place/utils/placeCollections'

definePageMeta({
  layout: 'default',
  title: 'Places',
  description: 'Saved places.',
  nav: {
    key: 'places',
    label: 'Places',
    icon: 'i-lucide-map-pin',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'PlacesIndexPage',
  head: { title: 'Places' },
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Places` })

const route = useRoute()
const router = useRouter()

const keyword = computed<string | null>(() => {
  const raw = route.query.word
  const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  return value ? value : null
})

const placeType = computed<string | null>(() =>
  normalizePlaceType(route.query.type)
)

const pageTitle = 'Places'
const pageDescription =
  'Create a place and browse all places available to this runtime.'

const collectionTitle = computed(() => {
  if (!keyword.value) return 'Places'
  return `Places: ${keyword.value}`
})

async function onPlaceCreated() {
  // Nudge the route so the list refreshes immediately in dev.
  await router.replace({ query: { ...route.query } })
}
</script>

