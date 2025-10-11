# Places flow deltas & scope

## Summary

- Experience creation currently wires the stripped-down search directly to persistence, so clicking a result immediately writes a new experience row.
- The dedicated places “manage/API” flow (`OrganismsPlacesSearchSection`) stages the selection, enriches it with Google details, and saves/updates the canonical document before emitting.
- Aligning the flows will likely mean reusing the staging + confirmation logic (and related composables) without dragging in all of the management UI chrome.

## Experience create flow (current)

- Entry points: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Fields/Experience/Create.vue` → `Experience/Section.vue` → parent profile forms.
- UX: search bar + dropdown suggestions (`OrganismsPlacesSearchBar` + `OrganismsPlacesSearchDropdown`). No preview or confirmation step.
- Behavior:
  - Debounced `searchPlaces()` call on query.
  - Clicking a result emits `save` with a lightweight `ExperienceItem` payload (place_id, name, address, image_url).
  - `Experience/Section.vue` immediately appends the payload and calls the bound Firestore `onSave` callback.
- Data side-effects:
  - No call to `getPlaceDetails()` or `savePlace()`. For Google-sourced results, the canonical place document is not created/updated in Firestore.
  - Metadata stored with the experience item is shallow (no lat/lng, search_term, website, etc.). Logos rely on whatever avatar URL was already present on the cell.
- Dependencies used: `usePlaces().searchPlaces`, manual helpers (canonical ID trimming, address shortening).

### Source excerpt — `Experience/Create.vue`

```vue
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

const emit = defineEmits<(event: 'save', payload: ExperienceItem) => void>()
const { searchPlaces } = usePlaces()

const query = ref('')
const results = ref<PlaceCard.Cell[]>([])
const isSearching = ref(false)

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

function handleSelect(cell: PlaceCard.Cell) {
  if (loading.value) return
  emit('save', mapPlaceToExperience(null, cell))
}

function mapPlaceToExperience(place: Place | null, cell: PlaceCard.Cell) {
  const canonicalId = canonicalPlaceId(place?.place_id ?? cell.place_id)
  const formattedAddress =
    toCleanString(place?.formatted_address) ||
    toCleanString(cell.formatted_address) ||
    undefined
  return {
    place_id: canonicalId,
    name: toCleanString(place?.name) || toCleanString(cell.name) || undefined,
    formatted_address: formattedAddress,
    short_address: toShortAddress(formattedAddress),
    image_url: sanitizeAvatar(
      (place?.avatar as string | null | undefined) ?? cell.avatar ?? null
    ),
  }
}
```

### Source excerpt — `Experience/Section.vue`

```ts
async function handleCreateSave(payload: ExperienceItem) {
  if (isSavingNew.value) return
  const placeId = (payload?.place_id || '').trim()
  if (!placeId) return

  isSavingNew.value = true
  try {
    const next = [
      ...items.value,
      {
        ...payload,
        place_id: placeId,
      },
    ]
    await onSave.value(next)
  } finally {
    isSavingNew.value = false
  }
}
```

## Places management/API flow (reference)

- Entry point: `packages/extensions/fireux-places/src/runtime/components/organisms/places/Search/Section.vue` (used on `/places` admin page, future select callers).
- UX: full card with instructions, empty-state alerts, dropdown suggestions, and a selected preview pane with clear/confirm controls.
- Behavior stages:
  1. Debounced `searchPlaces()` populates dropdown.
  2. Selecting a suggestion transitions to `selected` state and (if Google source) kicks off logo fetch.
  3. Confirming:
     - Fetches full details via `getPlaceDetails()`.
     - Emits `place:selected` for select-mode consumers or navigates in manage-mode.
     - For Google places, uploads logo (when available) and persists via `savePlace()` so Firestore stays canonical.
- Data guarantees:
  - The confirmed place document always exists/updates in Firestore.
  - Avatar/logo handling sanitizes URLs and backfills dropdown/preview state.
  - Ensures consistent `search_term`, timestamps, and other `Place` fields.
- Extra utilities: request logging, debounce cleanup, image upload orchestration, router navigation (manage mode).

### Source excerpt — `OrganismsPlacesSearchSection.vue`

```vue
<template>
  <section class="space-y-6">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-5' }">
      <template #header>
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-gray-900">
            Search Google Places
          </h2>
          <p class="text-sm text-gray-500">
            Type to discover locations, review the details, and save the perfect
            match.
          </p>
        </div>
      </template>

      <div class="space-y-2">
        <label :for="searchInputId" class="text-sm font-medium text-gray-700">
          Search
        </label>
        <OrganismsPlacesSearchBar
          v-model="query"
          :id="searchInputId"
          :aria-describedby="searchHelpId"
          aria-label="Search Google Places"
        />
        <p :id="searchHelpId" class="text-xs text-gray-500">
          Powered by Google Places autocomplete
        </p>
      </div>

      <UAlert
        v-if="!hasQuery"
        color="neutral"
        variant="soft"
        icon="i-lucide-compass"
        title="Start typing to see suggestions"
      />

      <OrganismsPlacesSearchSelected
        v-else-if="status === 'selected' && selected"
        :place="selected"
        :is-loading-logo="isLoadingLogo"
        :logo-error-message="logoErrorMessage"
        @clear="onClear"
        @confirm="onConfirm"
        @retry="onRetryLogo"
      />

      <OrganismsPlacesSearchDropdown
        v-else-if="status === 'results' && results.length"
        :cells="results"
        @select="onSelect"
      />

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        icon="i-lucide-search-x"
        :title="emptyTitle"
        :description="emptyDescription"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
