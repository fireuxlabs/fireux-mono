<!-- `packages/extensions/fireux-places/src/runtime/pages/places.vue` -->

<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <div class="space-y-6">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Start typing a place (min 3 chars)…"
        @input="onInput"
      />

      <section class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-500">Saved places</h3>
          <UBadge v-if="savedPlaceCells.length" color="gray" size="xs">
            {{ savedPlaceCells.length }}
          </UBadge>
        </div>

        <UCard>
          <div
            v-if="savedPlacesLoading"
            class="flex items-center gap-2 text-gray-500 text-sm"
          >
            <UIcon name="i-lucide-loader-circle" class="animate-spin" />
            Loading saved places…
          </div>

          <div
            v-else-if="!savedPlaceCells.length"
            class="text-sm text-gray-500"
          >
            No saved places yet. Select a Google result to store it locally.
          </div>

          <ul v-else class="space-y-2">
            <li v-for="cell in savedPlaceCells" :key="cell.id">
              <button
                type="button"
                class="w-full text-left"
                @click="selectSaved(cell)"
              >
                <OrganismsPlacesCell :place="cell" />
              </button>
            </li>
          </ul>
        </UCard>
      </section>

      <section v-if="suggestions.length" class="space-y-2">
        <h3 class="text-sm font-medium text-gray-500">Google suggestions</h3>
        <UCard>
          <ul class="space-y-2">
            <li v-for="cell in suggestions" :key="cell.id">
              <button
                type="button"
                class="w-full text-left"
                @click="selectSuggestion(cell)"
              >
                <OrganismsPlacesCell :place="cell" />
              </button>
            </li>
          </ul>
        </UCard>
      </section>

      <div
        v-if="isLoading"
        class="flex items-center gap-2 text-gray-500 text-sm"
      >
        <UIcon name="i-lucide-loader-circle" class="animate-spin" /> Loading…
      </div>

      <UAlert
        v-if="errorMessage"
        color="red"
        variant="subtle"
        title="Error"
        :description="errorMessage"
      />

      <section v-if="selectedPlace" class="space-y-2">
        <h3 class="text-sm font-medium text-gray-500">Selected place</h3>
        <UCard>
          <div class="space-y-3">
            <OrganismsPlacesCell
              v-if="selectedPlaceCell"
              :place="selectedPlaceCell"
            />

            <div class="grid gap-2 text-xs text-gray-500 md:grid-cols-2">
              <div>
                <span class="font-medium text-gray-600">Latitude:</span>
                <span class="ml-1">{{ formatLatLng(selectedPlace.lat) }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Longitude:</span>
                <span class="ml-1">{{ formatLatLng(selectedPlace.lng) }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Website:</span>
                <template v-if="selectedPlace.website">
                  <a
                    :href="selectedPlace.website"
                    class="ml-1 text-primary-600 underline"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ selectedPlace.website }}
                  </a>
                </template>
                <span v-else class="ml-1 text-gray-400">—</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Phone:</span>
                <span class="ml-1">
                  {{ selectedPlace.phone || '—' }}
                </span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Rating:</span>
                <span class="ml-1">
                  <template v-if="typeof selectedPlace.rating === 'number'">
                    {{ selectedPlace.rating.toFixed(1) }}
                    <span
                      v-if="selectedPlace.user_ratings_total"
                      class="text-gray-400"
                    >
                      ({{ selectedPlace.user_ratings_total }})
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Avatar:</span>
                <template v-if="selectedPlace.avatar">
                  <a
                    :href="selectedPlace.avatar"
                    class="ml-1 text-primary-600 underline"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ selectedPlace.avatar }}
                  </a>
                </template>
                <span v-else class="ml-1 text-gray-400">—</span>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton
                size="xs"
                color="gray"
                variant="ghost"
                @click="clearSelection"
              >
                <UIcon name="i-lucide-x" class="mr-1" /> Clear
              </UButton>
            </div>
          </div>
        </UCard>
      </section>
    </div>
  </UPage>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useFirestoreRead } from '#fireux-core-composables/firestore/useFirestoreRead'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'
