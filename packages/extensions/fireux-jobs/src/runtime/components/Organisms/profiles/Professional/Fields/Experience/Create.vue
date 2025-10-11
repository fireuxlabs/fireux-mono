<template>
  <div class="space-y-4">
    <OrganismsPlacesSearchSection
      mode="select"
      :title="searchTitle"
      :description="searchDescription"
      @place:selected="handlePlaceSelected"
    />

  
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: ExperienceItem): void
}>()

const lastSelection = ref<Place | null>(null)

const searchTitle = 'Link an experience place'
const searchDescription =
  'Search Google Places and confirm the venue to pre-fill experience details.'

const loading = computed(() => props.loading === true)

function handlePlaceSelected(payload: { place: Place; cell: PlaceCard.Cell }) {
  if (loading.value) return

  lastSelection.value = payload.place
  emit('save', mapPlaceToExperience(payload.place, payload.cell))
}

function mapPlaceToExperience(
  place: Place,
  cell: PlaceCard.Cell
): ExperienceItem {
  const canonicalId = canonicalPlaceId(place.place_id || cell.place_id)
  const formattedAddress =
    toCleanString(place.formatted_address) ||
    toCleanString(cell.formatted_address) ||
    undefined
  const avatar = sanitizeAvatar(place.avatar ?? cell.avatar ?? null)
  const displayName =
    toCleanString(place.name) || toCleanString(cell.name) || undefined

  return {
    place_id: canonicalId,
    name: displayName,
    formatted_address: formattedAddress,
    short_address: toShortAddress(formattedAddress),
    image_url: avatar,
  }
}

function canonicalPlaceId(id: string | null | undefined) {
  const normalized = (id ?? '').toString().trim()
  if (!normalized) return ''
  return normalized.replace(/^places\//, '')
}

function toCleanString(value: string | null | undefined) {
  const normalized = (value ?? '').toString().trim()
  return normalized.length ? normalized : undefined
}

function sanitizeAvatar(value: string | null | undefined) {
  const normalized = (value ?? '').toString().trim()
  return normalized.length ? normalized : undefined
}

function toShortAddress(formatted: string | undefined) {
  if (!formatted) return undefined
  const parts = formatted
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return undefined
  return parts.slice(0, 2).join(', ')
}
</script>
