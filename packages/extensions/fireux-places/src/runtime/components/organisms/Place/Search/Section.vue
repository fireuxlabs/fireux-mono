<!-- FILE: packages/extensions/fireux-places/src/runtime/components/organisms/Place/Search/Section.vue -->
<!-- flag -->
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
          @click="clear"
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

    <p v-if="isSearching" class="text-xs text-muted">Searching…</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { usePlacesSearch } from '../../../../composables/fireux/firestore/place/fetch/search/usePlacesSearch'
import { usePlaceSave } from '../../../../composables/fireux/firestore/place/mutations/usePlaceSave'
import {
    loadLogoForPlace,
    sanitizeLogoAvatar,
    usePlaceLogoState,
} from '../../../../composables/fireux/firestore/place/utils/view/usePlaceLogos'
import { usePlacesInterface } from '../../../../composables/fireux/firestore/place/utils/view/usePlacesInterface'
import type {
    BasePlace,
    PlaceImageShade,
    PlaceSource,
    PlaceUpsertInput,
} from '../../../../models/place.model'
import PlaceCardsDropdownSelected from '../Cards/Dropdown/Selected.vue'

const props = withDefaults(
  defineProps<{
    type?: string | null
    placeholder?: string | null
    showConfirmButton?: boolean
    showClearButton?: boolean
  }>(),
  { type: null, placeholder: null, showConfirmButton: true, showClearButton: true }
)

const placeholder = computed(() => props.placeholder || undefined)

const emit = defineEmits<{
  (e: 'selected', payload: { placeId: string; place: PlaceUpsertInput }): void
  (e: 'confirmed', payload: { placeId: string; place: PlaceUpsertInput }): void
}>()

const showConfirmButton = computed(() => props.showConfirmButton ?? true)
const showClearButton = computed(() => props.showClearButton ?? true)

const { query, results, selected, isSearching, select: selectPlace, clear } =
  usePlacesSearch({
    debugLabel: props.type === 'kitchen' ? 'kitchens' : undefined,
    type: props.type ?? null,
  })

const selectedPlace = computed(() => selected.value as BasePlace | null)

const selectedSource = computed<PlaceSource>(() => {
  const src = (selectedPlace.value as any)?.source
  return src === 'google' || src === 'manual' || src === 'fireux'
    ? src
    : 'fireux'
})

