<template>
  <ClientOnly>
    <UPage>
      <UPageHeader :title="pageTitle" :description="pageDescription">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/places"
          >
            Back
          </UButton>

          <UButton
            size="xs"
            color="primary"
            icon="i-lucide-pencil"
            v-if="docId"
            :disabled="!canEdit"
            :to="editTo"
          >
            Edit
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <div v-if="loading" class="py-10 text-sm opacity-70">
          Loading place…
        </div>

        <div v-else-if="!place" class="space-y-2">
          <h1 class="text-lg font-semibold">Place Not Found</h1>
          <p>The place you’re looking for doesn’t exist.</p>
          <NuxtLink to="/places" class="text-primary hover:underline">← Back</NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <div v-if="canEdit" class="flex justify-end">
            <UButton
              size="xs"
              color="primary"
              icon="i-lucide-pencil"
              :to="editTo"
            >
              Edit place
            </UButton>
          </div>
          <PlaceCardsProfile v-if="placeProfile" :model="placeProfile" />

          <DevJson
            v-if="isDev && place"
            :title="'Place (Doc)'"
            context="places/[id]"
            :data="place"
            :default-open="false"
          />

          <DevJson
            v-if="isDev && googleDetails"
            :title="'Place (Google)'"
            context="places/[id]"
            :data="googleDetailsPayload"
            :default-open="false"
          />

          <DevJson
            v-if="isDev && hydratedPlace"
            :title="'Place (Hydrated)'"
            context="places/[id]"
            :data="hydratedPlace"
            :default-open="false"
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading place…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref, watchEffect } from 'vue'
import { fetchPlaceDetails, type PlaceDetailsResult } from '../../composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlacesInterface } from '../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place } from '../../models/objects/place.model'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const { appName } = useFireUXConfig()

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')


const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId ? await firestoreFetchDoc<Place>('places', docId) : null

const place = computed<Place | null>(() => (rawDoc as any)?.value ?? rawDoc ?? null)

const loading = computed(() => !rawDoc && !!docId)
const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.formatted_address || 'Saved place details.'
)
const isDev = import.meta.dev
const { currentUser, isAdmin } = useUser()
const canEdit = computed(() => {
  const claimedBy = String(place.value?.claimed_by ?? '').trim()
  if (!claimedBy) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy)
})

const googleDetails = ref<PlaceDetailsResult | null>(null)
const googleDetailsId = ref<string | null>(null)
const googleDetailsPayload = computed(() => {
  if (!googleDetails.value) return null
  return {
    google: googleDetails.value.google ?? null,
    raw: googleDetails.value.raw ?? null,
  }
})

watchEffect(() => {
  if (!import.meta.client) return
  if (!docId || !place.value) return
  if (googleDetailsId.value === docId) return
  googleDetailsId.value = docId
  void fetchPlaceDetails(docId).then((details) => {
    if (googleDetailsId.value === docId) {
      googleDetails.value = details
    }
  })
})

const hydratedPlace = computed<Place | null>(() => {
  const stored = place.value
  if (!stored) return null
  const details = googleDetails.value
  const google = details?.google
  const raw = details?.raw ?? {}
  const pick = <T>(primary: T | null | undefined, fallback: T | null | undefined) =>
    primary ?? fallback

  return {
    ...stored,
    name: pick(stored.name, google?.name) ?? stored.name,
    formatted_address: pick(stored.formatted_address, google?.formatted_address) ?? stored.formatted_address,
    short_address: pick(stored.short_address, google?.short_address) ?? stored.short_address,
    lat: Number.isFinite(stored.lat) && stored.lat !== 0 ? stored.lat : google?.lat ?? stored.lat,
    lng: Number.isFinite(stored.lng) && stored.lng !== 0 ? stored.lng : google?.lng ?? stored.lng,
    image_url: stored.image_url || google?.image_url || stored.image_url,
    phone: stored.phone || google?.phone || stored.phone,
    website: stored.website || google?.website || stored.website,
    rating: stored.rating || google?.rating || stored.rating,
    rating_count: stored.rating_count || google?.user_ratings_total || stored.rating_count,
    price_level: stored.price_level || (raw as any)?.price_level || stored.price_level,
    types: (stored.types?.length ? stored.types : (raw as any)?.types) ?? stored.types,
    hours_text:
      (stored.hours_text?.length ? stored.hours_text : (raw as any)?.opening_hours?.weekday_text) ??
      stored.hours_text,
    google_maps_url: stored.google_maps_url || (raw as any)?.url || stored.google_maps_url,
  }
})

const { profile } = usePlacesInterface()
const placeProfile = computed(() => profile(hydratedPlace.value))

const editTo = computed(() =>
  docId ? `/places/edit/${encodeURIComponent(docId)}` : '/places'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