const { searchPlaces, getPlaceDetails, savePlace } = usePlaces()
const emit = defineEmits<PlacesSearchEmit>()

const results = ref<PlaceCard.Cell[]>([])
const selected = ref<Place | null>(null)
const selectedCell = ref<PlaceCard.Cell | null>(null)
const isLoadingLogo = ref(false)

async function onSelect(cell: PlaceCard.Cell) {
  const place = toPreviewPlace(cell)
  selected.value = place
  selectedCell.value = { ...cell }
  status.value = 'selected'

  if (cell.source !== 'google') {
    isLoadingLogo.value = false
    return
  }

  void fetchSelectedLogo()
}

async function onConfirm(place: Place) {
  const placeId = canonicalPlaceId(place.place_id)
  const cell = selectedCell.value

  if (cell?.source === 'google') {
    const savedPlace = await confirmGooglePlace(placeId, place, cell, {
      skipNavigate: isSelectMode.value,
    })
    if (isSelectMode.value) {
      emitSelection(placeId, cell, savedPlace)
    }
  } else {
    if (isSelectMode.value) {
      const preview = selected.value ?? toPreviewPlace(cell)
      emitSelection(placeId, cell, preview)
    } else {
      await goToPlace(placeId)
    }
  }
}

function emitSelection(placeId: string, cell: PlaceCard.Cell, place: Place) {
  emit('place:selected', {
    place: {
      ...place,
      place_id: canonicalPlaceId(placeId),
      avatar: place.avatar ?? cell.avatar ?? null,
      source: 'firestore',
      search_term:
        place.search_term ?? `${place.name ?? ''} ${place.formatted_address ?? ''}`
          .toLowerCase()
          .trim(),
      created_at: place.created_at ?? new Date(),
    },
    cell: {
      ...cell,
      place_id: canonicalPlaceId(placeId),
      avatar: cell.avatar ?? place.avatar ?? null,
    },
  })
}
```

## Key deltas

| Area                | Experience flow                          | Places/API flow                        | Impact                                                  |
| ------------------- | ---------------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| User confirmation   | Immediate save on click                  | Explicit preview + confirm             | Hard to cancel mistakes; unclear UX                     |
| Firestore place doc | Not touched                              | Created/updated before emit            | Experience relies on partial metadata; no central cache |
| Logo handling       | Uses avatar already on cell (often none) | Attempts prioritized logo fetch/upload | Experiences may display blank avatars                   |
| Async states        | Minimal (`Searching…`)                   | Rich loading + error messaging         | Hard to debug issues in experience flow                 |
| Reuse surface       | Direct call to `searchPlaces`            | Bundles search, select, confirm logic  | Duplicated logic / harder maintenance                   |
| Metadata depth      | name/address/image only                  | Full `Place` fields hydrated           | Downstream features (maps, filters) miss data           |

## Reuse opportunities

- Extract the selection state machine (query → results → selected → confirm) into a headless composable (`usePlaceSelection`) so both flows share debounce, detail fetch, and save logic.
- Reuse `OrganismsPlacesSearchSelected` preview UI (or a simplified variant) to keep confirm/clear controls consistent.
- Surface `savePlace` + `getPlaceDetails` behind a callable helper for Experience flow to opt into canonical persistence without importing the entire manage card.
- Centralize helpers for `canonicalPlaceId`, avatar sanitizing, and short-address formatting (currently reimplemented in `Create.vue`).

## Risks & open questions

- Do we require the experience creator to always create missing place docs, or should it allow lightweight/manual entries? (Impacts offline/edge workflows.)
- Confirmation UX: does the professional editor need the full preview/confirm step, or a streamlined variant (e.g., modal, inline card)?
- Permissions: the manage flow assumes access to `savePlace`. Verify the professional dashboard role has rights to write `places/{id}`.
- Performance: pulling Google details + uploading logos introduces latency; may need optimistic UI or background hydration.

## Suggested path forward

1. Introduce a shared selection composable mirroring the manage flow (debounce, fetch, select, confirm, save) but allow consumers to plug in their own renders for search, preview, and actions.
2. Refactor Experience create component to use the shared composable, exposing clear/confirm actions instead of instant save.
3. Ensure confirm step creates or reuses the Firestore `Place` document, then emit the enriched payload (`Place` + derived `ExperienceItem`).
4. Backfill a secondary action (skip linking) if the UX requires manual entries.
5. Document the flow contract in `copilot-documentation` so future consumers (e.g., employers, suppliers) can adopt the same pattern.