import { useGooglePlaces } from 'fireux-places/runtime/composables/useGooglePlaces'
import OrganismsPlacesCell from '../components/organisms/places/Cell.vue'

const MIN_QUERY_LENGTH = 3
const PLACE_ICON_FALLBACK =
  'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png'

const query = ref('')
const suggestions = ref<PlaceCard.Cell[]>([])
const selectedPlace = ref<Place | null>(null)
const localLoading = ref(false)
const localError = ref<string | null>(null)
let debounce: ReturnType<typeof setTimeout> | null = null

const {
  searchPlaces,
  getPlaceDetails,
  resetSessionToken,
  isLoading: googleLoading,
  error: googleError,
} = useGooglePlaces()

const { firestoreFetchCollection } = useFirestoreRead()
const firestorePlaces = firestoreFetchCollection<Place>('places')

const savedPlaces = computed<Place[]>(() => {
  const raw = firestorePlaces.value
  if (!raw) return []
  return raw
    .map(
      (doc): Place => ({
        ...doc,
        source: 'firestore' as const,
        avatar: doc.avatar || PLACE_ICON_FALLBACK,
      })
    )
    .filter((item): item is Place & { id: string } => Boolean(item.id))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const savedPlacesMap = computed(() => {
  const map = new Map<string, Place>()
  for (const entry of savedPlaces.value) map.set(entry.id, entry)
  return map
})

const savedPlacesLoading = computed(() => firestorePlaces.value === undefined)

const toCell = (place: Place, meta: string): PlaceCard.Cell => ({
  id: place.id,
  name: place.name,
  avatar: place.avatar || PLACE_ICON_FALLBACK,
  formatted_address: place.formatted_address,
  rating: place.rating ?? null,
  meta_right: meta,
})

const savedPlaceCells = computed<PlaceCard.Cell[]>(() =>
  savedPlaces.value.map((place) => toCell(place, 'Saved'))
)

const selectedPlaceCell = computed<PlaceCard.Cell | null>(() => {
  if (!selectedPlace.value) return null
  const meta = selectedPlace.value.source === 'firestore' ? 'Saved' : 'Google'
  return toCell(selectedPlace.value, meta)
})

const isLoading = computed(() => googleLoading.value || localLoading.value)
const errorMessage = computed(() => localError.value || googleError.value)

function onInput() {
  localError.value = null
  selectedPlace.value = null
  if (debounce) clearTimeout(debounce)

  if (query.value.trim().length < MIN_QUERY_LENGTH) {
    suggestions.value = []
    resetSessionToken()
    return
  }

  debounce = setTimeout(runAutocomplete, 250)
}

async function runAutocomplete() {
  localLoading.value = true
  try {
    const results = await searchPlaces(query.value, getApiKey())
    suggestions.value = results.slice(0, 6)
  } catch (e: any) {
    localError.value = e?.message ?? 'Search failed'
    suggestions.value = []
  } finally {
    localLoading.value = false
  }
}

async function selectSuggestion(cell: PlaceCard.Cell) {
  try {
    localLoading.value = true
    const details = await getPlaceDetails(cell.id, getApiKey())
    selectedPlace.value = {
      ...details,
      id: details.id || cell.id,
      avatar: details.avatar || PLACE_ICON_FALLBACK,
      source: 'google',
    }
    suggestions.value = []
    query.value = selectedPlace.value.name
  } catch (e: any) {
    localError.value = e?.message ?? 'Failed to load details'
  } finally {
    localLoading.value = false
  }
}

function selectSaved(cell: PlaceCard.Cell) {
  const match = savedPlacesMap.value.get(cell.id)
  selectedPlace.value = match ?? null
  if (match) query.value = match.name
}

function clearSelection() {
  selectedPlace.value = null
  localError.value = null
}

function formatLatLng(value?: number | null) {
  if (typeof value !== 'number') return '—'
  return Number(value).toFixed(6)
}

function getApiKey(): string {
  const config = useRuntimeConfig()
  const firebaseApiKey = (config.public as any)?.firebaseConfig?.apiKey
  return (
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (firebaseApiKey as string | undefined) ||
    ''
  )
}

onBeforeUnmount(() => {
  if (debounce) clearTimeout(debounce)
})
</script>
