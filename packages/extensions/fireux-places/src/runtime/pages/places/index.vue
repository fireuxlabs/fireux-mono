<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <ul v-if="places.length" class="space-y-2">
        <li v-for="(place, index) in places" :key="placeKey(place, index)">
          <p class="text-sm font-medium">
            {{ placeLabel(place, index) }}
          </p>
        </li>
      </ul>

      <p v-else class="text-sm text-slate-500">No places found.</p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePlaces } from '../../composables/fireux/firestore/objects/place/usePlaces'

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
  head: { title: 'Places' },
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Places` })

const route = useRoute()

const keyword = computed<string | null>(() => {
  const raw = route.query.word
  const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  return value ? value : null
})

const { collection } = usePlaces<Record<string, any>>({ keyword })

const places = computed(() => collection.value ?? [])

const pageTitle = computed(() => {
  if (!keyword.value) return 'Places'
  return `Places: ${keyword.value}`
})

const pageDescription = computed(() => {
  if (!keyword.value) return 'Saved places.'
  return `Saved places for “${keyword.value}”.`
})

function placeKey(place: Record<string, any>, index: number) {
  return (
    place?.id ??
    place?.place_id ??
    place?.google_place_id ??
    place?.slug ??
    index
  )
}

function placeLabel(place: Record<string, any>, index: number) {
  return (
    place?.name ??
    place?.title ??
    place?.label ??
    place?.place_id ??
    place?.id ??
    `Place ${index + 1}`
  )
}
</script>
