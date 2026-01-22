<!-- FILE: packages/extensions/fireux-places/src/runtime/components/organisms/entities/Place/Search/Section.vue -->
<template>
  <div class="space-y-4">
    <PlaceSearchBar v-model="query" :placeholder="placeholder" />

    <PlaceSearchSelected
      v-if="selected"
      :card="selectedCard"
      :confirming="isConfirming"
      :disabled="isConfirming"
      @clear="clearSelection"
      @confirm="confirmSelected"
    />

    <p v-if="selected && showConfirmDebug" class="text-xs text-muted">
      Confirm will ensure a Place exists and emit { placeId, place }.
    </p>

    <PlaceSearchDropdown
      v-else-if="results.length"
      :cells="results"
      @select="select"
    />

    <p v-if="isSearching" class="text-xs text-muted">Searching…</p>
    <p v-else-if="showEmpty" class="text-xs text-muted">
      No results yet—try another name.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { canonicalPlaceId } from '../../../../../composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlacesSearch } from '../../../../../composables/fireux/firestore/objects/place/fetch/search/usePlacesSearch'
import { usePlaceSave } from '../../../../../composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import type { BasePlace, PlaceUpsertInput } from '../../../../../models/objects/place.model'

type Props = {
  type?: string | null
  collection?: string
  localFallback?: boolean
  allowGoogle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: null,
  collection: 'places',
  localFallback: false,
  allowGoogle: undefined,
})

const emit = defineEmits<{
  (e: 'confirmed', payload: { placeId: string; place: PlaceUpsertInput }): void
}>()

// Extra collections rule (minimal + explicit):
// - If searching places, don't add extra collections.
// - If searching overlays (kitchens/companies/etc), include base places too.
const extraCollections = computed(() =>
  props.collection === 'places' ? [] : ['places']
)

const { query, results, selected, isSearching, select, clear } = usePlacesSearch({
  type: props.type,
  collection: props.collection,
  normalizedField: 'search_term_normalized' as any,
  localFallback: props.localFallback,
  extraCollections: extraCollections.value,
  allowGoogle: props.allowGoogle,
})

const placeholder = computed(() => {
  const value = props.collection || 'places'
  if (value.endsWith('ies')) return `Type a ${value.slice(0, -3)}y name…`
  if (value.endsWith('s')) return `Type a ${value.slice(0, -1)} name…`
  return `Type a ${value} name…`
})

const selectedCard = computed(() => {
  const place = selected.value
  if (!place) return null

  return {
    id: String((place as any).id ?? ''),
    to: '',
    name: String(place.name ?? ''),
    formattedAddress: String(place.formatted_address ?? ''),
    imageUrl: String((place as any).place_image ?? ''),
    source: String((place as any).source ?? 'fireux'),
  }
})

const showEmpty = computed(
  () =>
    !isSearching.value &&
    !selected.value &&
    query.value.trim().length > 0 &&
    results.value.length === 0
)

const showConfirmDebug = computed(() =>
  Boolean(import.meta.dev && selected.value)
)

const { ensurePlaceExists } = usePlaceSave({ type: props.type })
const isConfirming = ref(false)

function clearSelection() {
  clear()
  isConfirming.value = false
}

async function confirm(place: BasePlace) {
  if (isConfirming.value) return

  const placeId = canonicalPlaceId((place as any).id ?? (place as any).place_id)
  if (!placeId) {
    if (import.meta.dev) console.warn('[places][confirm] missing place id', place)
    return
  }

  isConfirming.value = true
  try {
    const draft: PlaceUpsertInput = {
      id: placeId,
      source: (place.source as any) ?? 'fireux',
      name: String(place.name ?? ''),
      formatted_address: String(place.formatted_address ?? ''),
      lat: Number((place as any).lat ?? 0),
      lng: Number((place as any).lng ?? 0),
      place_image: String((place as any).place_image ?? ''),
      claimed_by: String((place as any).claimed_by ?? ''),
      search_term: String((place as any).search_term ?? '')
        .toLowerCase()
        .trim(),
    }

    await ensurePlaceExists(draft)
    emit('confirmed', { placeId, place: draft })
  } catch (error) {
    if (import.meta.dev) console.error('[places][confirm] failed', error)
  } finally {
    isConfirming.value = false
    clear()
  }
}

function confirmSelected() {
  if (selected.value) void confirm(selected.value)
}
</script>
