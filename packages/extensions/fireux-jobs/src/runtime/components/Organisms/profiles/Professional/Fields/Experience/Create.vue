<template>
  <div class="space-y-4">
    <OrganismsPlacesSearchSection
      mode="select"
      :title="searchTitle"
      :description="searchDescription"
      @place:selected="handlePlaceSelected"
    />

    <UAlert v-if="loading" color="neutral" variant="soft">
      <div class="flex items-center gap-2 text-sm text-neutral-600">
        <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
        Saving experience…
      </div>
    </UAlert>

    <UAlert
      v-else-if="lastSelection"
      color="primary"
      variant="soft"
      icon="i-lucide-check-circle"
    >
      <span class="text-sm">
        Linked <strong>{{ lastSelection.name }}</strong>. Add another place or
        continue editing the new experience below.
      </span>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'
import type {
  Place,
  PlaceCard,
} from 'fireux-places/runtime/models/place.model'

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

function handlePlaceSelected(payload: {
  place: Place
  cell: PlaceCard.Cell
}) {
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
  const parts = formatted.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return undefined
  return parts.slice(0, 2).join(', ')
}
</script>
