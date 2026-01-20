<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <PlaceCTA :type="placeType" @confirmed="onPlaceCreated" />
      <PlaceCollectionManager :cards="placeCards" />
      <UCard v-if="showDebug">
        <DevJson
          :title="'Places (JSON)'"
          :data="placesDebugPayload"
          :default-open="false"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { usePlaces } from '../../composables/fireux/firestore/objects/place/usePlaces'
import { normalizePlaceType } from '../../composables/fireux/firestore/objects/place/utils/placeCollections'
import { usePlacesInterface } from '../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

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
  'Create a place and browse canonical places available to this runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

const { collection } = usePlaces<Record<string, any>>({ keyword, type: placeType })
const { card: makeCard } = usePlacesInterface()

const placeCards = computed(() =>
  (collection.value ?? [])
    .map((place) => makeCard(place as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const showDebug = import.meta.dev
const placesDebugPayload = computed(() => ({
  totalPlaces: collection.value?.length ?? 0,
  places: collection.value ?? [],
}))

async function onPlaceCreated() {
  // Nudge the route so the list refreshes immediately in dev.
  await router.replace({ query: { ...route.query } })
}
</script>

