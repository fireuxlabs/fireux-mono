<!-- FILE: packages/extensions/fireux-places/src/runtime/place/components/Search/Index.vue -->
<!-- flag -->
<!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: expose selection clearing without changing existing direct-create consumers. -->
<!-- Concurrent edit — 2026-07-21 16:06 CEST — Misebox dev stability pass: keep logo discovery optional and selection-scoped. -->
<template>
  <div class="space-y-4">
    <PlaceSearchBar v-model="query" :placeholder="placeholder" />

    <UCard v-if="selectedCell" :ui="{ body: 'space-y-3' }">
      <PlaceCardsDropdownSelected
        :name="selectedCell.name"
        :address="selectedCell.subtitle"
        :image-url="selectedImageUrl"
        :image-shade="selectedCell.imageShade"
        :source="selectedCell.source"
        :loading="selectedLogoLoading"
      />

      <div class="flex items-center justify-end gap-2">
        <UButton
          v-if="showClearButton"
          size="sm"
          color="neutral"
          variant="soft"
          @click="clearSelection"
        >
          Clear
        </UButton>

        <UButton
          v-if="showConfirmButton"
          size="sm"
          color="primary"
          variant="soft"
          :loading="confirming"
          :disabled="confirming"
          @click="onConfirmClick"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </UCard>

    <PlaceSearchDropdown
      v-else-if="results.length"
      :cells="results"
      @select="handleSelectPlace"
    />

    <p v-if="isSearching" role="status" aria-live="polite" class="text-sm text-muted">Searching…</p>
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: emit sparse Place onboarding drafts instead of blank placeholders.
import { computed, nextTick, ref, watch } from 'vue'
import { usePlaceSearch } from '../../composables/usePlaceSearch'
import { usePlaceCreate } from '../../composables/firestore/mutations/usePlaceCreate'
import {
  sanitizeLogoAvatar,
  usePlaceLogoState,
} from '../../composables/firestore/utils/view/usePlaceLogos'
import { usePlaceInterface } from '../../composables/firestore/utils/view/usePlaceInterface'
import type { PlaceUpsertInput } from '../../models/place-onboarding.model.ts'
import type {
  BasePlace,
  PlaceSearchSource,
} from '../../composables/firestore/fetch/search/types'
import type { PlaceImageShade } from '../../utils/place-spine'
import PlaceCardsDropdownSelected from '../Cards/Dropdown/Selected.vue'

const props = withDefaults(
  defineProps<{
    allowGoogle?: boolean
    type?: string | null
    placeholder?: string | null
    showConfirmButton?: boolean
    showClearButton?: boolean
  }>(),
  {
    allowGoogle: false,
    type: null,
    placeholder: null,
    showConfirmButton: true,
    showClearButton: true,
  }
)

const placeholder = computed(() => props.placeholder || undefined)

const emit = defineEmits<{
  (
    e: 'selected',
    payload: {
      placeId: string
      place: PlaceUpsertInput & { source: PlaceSearchSource }
    }
  ): void
  (
    e: 'confirmed',
    payload: {
      placeId: string
      place: PlaceUpsertInput & { source: PlaceSearchSource }
    }
  ): void
  (e: 'cleared'): void
}>()

const showConfirmButton = computed(() => props.showConfirmButton ?? true)
const showClearButton = computed(() => props.showClearButton ?? true)

const {
  query,
  results,
  selected,
  isSearching,
  select: selectPlace,
  clear,
} = usePlaceSearch({
  allowGoogle: props.allowGoogle,
  debugLabel: props.type === 'kitchen' ? 'kitchens' : undefined,
  type: props.type ?? null,
})

const selectedPlace = computed(() => selected.value as BasePlace | null)

const selectedSource = computed<PlaceSearchSource>(() => {
  const src = (selectedPlace.value as any)?.source
  return src === 'google' ? 'google' : 'fireux'
})

