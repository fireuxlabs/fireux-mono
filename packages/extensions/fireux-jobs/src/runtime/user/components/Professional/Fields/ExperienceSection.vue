<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Professional/Fields/ExperienceSection.vue -->
<!-- Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: persist Place references only after their canonical records exist. -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: remove domain-specific workplace materialization from professional experience. -->
<!-- Concurrent edit — 2026-07-21 13:03 CEST — Misebox Jobs workplace adapter: require owner materialization before assigning experience references. -->
<!-- Concurrent edit — 2026-07-21 13:11 CEST — Cleanbox-to-Werkbox profile correction: persist direct Place references with the canonical blank discriminator. -->
<!-- Concurrent edit — 2026-07-21 14:08 CEST — Trusted Professional API: use idempotent server materializers without raw Company existence reads. -->
<!-- Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: enrich experience through bounded exact Place reads. -->
<template>
  <MoleculesFormsEditableObjectArray
    :label="label"
    :value="items"
    :update="onSave"
    :item-title="itemTitle"
    :item-date="itemDate"
    :show-actions="true"
    :max-items="maxItems"
  >
    <!-- DISPLAY -->
    <template #display="{ item }">
      <div class="space-y-2">
        <PlaceCardsPill
          v-if="getPlaceCard(item.place_id)"
          v-bind="getPlaceCard(item.place_id)"
          :show-badges="false"
        />

        <p v-if="item.responsibilities" class="text-sm text-dimmed">
          {{ item.responsibilities }}
        </p>
      </div>
    </template>

    <!-- EDIT / CREATE -->
    <template #edit="{ item, index, save, cancel, captureIntent: captureEditorIntent }">
      <div class="flex flex-col gap-3">
        <UAlert
          v-if="placeSelectionError"
          color="error"
          variant="soft"
          title="Workplace could not be selected"
          :description="placeSelectionError"
        />

        <!-- Collection toggle (create only) -->
        <div
          v-if="index === items.length && collectionOptions.length > 1"
          class="flex flex-wrap items-center gap-2"
        >
          <UButton
            v-for="collection in collectionOptions"
            :key="collection"
            size="xs"
            :variant="selectedCollection === collection ? 'solid' : 'soft'"
            @click="
              () => {
                selectedCollection = collection
              }
            "
          >
            {{ formatCollectionLabel(collection) }}
          </UButton>
        </div>

        <!-- Place search / selected -->
        <PlaceSearchSection
          v-if="!item.place_id"
          :type="effectivePlaceType"
          :placeholder="`Search ${formatCollectionLabel(selectedCollection || 'place')}`"
          :show-confirm-button="false"
          :show-clear-button="false"
          @selected="
            (payload: PlaceSelectedPayload) => onPlaceSelected(item, payload, captureEditorIntent())
          "
        />

        <PlaceCardsDropdownSelected
          v-if="showDraftCard(item)"
          :name="item.place_draft.name || ''"
          :address="
            item.place_draft.formatted_address ||
            item.place_draft.short_address ||
            ''
          "
          :image-url="item.place_draft.image_url || ''"
          :image-shade="item.place_draft.image_shade || 'none'"
          :source="item.place_draft.source || 'google'"
        />

        <PlaceCardsPill
          v-else-if="getPlaceCard(item.place_id)"
          v-bind="getPlaceCard(item.place_id)"
          :show-badges="false"
        />

        <!-- Role -->
        <UInput v-model="item.role" placeholder="Role (optional)" />

        <!-- Dates + ongoing -->
        <div class="grid gap-2 sm:grid-cols-3">
          <div class="space-y-1">
            <div class="text-xs font-medium text-dimmed">From</div>
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
                class="w-full justify-start"
              >
                {{ formatDateLabel(getStartDate(item)) || 'Select start date' }}
              </UButton>

              <template #content>
                <UCalendar
                  class="p-2"
                  :model-value="getStartDate(item)"
                  @update:model-value="
                    (value: ExperienceCalendarUpdateValue) =>
                      onStartDateChange(item, value)
                  "
                />
              </template>
            </UPopover>
          </div>

          <div class="space-y-1">
            <div class="text-xs font-medium text-dimmed">Ongoing</div>
            <UCheckbox
              :model-value="Boolean(item.ongoing)"
              label=""
              @update:model-value="
                (value: boolean | 'indeterminate') =>
                  onToggleOngoing(item, value)
              "
            />
          </div>

          <div v-if="!item.ongoing" class="space-y-1">
            <div class="text-xs font-medium text-dimmed">To</div>
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
                class="w-full justify-start"
              >
                {{ formatDateLabel(getEndDate(item)) || 'Select end date' }}
              </UButton>

              <template #content>
                <UCalendar
                  class="p-2"
                  :model-value="getRangeValue(item)"
                  range
                  @update:model-value="
                    (value: ExperienceCalendarUpdateValue) =>
                      onRangeDateChange(item, value)
                  "
                />
              </template>
            </UPopover>
          </div>
        </div>

        <!-- Responsibilities -->
        <UTextarea
          v-model="item.responsibilities"
          :rows="3"
          placeholder="Responsibilities (optional)"
        />

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="solid"
            icon="i-lucide-check"
            @click="save()"
          >
            Save
          </UButton>
          <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel()">
            Cancel
          </UButton>
        </div>
      </div>
    </template>

    <!-- ADD -->
    <template #create="{ push, canPush }">
      <div v-if="canPush" class="flex items-center gap-2">
        <UButton
          size="xs"
          variant="solid"
          icon="i-lucide-plus"
          @click="push(newExperienceItem())"
        >
          Experience
        </UButton>
      </div>
    </template>
  </MoleculesFormsEditableObjectArray>