const typeLabel = computed(() => {
  const raw = (props.type ?? '').trim()
  if (!raw) return 'place'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

const confirmLabel = computed(() =>
  selectedSource.value === 'google' ? `Add ${typeLabel.value}` : `Use ${typeLabel.value}`
)

const { card } = usePlacesInterface()
const selectedCell = computed(() =>
  selectedPlace.value ? card(selectedPlace.value as any) : null
)

const selectedLogoTarget = computed(
  () => selectedCell.value ?? selectedPlace.value ?? null
)
const { avatar: selectedLogo, hydrate: hydrateLogo, isLoading: selectedLogoLoading } = usePlaceLogoState(
  selectedLogoTarget
)

const selectedImageUrl = computed(
  () => selectedLogo.value || selectedCell.value?.imageUrl || ''
)

const { ensurePlaceExists } = usePlaceSave({ type: props.type })
const confirming = ref(false)

function handleSelectPlace(place: BasePlace) {
  selectPlace(place)

  nextTick(() => {
    const selectedDraft = selectedPlace.value
    const placeId = String((selectedDraft as any)?.id ?? (selectedDraft as any)?.place_id ?? '').trim()
    if (!selectedDraft || !placeId) return

    const draft = toDraft(selectedDraft, placeId, selectedLogo.value)
    emit('selected', { placeId, place: draft })
  })
}

if (import.meta.dev && props.type === 'kitchen') {
  watch(query, (value) => {
    console.log('[kitchens][search] query', { query: value })
  })

  watch(isSearching, (value) => {
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
  const v = String(value ?? 'none').toLowerCase().trim()
  if (v === 'light' || v === 'dark' || v === 'none') return v
  return 'none'
}

function toDraft(
  place: BasePlace,
  placeId: string,
  logoOverride?: string | null
): PlaceUpsertInput {
  const name = String((place as any)?.name ?? '')
  const formatted = String((place as any)?.formatted_address ?? '')
  const existingSearchTerm = String((place as any)?.search_term ?? '').trim()

  const sanitizedPlaceImage =
    sanitizeLogoAvatar(String((place as any)?.image_url ?? (place as any)?.place_image ?? '')) ?? ''

  // Prefer override; else fall back to sanitized stored image
  let resolvedLogo =
    typeof logoOverride === 'string' ? logoOverride : sanitizedPlaceImage

  // For google sources: if we didn’t find a real logo, store empty string (so UI can hydrate later).
  if (selectedSource.value === 'google' && !resolvedLogo) {
    resolvedLogo = ''
  }

  return {
    id: placeId,
    source: selectedSource.value,
    name,
    short_name: String((place as any)?.short_name ?? ''),
    formatted_address: formatted,
    short_address: String((place as any)?.short_address ?? ''),
    lat: Number((place as any)?.lat ?? 0),
    lng: Number((place as any)?.lng ?? 0),

    // ✅ required by PlaceUpsertInput
    image_shade: toShade((place as any)?.image_shade),

    image_url: resolvedLogo,
    claimed_by: String((place as any)?.claimed_by ?? ''),
    search_term: existingSearchTerm || `${name} ${formatted}`.toLowerCase().trim(),
  }
}

async function onConfirmClick() {
  const place = selectedPlace.value
  if (!place || confirming.value) return

  const placeId = String((place as any)?.id ?? (place as any)?.place_id ?? '').trim()
  if (!placeId) return

  confirming.value = true
  try {
    if (import.meta.dev) {
      console.log('[places][confirm] start', {
        placeId,
        source: selectedSource.value,
        image_url: (place as any)?.image_url ?? (place as any)?.place_image ?? '',
        selected_logo_state: selectedLogo.value ?? '',
        selected_cell_image: selectedCell.value?.imageUrl ?? '',
      })
    }

    let logoOverride = selectedLogo.value

    if (selectedSource.value === 'google') {
      const cardForLogo = selectedCell.value ?? card(place as any)
      const cachedLogo = cardForLogo
        ? await loadLogoForPlace(cardForLogo, { timeoutMs: 2000, priority: true })
        : null

      if (import.meta.dev) {
        console.log('[places][confirm] cached-logo', {
          placeId,
          hasCard: Boolean(cardForLogo),
          cached_logo: cachedLogo ?? '',
        })
      }

      if (cachedLogo) {
        logoOverride = sanitizeLogoAvatar(cachedLogo) ?? null
      } else {
        const hydrated = await hydrateLogo({ timeoutMs: 6000, forceReload: true })
        const resolved = cardForLogo
          ? await loadLogoForPlace(cardForLogo, {
              timeoutMs: 6000,
              forceReload: true,
              priority: true,
            })
          : null

        if (import.meta.dev) {
          console.log('[places][confirm] hydrated-logo', {
            placeId,
            hydrated_logo: hydrated ?? '',
            resolved_logo: resolved ?? '',
          })
        }

        logoOverride =
          sanitizeLogoAvatar(resolved ?? hydrated ?? selectedLogo.value) ?? null
      }
    }

    if (import.meta.dev) {
      console.log('[places][confirm] logo', {
        placeId,
        selected_logo: selectedLogo.value ?? '',
        logo_override: logoOverride ?? '',
        override_is_google_icon: /maps\.gstatic\.com\/mapfiles\/place_api\/icons/i.test(
          logoOverride ?? ''
        ),
      })
    }

    const draft = toDraft(place, placeId, logoOverride)

    if (import.meta.dev) {
      console.log('[places][confirm] draft', {
        placeId,
        source: draft.source,
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

    emit('confirmed', { placeId, place: draft })
    clear()
  } finally {
    confirming.value = false
  }
}
</script>