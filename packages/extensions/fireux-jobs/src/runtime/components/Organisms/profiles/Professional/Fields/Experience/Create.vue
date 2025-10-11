<template>
  <div class="space-y-3">
    <div class="rounded-lg border border-neutral-200">
      <OrganismsPlacesSearchBar v-model="query" placeholder="Search places" />
    </div>

    <div v-if="!hasQuery" class="text-xs text-neutral-500">
      Start typing to find the venue you worked at.
    </div>

    <OrganismsPlacesSearchDropdown
      v-else-if="results.length"
      :cells="results"
      @select="handleSelect"
    />

    <div v-else-if="isSearching" class="text-xs text-neutral-500">
      Searching…
    </div>

    <div v-else class="text-xs text-neutral-500">No matches yet.</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'
import { usePlaces } from 'fireux-places/runtime/composables/usePlaces'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<(event: 'save', payload: ExperienceItem) => void>()

const { searchPlaces } = usePlaces()

const query = ref('')
const results = ref<PlaceCard.Cell[]>([])
const isSearching = ref(false)

const loading = computed(() => props.loading === true)
const hasQuery = computed(() => query.value.trim().length > 0)

let debounceId: ReturnType<typeof setTimeout> | null = null

watch(
  () => query.value,
  (value) => {
    clearDebounce()
    const trimmed = value.trim()

    if (!trimmed) {
      results.value = []
      isSearching.value = false
      return
    }

    debounceId = setTimeout(async () => {
      isSearching.value = true
      try {
        results.value = await searchPlaces(trimmed)
      } finally {
        isSearching.value = false
      }
    }, 250)
  }
)

onBeforeUnmount(() => {
  clearDebounce()
})

function handleSelect(cell: PlaceCard.Cell) {
  if (loading.value) return
  emit('save', mapPlaceToExperience(null, cell))
}

function clearDebounce() {
  if (debounceId) {
    clearTimeout(debounceId)
    debounceId = null
  }
}

function mapPlaceToExperience(
  place: Place | null,
  cell: PlaceCard.Cell
): ExperienceItem {
  const canonicalId = canonicalPlaceId(place?.place_id ?? cell.place_id)
  const formattedAddress =
    toCleanString(place?.formatted_address) ||
    toCleanString(cell.formatted_address) ||
    undefined
  const avatar = sanitizeAvatar(
    (place?.avatar as string | null | undefined) ?? cell.avatar ?? null
  )
  const displayName =
    toCleanString(place?.name) || toCleanString(cell.name) || undefined

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