</template>

<script setup lang="ts">
import { canonicalPlaceId } from 'fireux-places/runtime/place/composables/firestore/fetch/google/usePlacesGoogle'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { mapPlaceToBasePlace } from 'fireux-places/runtime/place/composables/firestore/utils/view/mapPlaceToBasePlace'
import type { PlaceCard } from 'fireux-places/runtime/place/composables/firestore/utils/view/usePlaceInterface'
import { usePlaceInterface } from 'fireux-places/runtime/place/composables/firestore/utils/view/usePlaceInterface'
import { usePlaceCreate } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceCreate'
import { useCompanyCreate } from 'fireux-companies/runtime/place/composables/firestore/company/mutations/useCompanyCreate'
import { CompanyStorage } from 'fireux-companies/runtime/place/models/company.entity'
import {
  type Place,
} from 'fireux-places/runtime/place/models/place.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/place/models/place-onboarding.model'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type { ExperienceItem } from '../../../utils/profiles/Professional/professional'
import { materializeJobWorkplace } from '../../../composables/profiles/Professional/workplace/materializeWorkplace'
import {
  experienceItemDate as itemDate,
  experienceItemTitle as itemTitle,
  formatExperienceCollectionLabel as formatCollectionLabel,
  formatExperienceDateLabel as formatDateLabel,
  getExperienceEndDate as getEndDate,
  getExperienceRange as getRangeValue,
  getExperienceStartDate as getStartDate,
  newExperienceItem,
  showExperienceDraftCard as showDraftCard,
  toggleExperienceOngoing as onToggleOngoing,
  updateExperienceRange as onRangeDateChange,
  updateExperienceStart as onStartDateChange,
  type ExperienceCalendarUpdateValue,
} from './experienceEditor'

type PlaceSelectedPayload = { placeId: string; place: PlaceUpsertInput }
const props = defineProps<{
  label: string
  items: ExperienceItem[]
  onSave: (items: ExperienceItem[]) => Promise<void>
  maxItems: number
  placeCollections?: string[]
  collections?: string[]
}>()

const collectionOptions = computed(
  () => props.placeCollections ?? props.collections ?? []
)

const selectedCollection = ref(collectionOptions.value[0] ?? '')

