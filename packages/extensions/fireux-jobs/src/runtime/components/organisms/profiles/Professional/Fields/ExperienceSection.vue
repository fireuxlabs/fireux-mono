<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Fields/ExperienceSection.vue -->
<template>
  <MoleculesFormsFirestoreObjectArray
    :label="label"
    :firebase-value="items"
    :update-function="onSave"
    :item-title="itemTitle"
    :item-date="itemDate"
    :show-actions="true"
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
    <template #edit="{ item, index, save, cancel }">
      <div class="flex flex-col gap-3">
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
            @click="() => {
              selectedCollection = collection
              item.place_collection = collection
            }"
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
          @selected="(payload: PlaceSelectedPayload) => onPlaceSelected(item, payload)"
        />

        <PlaceCardsDropdownSelected
          v-if="showDraftCard(item)"
          :name="item.place_draft.name || ''"
          :address="item.place_draft.formatted_address || item.place_draft.short_address || ''"
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
                  @update:model-value="(value: DateValue | null) => onStartDateChange(item, value)"
                />
              </template>
            </UPopover>
          </div>

          <div class="space-y-1">
            <div class="text-xs font-medium text-dimmed">Ongoing</div>
            <UCheckbox
              :model-value="Boolean(item.ongoing)"
              label=""
              @update:model-value="(v: boolean) => onToggleOngoing(item, Boolean(v))"
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
                  @update:model-value="(value: { start?: DateValue | null; end?: DateValue | null } | null) => onRangeDateChange(item, value)"
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
          <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save()">
            Save
          </UButton>
          <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel()">
            Cancel
          </UButton>
        </div>
      </div>
    </template>

    <!-- ADD -->
    <template #create="{ push }">
      <div class="flex items-center gap-2">
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
  </MoleculesFormsFirestoreObjectArray>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFirestore } from 'vuefire'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/google/usePlacesGoogle'
