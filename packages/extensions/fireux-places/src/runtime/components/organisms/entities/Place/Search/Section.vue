<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <!-- Search input -->
      <PlaceSearchBar v-model="query" />

      <!-- Selected place -->
      <PlaceSearchSelected
        v-if="selected"
        :place="selected"
        :confirming="isConfirming"
        :claiming="isClaiming"
        :confirm-label="confirmLabel"
        :existing-note="existingNote"
        @clear="clearSelection"
        @confirm="onConfirm"
        @claim="onClaim"
      />

      <!-- Suggestions -->
      <PlaceSearchDropdown
        v-else-if="results.length"
        :cells="results"
        @select="select"
      />

      <!-- Status messages -->
      <p v-if="isSearching" class="text-xs text-muted">Searching…</p>
      <p v-else-if="showEmpty" class="text-xs text-muted">
        No results yet—try another name.
      </p>
    </UCard>

  </section>
</template>

<script setup lang="ts">
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref } from 'vue'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../../../../../composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlacesSearch } from '../../../../../composables/fireux/firestore/objects/place/fetch/search/usePlacesSearch'
import { usePlaceClaim } from '../../../../../composables/fireux/firestore/objects/place/mutations/usePlaceClaim'
import { usePlaceSave } from '../../../../../composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import type { BasePlace, PlaceUpsertInput } from '../../../../../models/objects/place.model'

interface Props {
  type?: string | null
  collection?: string
  normalizedField?: string
  localFallback?: boolean
  extraCollections?: string[]
  allowGoogle?: boolean
  confirmLabel?: string
  existingNote?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: null,
  collection: 'places',
  normalizedField: undefined,
  localFallback: false,
  extraCollections: () => [],
  allowGoogle: undefined,
  confirmLabel: undefined,
  existingNote: undefined,
})

const emit = defineEmits<{
  (e: 'confirmed', payload: { placeId: string; place: PlaceUpsertInput }): void
}>()

const { query, results, selected, isSearching, select, clear } =
  usePlacesSearch({
    type: props.type,
    collection: props.collection,
    normalizedField: props.normalizedField as any,
    localFallback: props.localFallback,
    extraCollections: props.extraCollections,
    allowGoogle: props.allowGoogle,
  })

const confirmLabel = computed(() => props.confirmLabel)
const existingNote = computed(() => props.existingNote)


const { ensurePlaceExists } = usePlaceSave({ type: props.type })
const { claimPlace } = usePlaceClaim({ type: props.type })
// useImageStorage is auto-imported by fireux-core module
const { uploadFromUrl } = useImageStorage()

const isConfirming = ref(false)
const isClaiming = ref(false)

const showEmpty = computed(
  () =>
    !isSearching.value &&
    !selected.value &&
    query.value.trim().length > 0 &&
    results.value.length === 0
)

function sanitizeAvatar(value?: string | null) {
  if (!value) return null
  const trimmed = String(value).trim()
  return trimmed ? trimmed : null
}

function buildFallbackPlace(base: BasePlace, placeId: string): PlaceUpsertInput {
  const formatted = base.formatted_address ?? ''
  return {
    id: placeId,
    source: 'fireux',
    name: base.name,
    formatted_address: formatted,
    lat: base.lat,
    lng: base.lng,
    place_image: sanitizeAvatar((base as any).place_image) ?? '',
    claimed_by: base.claimed_by ?? '',
    search_term: `${base.name} ${formatted}`.toLowerCase().trim(),
  }
}

function clearSelection() {
  clear()
  isConfirming.value = false
}

async function loadDraftPlace(placeId: string, preview: BasePlace): Promise<PlaceUpsertInput> {
  try {
    const details = await fetchPlaceDetails(placeId)
    if (details?.stored) {
      return {
        ...details.stored,
        id: placeId,
        place_image: sanitizeAvatar((details.stored as any).place_image ?? null) ?? '',
      }
    }
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[places][confirm] details fetch failed', error)
    }
  }

  return buildFallbackPlace(preview, placeId)
}

async function maybeUploadAvatar(
  placeId: string,
  draft: PlaceUpsertInput,
  preview: BasePlace
) {
  const uploadSource =
    sanitizeAvatar((preview as any).place_image) ?? sanitizeAvatar((draft as any).place_image)
  if (!uploadSource) return

  try {
    const path = `places/${placeId}/avatar`
    const uploadedUrl = await uploadFromUrl(path, uploadSource)
    ;(draft as any).place_image = uploadedUrl
    if (selected.value) {
      selected.value = {
        ...selected.value,
        place_image: uploadedUrl,
      } as BasePlace
    }
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[places][confirm] avatar upload failed', error)
    }
  }
}

async function onConfirm(place: BasePlace) {
  if (isConfirming.value) return

  const placeId = canonicalPlaceId((place as any).id ?? (place as any).place_id)
  if (!placeId) {
    if (import.meta.dev) {
      console.warn('[places][confirm] missing canonical place id', place)
    }
    selected.value = null
    return
  }

  isConfirming.value = true

  try {
    // If the user selects an existing FireUX place, allow confirmation
    // so downstream overlays (companies/kitchens/etc) can be created.
    if (place.source === 'fireux') {
      const draft: PlaceUpsertInput = {
        id: placeId,
        source: 'fireux',
        name: place.name,
        formatted_address: place.formatted_address ?? '',
        lat: place.lat,
        lng: place.lng,
        place_image: sanitizeAvatar((place as any).place_image) ?? '',
        claimed_by: place.claimed_by ?? '',
        search_term:
          (place as any).search_term ??
          `${place.name} ${place.formatted_address ?? ''}`.toLowerCase().trim(),
      }

      await ensurePlaceExists(draft)
      emit('confirmed', { placeId, place: draft })
      return
    }

    if (place.source !== 'google') {
      if (import.meta.dev) {
        console.log('[places][confirm] skipping unknown place source', place)
      }
      return
    }

    const draft = await loadDraftPlace(placeId, place)
    await maybeUploadAvatar(placeId, draft, place)
    await ensurePlaceExists(draft)
    emit('confirmed', { placeId, place: draft })
  } catch (error) {
    if (import.meta.dev) {
      console.error('[places][confirm] failed to confirm', error)
    }
  } finally {
    isConfirming.value = false
    clear()
  }
}

async function onClaim(place: BasePlace) {
  if (isClaiming.value) return
  const placeId = canonicalPlaceId((place as any).id ?? (place as any).place_id)
  if (!placeId) return

  isClaiming.value = true
  try {
    const { claimedBy } = await claimPlace(placeId)
    if (selected.value && selected.value.id === placeId) {
      selected.value = {
        ...selected.value,
        claimed_by: claimedBy,
      } as BasePlace
    }
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[places][claim] failed', error)
    }
  } finally {
    isClaiming.value = false
  }
}
</script>
