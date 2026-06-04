<template>
  <ClientOnly>
    <UPage>
      <UPageHeader
        class="pageheader"
        :title="pageTitle"
        :description="pageDescription"
      />

      <UPageBody class="pagebody">
        <UPageCard v-if="loading" variant="subtle">
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

          <!-- claim -->
          <PlacePublicClaim :place="place" :id="id" />

          <!-- dev -->
          <DevJson
            v-if="isDev && place"
            :title="'Place (Doc)'"
            context="Place detail page · places/[id] · raw place doc"
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
  id: string
}>()

const { place, pending: loading } = usePlaceFetch(computed(() => props.id))
const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.formatted_address || 'Saved place details.'
)
const isDev = import.meta.dev

const { profile } = usePlaceInterface()
const placeProfile = computed(() => profile(place.value))

usePlaceSeo(place)
</script>