import { mapPlaceToBasePlace } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/mapPlaceToBasePlace'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface'
import { usePlacesInterface } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import { useCompanyCreate } from 'fireux-companies/runtime/composables/fireux/firestore/company/mutations/useCompanyCreate'
import { useKitchenCreate } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import type { Place, PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type { ExperienceItem } from '../../../../../models/profiles/Professional/supporting'

type PlaceSelectedPayload = { placeId: string; place: PlaceUpsertInput }

const props = defineProps<{
  label: string
  items: ExperienceItem[]
  onSave: (items: ExperienceItem[]) => Promise<void>
  placeCollections?: string[]
  collections?: string[]
}>()

const collectionOptions = computed(() => props.placeCollections ?? props.collections ?? [])

const selectedCollection = ref(collectionOptions.value[0] ?? '')

watch(collectionOptions, (next) => {
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

const db = useFirestore()
const { ensurePlaceExists } = usePlaceSave()
const { createKitchen } = useKitchenCreate()
const { createCompany } = useCompanyCreate()

const normalizePlaceId = (placeId?: string | null) => {
  const normalized = canonicalPlaceId(placeId ?? '')
  if (normalized) return normalized
  return placeId ? placeId.replace(/^places\//, '') : ''
}

const { firestoreFetchDoc } = useFirestoreManager()
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
    (ids) => {
      const next = new Map<string, Ref<Place | undefined>>()
      for (const id of ids) {
        const existing = placeDocRefs.value.get(id)
        next.set(id, existing ?? firestoreFetchDoc<Place>('places', id))
      }
      placeDocRefs.value = next
    },
    { immediate: true }
  )
}

const toPlaceBase = mapPlaceToBasePlace()
const { card: toPlaceCard } = usePlacesInterface()

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

const itemTitle = (item: ExperienceItem) => item.role || 'Experience'

const itemDate = (item: ExperienceItem) => {
  if (!item.from_year && !item.to_year && !item.ongoing) return ''
  const start = item.from_year || 'Start'
  const end = item.ongoing ? 'Present' : (item.to_year || 'End')
  return `${start}–${end}`
}

function formatCollectionLabel(value: string) {
  return String(value ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

async function onPlaceSelected(item: ExperienceItem, payload: PlaceSelectedPayload) {
  const normalizedId = normalizePlaceId(payload.placeId) || payload.placeId
  item.place_id = normalizedId
  item.place_collection = selectedCollection.value || item.place_collection || ''
  ;(item as any).place_draft = payload.place

  const ok = await ensurePlaceExists({ ...payload.place, id: normalizedId })
  if (!ok) return

  await ensureCollectionRecord(item.place_collection, normalizedId, payload.place)
}

async function ensureCollectionRecord(
  collection: string,
  placeId: string,
  place: PlaceUpsertInput
) {
  if (collection === 'kitchens') {
    const ref = doc(db, 'kitchens', placeId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await createKitchen({
        id: placeId,
        website: '',
        professionals_current: [],
        professionals_alumni: [],
        place,
      })
    }
    return
  }

  if (collection === 'companies') {
    const ref = doc(db, 'companies', placeId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await createCompany({ id: placeId, place })
    }
  }
}

function showDraftCard(item: ExperienceItem) {
  const draft = (item as any)?.place_draft as Partial<PlaceUpsertInput> | undefined
  if (!draft) return false
  return Boolean(
    draft.name ||
    draft.formatted_address ||
    draft.short_address ||
    draft.image_url
  )
}

/** Dates */
const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' })

function monthToNumber(value: string | undefined) {
  if (!value) return null
  const raw = String(value).trim()
  if (raw.length !== 3) return null
  const short = raw.toLowerCase()
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const idx = months.indexOf(short)
  return idx >= 0 ? idx + 1 : null
}

function toCalendarDate(month?: string, year?: string): CalendarDate | null {
  const monthNum = monthToNumber(month)
  const yearNum = Number(String(year ?? '').trim())
  if (!monthNum || !Number.isFinite(yearNum)) return null
  return new CalendarDate(yearNum, monthNum, 1)
}

function formatDateLabel(value: DateValue | null | undefined) {
  if (!value) return ''
  return dateFormatter.format(value.toDate(getLocalTimeZone()))
}

function updateFromDate(item: ExperienceItem, value: DateValue) {
  const date = value.toDate(getLocalTimeZone())
  item.from_month = new DateFormatter('en-US', { month: 'short' }).format(date)
  item.from_year = String(value.year)
}

function updateToDate(item: ExperienceItem, value: DateValue) {
  const date = value.toDate(getLocalTimeZone())
  item.to_month = new DateFormatter('en-US', { month: 'short' }).format(date)
  item.to_year = String(value.year)
}

function getStartDate(item: ExperienceItem) {
  return toCalendarDate(item.from_month, item.from_year)
}

function getEndDate(item: ExperienceItem) {
  return toCalendarDate(item.to_month, item.to_year)
}

function getRangeValue(item: ExperienceItem) {
  return {
    start: getStartDate(item) ?? undefined,
    end: getEndDate(item) ?? undefined,
  }
}

function onStartDateChange(item: ExperienceItem, value: DateValue | null) {
  if (!value) return
  updateFromDate(item, value)
}

function onRangeDateChange(
  item: ExperienceItem,
  value: { start?: DateValue | null; end?: DateValue | null } | null
) {
  if (!value) return
  if (value.start) updateFromDate(item, value.start)
  if (value.end) {
    updateToDate(item, value.end)
  } else {
    item.to_month = ''
    item.to_year = ''
  }
}

function onToggleOngoing(item: ExperienceItem, value: boolean) {
  item.ongoing = value
  if (value) {
    item.to_month = ''
    item.to_year = ''
  }
}

function newExperienceItem(): ExperienceItem {
  return {
    place_id: '',
    place_collection: selectedCollection.value || '',
    role: '',
    responsibilities: '',
    from_month: '',
    from_year: '',
    to_month: '',
    to_year: '',
    ongoing: false,
  }
}
</script>