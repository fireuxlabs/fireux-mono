<!-- Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: remove public self-claim controls until verified ownership proof exists. -->
<template>
  <ClientOnly>
    <UPage>
      <UPageHeader
        class="pageheader"
        :title="pageTitle"
        :description="pageDescription"
      />

      <UPageBody class="pagebody">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!place"
          title="Place not found"
          description="This place does not exist or is not public-ready."
          variant="subtle"
        />

        <div v-else class="space-y-4">
          <!-- profile -->
          <PlaceCardsProfile
            v-if="placeProfile"
            :model="placeProfile"
          />

          <!-- dev -->
          <DevJson
            :title="'Place (Public Projection)'"
            context="Place detail page · places/[id] · bounded public projection"
            :data="place"
            :default-open="false"
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <UPage>
        <UPageHeader
          class="pageheader"
          :title="pageTitle"
          description="Saved place details."
        />

        <UPageBody class="pagebody">
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">Loading place…</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePlaceFetch,
  usePlaceInterface,
  usePlaceSeo,
} from '../../composables/fireux/firestore/place/usePlace'

const props = defineProps<{
  locator: string
}>()

const locator = computed(() => String(props.locator || '').trim())
const { place, pending } = usePlaceFetch(locator)
const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.short_address || 'Saved place details.'
)

const { profile } = usePlaceInterface()
const placeProfile = computed(() => profile(place.value))

usePlaceSeo(place)
</script>