watch(collectionOptions, (next: string[]) => {
  if (!next.length) {
    selectedCollection.value = ''
    return
  }
  if (!next.includes(selectedCollection.value)) {
    selectedCollection.value = next[0]
  }
})

const effectivePlaceType = computed(() => {
  const raw = String(selectedCollection.value ?? '').trim()
  return raw || null
})

const { ensurePlaceExists, captureIntent } = usePlaceCreate({ sources: [selectedCollection, () => props.items] })
const { createCompany } = useCompanyCreate()
const placeSelectionError = ref('')

const normalizePlaceId = (placeId?: string | null) => {
  const normalized = canonicalPlaceId(placeId ?? '')
  if (normalized) return normalized
  return placeId ? placeId.replace(/^places\//, '') : ''
}

const { place: fetchPlace } = usePlaceFetch()
const placeDocRefs = shallowRef(new Map<string, Ref<Place | undefined>>())

const placeIds = computed(() => {
  const ids = new Set<string>()
  for (const item of props.items ?? []) {
    const normalized = normalizePlaceId(item.place_id)
    if (normalized) ids.add(normalized)
  }
  return Array.from(ids)
})

if (import.meta.client) {
  watch(
    placeIds,
    (ids: string[]) => {
      const current = placeDocRefs.value
      const next = new Map<string, Ref<Place | undefined>>()

      for (const id of ids) {
        const existing = current.get(id)
        const source = existing ?? fetchPlace(id)
        next.set(id, source)
      }
      placeDocRefs.value = next
    },
    { immediate: true, flush: 'sync' }
  )
}

const toPlaceBase = mapPlaceToBasePlace()
const { pill: toPlaceCard } = usePlaceInterface()

const placeCardLookup = computed(() => {
  const map = new Map<string, PlaceCard.Card | null>()
  for (const [id, docRef] of placeDocRefs.value.entries()) {
    const base = docRef.value ? toPlaceBase(docRef.value) : null
    map.set(id, base ? toPlaceCard(base) : null)
  }
  return map
})

const getPlaceCard = (placeId?: string | null) => {
  const normalized = normalizePlaceId(placeId)
  if (!normalized) return null
  return placeCardLookup.value.get(normalized) ?? null
}

function persistedPlaceCollection(value: string) {
  const normalized = String(value ?? '').trim()
  return normalized === 'places' ? '' : normalized
}

let selectionSequence = 0
async function onPlaceSelected(
  item: ExperienceItem,
  payload: PlaceSelectedPayload,
  editorCurrent: () => boolean
) {
  const sequence = ++selectionSequence, contextCurrent = captureIntent()
  const isCurrent = () => contextCurrent() && editorCurrent() && sequence === selectionSequence
  payload = JSON.parse(JSON.stringify(payload))
  placeSelectionError.value = ''
  const normalizedId = normalizePlaceId(payload.placeId) || payload.placeId
  const selectedPlaceCollection =
    selectedCollection.value || item.place_collection || 'places'
  const placeCollection = persistedPlaceCollection(selectedPlaceCollection)

  try {
    const ok = await ensurePlaceExists({ ...payload.place, id: normalizedId })
    if (!ok) throw new Error('The selected Place could not be materialized.')

    if (!isCurrent()) return
    if (placeCollection) {
      await ensureCollectionRecord(placeCollection, normalizedId, payload.place)
    }
  } catch (error) {
    if (!isCurrent()) return
    placeSelectionError.value =
      error instanceof Error && error.message
        ? error.message
        : 'The selected workplace could not be materialized.'
    return
  }

  if (!isCurrent()) return
  item.place_id = normalizedId
  item.place_collection = placeCollection
  ;(item as any).place_draft = payload.place
}

async function ensureCollectionRecord(
  collection: string,
  placeId: string,
  place: PlaceUpsertInput
) {
  if (collection === CompanyStorage.collection) {
    await createCompany({ id: placeId })
    return
  }

  await materializeJobWorkplace({
    workplaceCollection: collection,
    workplaceId: placeId,
    place: { ...place, id: placeId },
  })
}
</script>