const typeLabel = computed(() => {
  const raw = (props.type ?? '').trim()
  if (!raw) return 'place'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

const confirmLabel = computed(() =>
  selectedSource.value === 'google'
    ? `Add ${typeLabel.value}`
    : `Use ${typeLabel.value}`
)

const { pill: placeInterface } = usePlaceInterface()
const selectedCell = computed(() =>
  selectedPlace.value ? placeInterface(selectedPlace.value as any) : null
)

const selectedLogoTarget = computed(
  () => selectedCell.value ?? selectedPlace.value ?? null
)
const { avatar: selectedLogo, isLoading: selectedLogoLoading } =
  usePlaceLogoState(selectedLogoTarget)

const selectedImageUrl = computed(
  () => selectedLogo.value || selectedCell.value?.imageUrl || ''
)

const { ensurePlaceExists, captureIntent, scopeEpoch } = usePlaceCreate({ sources: [selectedPlace] })
const confirming = ref(false)
watch(scopeEpoch, () => { confirming.value = false }, { flush: 'sync' })

function clearSelection() {
  clear()
  emit('cleared')
}

function handleSelectPlace(place: BasePlace) {
  selectPlace(place)

  nextTick(() => {
    const selectedDraft = selectedPlace.value
    const placeId = String(
      (selectedDraft as any)?.id ?? (selectedDraft as any)?.place_id ?? ''
    ).trim()
    if (!selectedDraft || !placeId) return

    const draft = toDraft(selectedDraft, placeId, selectedLogo.value)
    emit('selected', { placeId, place: draft })
  })
}

if (import.meta.dev && props.type === 'kitchen') {
  watch(query, (value: string) => {
    console.log('[kitchens][search] query', { query: value })
  })

  watch(isSearching, (value: boolean) => {
    console.log('[kitchens][search] status', { isSearching: value })
  })

  watch(results, (value) => {
    console.log('[kitchens][search] results', {
      count: Array.isArray(value) ? value.length : 0,
      ids: Array.isArray(value) ? value.map((row) => row.id) : [],
    })
  })
}

function toShade(value: unknown): PlaceImageShade {
  const v = String(value ?? 'none')
    .toLowerCase()
    .trim()
  if (v === 'light' || v === 'dark' || v === 'none') return v
  return 'none'
}

function toDraft(
  place: BasePlace,
  placeId: string,
  logoOverride?: string | null
): PlaceUpsertInput & { source: PlaceSearchSource } {
  const name = String((place as any)?.name ?? '')
  const formatted = String((place as any)?.formatted_address ?? '')
  const existingSearchTerm = String((place as any)?.search_term ?? '').trim()

  const sanitizedPlaceImage =
    sanitizeLogoAvatar(
      String((place as any)?.image_url ?? (place as any)?.place_image ?? '')
    ) ?? ''

  // Prefer an explicit discovered logo; otherwise store an empty image.
  let resolvedLogo =
    typeof logoOverride === 'string' ? logoOverride : sanitizedPlaceImage

  // Google places should stay empty unless discovery found a real logo.
  if (selectedSource.value === 'google' && !resolvedLogo) {
    resolvedLogo = ''
  }

  const draft = {
    source: selectedSource.value,
    id: placeId,
    name,
    short_name: String((place as any)?.short_name ?? '').trim(),
    formatted_address: formatted,
    short_address: String((place as any)?.short_address ?? '').trim(),
    address: (place as any)?.address,
    lat: Number((place as any)?.lat ?? 0),
    lng: Number((place as any)?.lng ?? 0),
    image_shade:
      toShade((place as any)?.image_shade) === 'none'
        ? undefined
        : toShade((place as any)?.image_shade),
    image_url: resolvedLogo,
    claimed_by: String((place as any)?.claimed_by ?? '').trim(),
    website: String((place as any)?.website ?? '').trim(),
    phone: String((place as any)?.phone ?? '').trim(),
    google_maps_url: String((place as any)?.google_maps_url ?? '').trim(),
    types: Array.isArray((place as any)?.types) ? (place as any).types : [],
    price_level: String((place as any)?.price_level ?? '').trim(),
    default_currency_code: String(
      (place as any)?.default_currency_code ?? ''
    ).trim(),
    business_hours: (place as any)?.business_hours,
    search_term:
      existingSearchTerm || `${name} ${formatted}`.toLowerCase().trim(),
  }

  return Object.fromEntries(
    Object.entries(draft).filter(([, value]) => {
      if (typeof value === 'string') return Boolean(value)
      if (Array.isArray(value)) return value.length > 0
      if (value && typeof value === 'object')
        return Object.keys(value).length > 0
      if (typeof value === 'number')
        return Number.isFinite(value) && value !== 0
      return value !== null && value !== undefined
    })
  ) as PlaceUpsertInput & { source: PlaceSearchSource }
}

async function onConfirmClick() {
  const place = selectedPlace.value
  if (!place || confirming.value) return

  const placeId = String(
    (place as any)?.id ?? (place as any)?.place_id ?? ''
  ).trim()
  if (!placeId) return

  const isCurrent = captureIntent()
  confirming.value = true
  try {
    if (import.meta.dev) {
      console.log('[places][confirm] start', {
        placeId,
        source: selectedSource.value,
        image_url:
          (place as any)?.image_url ?? (place as any)?.place_image ?? '',
        selected_logo_state: selectedLogo.value ?? '',
        selected_cell_image: selectedCell.value?.imageUrl ?? '',
      })
    }

    let logoOverride = selectedLogo.value

    if (import.meta.dev) {
      console.log('[places][confirm] logo', {
        placeId,
        selected_logo: selectedLogo.value ?? '',
        logo_override: logoOverride ?? '',
        override_is_google_icon:
          /maps\.gstatic\.com\/mapfiles\/place_api\/icons/i.test(
            logoOverride ?? ''
          ),
      })
    }

    const draft = toDraft(place, placeId, logoOverride)

    if (import.meta.dev) {
      console.log('[places][confirm] draft', {
        placeId,
        draft_image: draft.image_url,
        draft_shade: draft.image_shade,
      })
    }

    if (selectedSource.value === 'google') {
      const ok = await ensurePlaceExists(draft)
      if (import.meta.dev) {
        console.log('[places][confirm] ensurePlaceExists', {
          placeId,
          ok,
          draft_image: draft.image_url,
        })
      }
      if (!ok) return
    }

    if (!isCurrent()) return
    emit('confirmed', { placeId, place: draft })
    clear()
  } finally {
    if (isCurrent()) confirming.value = false
  }
}
</script>
