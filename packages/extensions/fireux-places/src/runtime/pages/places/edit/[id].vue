<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="placeId ? `/places/${encodeURIComponent(placeId)}` : '/places'"
        >
          Back to details
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-copy"
          :disabled="!placeId"
          aria-label="Copy place id"
          @click="onCopyPlaceId"
        />
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UAlert
          v-else-if="!place"
          color="error"
          variant="soft"
          title="Place not found"
          description="We could not find this place. Return to the places list and try again."
        />

        <div v-else class="space-y-4">
          <PlaceCardsPreview
            v-if="placePreview"
            v-bind="placePreview"
            :show-badges="false"
            :show-body="false"
            :details="placePreviewDetails"
            :map-url="placePreviewMapUrl"
          />
          <UAlert
            v-if="!canEdit"
            color="warning"
            variant="soft"
            title="Claim required"
            description="You can only edit places you’ve claimed. Ask an admin or claim this business first."
          >
            <template #actions>
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                :to="placeId ? `/places/${encodeURIComponent(placeId)}` : '/places'"
              >
                Go to details
              </UButton>
            </template>
          </UAlert>

          <PlaceEdit v-if="canEdit" :place="place" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Editing locked"
            description="Only the claiming user or an admin can edit this place."
          />
        </div>

        <DevJson
          v-if="showDebug && editableFields"
          :title="'Place (Editable)'"
          context="Place edit page · places/edit/[id] · editable fields"
          :data="editableFields"
          :default-open="false"
        />

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading place…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { usePlaceInterface } from '../../../composables/fireux/firestore/place/utils/view/usePlaceInterface'
import { PlaceStorage, type Place } from '../../../models/place.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const route = useRoute()

const raw = route.params.id
const placeId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { firestoreFetchDoc } = useFirestoreRead()
const docRef = placeId
  ? firestoreFetchDoc<Place>(PlaceStorage.collection, placeId)
  : null

const place = computed<Place | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(placeId) && docRef?.value === undefined)
const showDebug = import.meta.dev
const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => place.value?.claimed_by ?? '')
const canEdit = computed(() =>
  Boolean(isAdmin.value || (claimedBy.value && currentUser.value?.id === claimedBy.value))
)

const { preview } = usePlaceInterface()
const placePreview = computed(() => preview(place.value))
const placePreviewDetails = computed(() => {
  const v = place.value
  if (!v) return []
  const details = [
    { label: 'Short name', value: v.short_name ?? '' },
    { label: 'Short address', value: v.short_address ?? '' },
    { label: 'Search term', value: v.search_term ?? '' },
    { label: 'Brand tagline', value: v.brand_tagline ?? '' },
    { label: 'About', value: v.about ?? '' },
    { label: 'Phone', value: v.phone ?? '' },
    { label: 'Website', value: v.website ?? '' },
    { label: 'Price level', value: v.price_level ?? '' },
    { label: 'Rating', value: v.rating ? String(v.rating) : '' },
    { label: 'Rating count', value: v.rating_count ? String(v.rating_count) : '' },
    { label: 'Tags', value: Array.isArray(v.tags) ? v.tags.filter(Boolean).join(', ') : '' },
    { label: 'Types', value: Array.isArray(v.types) ? v.types.filter(Boolean).join(', ') : '' },
    { label: 'Hours', value: Array.isArray(v.hours_text) ? v.hours_text.filter(Boolean).join(' · ') : '' },
    { label: 'Claimed by', value: v.claimed_by ?? '' },
    { label: 'Verified', value: v.verified ? 'Yes' : '' },
  ]

  return details.filter((item) => String(item.value ?? '').trim().length > 0)
})
const placePreviewMapUrl = computed(() => {
  const v = place.value
  if (!v) return ''
  if (v.google_maps_url) return v.google_maps_url
  return ''
})

const toast = useToastify()

async function onCopyPlaceId() {
  if (!placeId) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(placeId)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = placeId
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    toast.success('Place ID copied')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to copy place ID: ${msg}`)
  }
}

const pageTitle = computed(() => place.value?.name || 'Edit place')
const pageSubtitle = computed(() => (placeId ? `Place ID: ${placeId}` : 'Edit a place'))

const editableFields = computed(() => {
  const v = place.value
  if (!v) return null
  const base = {
    id: v.id ?? '',
    image_url: v.image_url ?? (v as any).place_image ?? '',
    image_shade: v.image_shade ?? 'none',
    short_name: v.short_name ?? '',
    claimed_by: v.claimed_by ?? '',
  }

  if (v.source === 'manual') {
    return {
      ...base,
      name: v.name ?? '',
      formatted_address: v.formatted_address ?? '',
      search_term: v.search_term ?? '',
      lat: v.lat ?? 0,
      lng: v.lng ?? 0,
    }
  }

  return base
})
</script>
