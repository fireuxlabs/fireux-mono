<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Fields/ExperienceSection.vue -->
<!-- flag -->
<template>
  <MoleculesFormsFirestoreObjectArray
    :label="label"
    :firebase-value="items"
    :update-function="onSave"
    :item-title="itemTitle"
    :item-date="itemDate"
    :show-actions="true"
  >
    <!-- Display (read-only place, plus responsibilities) -->
    <template #display="{ item }">
      <div class="space-y-2">
        <PlaceCardsPill
          v-if="resolvePlaceCard(item)"
          v-bind="resolvePlaceCard(item)"
          :show-badges="false"
          :link="false"
          class="pill"
        />
        <span v-else class="text-sm text-dimmed mt-2">{{ formatPlace(item) }}</span>

        <p v-if="item.responsibilities" class="form-text-body">
          {{ item.responsibilities }}
        </p>
      </div>
    </template>

    <!-- Edit (place uses Places API) -->
    <template #edit="{ item, save, cancel }">
      <div class="space-y-3">
        <div class="space-y-2">
          <div v-if="placeCollectionOptions.length > 1" class="space-y-1">
            <div class="text-xs font-medium text-dimmed">Experience type</div>
            <USelect
              v-model="item.place_collection"
              :options="placeCollectionOptions"
              placeholder="Select collection"
              size="sm"
            />
          </div>

          <PlaceCardsPill
            v-if="item.place_id && resolvePlaceCard(item)"
            v-bind="resolvePlaceCard(item)"
            :show-badges="false"
            :link="false"
            class="max-w-full"
          />

          <span
            v-else-if="item.place_id"
            class="text-sm text-dimmed"
          >
            {{ formatPlace(item) }}
          </span>

          <div v-else-if="canSearchPlace(item)">
            <PlaceSearchSection
              :type="resolvePlaceType(item)"
              :placeholder="searchPlaceholder"
              @confirmed="(payload: PlaceConfirmedPayload) => onPlaceConfirmedPayload(item, payload)"
            />
          </div>

          <div v-else class="text-xs text-dimmed">
            Select an experience type to search for a place.
          </div>
        </div>

        <UInput v-model="item.role" placeholder="Role (e.g. Chef de Partie)" />

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

        <UTextarea
          v-model="item.responsibilities"
          :rows="3"
          placeholder="Responsibilities"
        />

        <div class="flex gap-2">
          <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
            Save
          </UButton>
          <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
            Cancel
          </UButton>
        </div>
      </div>
    </template>

    <!-- Create -->
    <template #create="{ push }">
      <UButton size="xs" variant="soft" @click="push(newExperienceItem())">
        {{ createLabel }}
      </UButton>
    </template>
  </MoleculesFormsFirestoreObjectArray>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { doc, getDoc } from 'firebase/firestore'
import { useKitchenCreate } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/mutations/useKitchenCreate'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import { mapPlaceToBasePlace } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/mapPlaceToBasePlace'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import { usePlacesInterface } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref, watch } from 'vue'
import { useFirestore } from 'vuefire'
import type { ExperienceItem } from '../../../../../models/profiles/Professional/supporting'

type ExperienceEntry = ExperienceItem

type PlaceConfirmedPayload = {
  placeId: string
  place: Record<string, any>
}

const props = withDefaults(defineProps<{
  label: string
  items: ExperienceEntry[]
  onSave: (items: ExperienceEntry[]) => Promise<void>
  placeType?: string | null
  placeCollections?: string[]
}>(), {
  placeType: null,
  placeCollections: () => [],
})

const createLabel = computed(() => `Add ${props.label.toLowerCase()}`)
const searchPlaceholder = computed(() => {
  const base = props.placeType ? String(props.placeType) : 'place'
  return base === 'place' ? 'Search places...' : `Search ${base}...`
})
const itemTitle = (item: ExperienceEntry) => item.role || 'Role'
const itemDate = (item: ExperienceEntry) => formatRange(item)

const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' })

const db = useFirestore()
const { ensurePlaceExists } = usePlaceSave()
const { createKitchen } = useKitchenCreate()
const placeCache = ref<Record<string, Record<string, any>>>({})
const placeRequests = ref<Set<string>>(new Set())
const toPlaceBase = mapPlaceToBasePlace()
const { card: toPlaceCard } = usePlacesInterface()

const placeIds = computed(() => {
  const ids = new Set<string>()
  for (const item of props.items ?? []) {
    const id = canonicalPlaceId(item?.place_id ?? undefined)
    if (id) ids.add(id)
  }
  return [...ids]
})

const hydratePlace = async (placeId: string) => {
  if (!placeId || placeCache.value[placeId]) return
  if (placeRequests.value.has(placeId)) return
  placeRequests.value.add(placeId)
  try {
    const snap = await getDoc(doc(db, 'places', placeId))
    if (!snap.exists()) {
      placeCache.value[placeId] = {}
      return
    }
    placeCache.value[placeId] = snap.data() as Record<string, any>
  } catch {
    placeCache.value[placeId] = {}
  } finally {
    placeRequests.value.delete(placeId)
  }
}

watch(
  placeIds,
  (ids) => {
    ids.forEach((id) => void hydratePlace(id))
  },
  { immediate: true }
)

const formatRange = (item: ExperienceEntry) => {
  const startYear = String(item.from_year || '').trim()
  const endYear = item.ongoing
    ? 'Present'
    : String(item.to_year || '').trim()

  if (startYear && endYear && endYear !== 'Present' && startYear === endYear) {
    return startYear
  }

  if (startYear && endYear) return `${startYear} - ${endYear}`
  if (startYear) return startYear
  if (endYear) return endYear
  return 'Dates not listed'
}

const onToggleOngoing = (item: ExperienceEntry, value: boolean) => {
  item.ongoing = value
  if (value) {
    item.to_month = ''
    item.to_year = ''
  }
}

const monthToNumber = (value: string | undefined) => {
  if (!value) return null
  const raw = String(value).trim().toLowerCase()
  if (!raw) return null
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) return numeric
  const short = raw.slice(0, 3)
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const idx = months.indexOf(short)
  return idx >= 0 ? idx + 1 : null
}

const toCalendarDate = (month?: string, year?: string): CalendarDate | null => {
  const monthNum = monthToNumber(month)
  const yearNum = Number(String(year ?? '').trim())
  if (!monthNum || !Number.isFinite(yearNum)) return null
  return new CalendarDate(yearNum, monthNum, 1)
}

const formatDateLabel = (value: DateValue | null | undefined) => {
  if (!value) return ''
  return dateFormatter.format(value.toDate(getLocalTimeZone()))
}

const updateFromDate = (item: ExperienceEntry, value: DateValue) => {
  const date = value.toDate(getLocalTimeZone())
  item.from_month = new DateFormatter('en-US', { month: 'short' }).format(date)
  item.from_year = String(value.year)
}

const updateToDate = (item: ExperienceEntry, value: DateValue) => {
  const date = value.toDate(getLocalTimeZone())
  item.to_month = new DateFormatter('en-US', { month: 'short' }).format(date)
  item.to_year = String(value.year)
}

const getStartDate = (item: ExperienceEntry) =>
  toCalendarDate(item.from_month, item.from_year)

const getEndDate = (item: ExperienceEntry) =>
  toCalendarDate(item.to_month, item.to_year)

const getRangeValue = (item: ExperienceEntry) => ({
  start: getStartDate(item) ?? undefined,
  end: getEndDate(item) ?? undefined,
})

const onStartDateChange = (item: ExperienceEntry, value: DateValue | null) => {
  if (!value) return
  updateFromDate(item, value)
}

const onRangeDateChange = (
  item: ExperienceEntry,
  value: { start?: DateValue | null; end?: DateValue | null } | null
) => {
  if (!value) return
  if (value.start) updateFromDate(item, value.start)
  if (value.end) {
    updateToDate(item, value.end)
  } else {
    item.to_month = ''
    item.to_year = ''
  }
}

const formatPlace = (item: ExperienceEntry) => {
  const placeId = canonicalPlaceId(item?.place_id ?? undefined)
  if (!placeId) return 'Place'
  const cached = placeCache.value[placeId]
  if (cached && Object.keys(cached).length) {
    return cached.name || cached.short_address || cached.formatted_address || 'Place'
  }
  void hydratePlace(placeId)
  return 'Place loading…'
}

const resolvePlaceCard = (item: ExperienceEntry): PlaceCard.Card | null => {
  const placeId = canonicalPlaceId(item?.place_id ?? undefined)
  if (!placeId) return null
  const cached = placeCache.value[placeId]
  if (!cached) {
    void hydratePlace(placeId)
    return null
  }
  const base = toPlaceBase({ ...cached, id: placeId })
  return toPlaceCard(base)
}

const onPlaceConfirmed = (
  item: ExperienceEntry,
  placeId: string,
  place?: Record<string, any>
) => {
  item.place_id = placeId
  if (placeId && place) {
    placeCache.value[placeId] = { ...place, id: placeId }
  }
}

const onPlaceConfirmedPayload = (
  item: ExperienceEntry,
  payload: PlaceConfirmedPayload
) => {
  void handleConfirmedPlace(item, payload)
}

const placeCollectionOptions = computed(() =>
  (props.placeCollections ?? [])
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .map((value) => ({ label: value, value }))
)

const resolvePlaceCollection = (item: ExperienceEntry) => {
  const current = String((item as any)?.place_collection ?? '').trim()
  if (current) return current
  const collections = placeCollectionOptions.value
  if (collections.length === 1) return collections[0].value
  return ''
}

const resolvePlaceType = (item: ExperienceEntry) =>
  resolvePlaceCollection(item) || props.placeType || 'place'

const canSearchPlace = (item: ExperienceEntry) => {
  if (placeCollectionOptions.value.length <= 1) return true
  return Boolean(resolvePlaceCollection(item))
}

const ensurePlaceCollection = async (
  collection: string,
  placeId: string,
  place?: PlaceUpsertInput
) => {
  if (!collection || !placeId) return

  const normalized = canonicalPlaceId(placeId) || placeId

  if (place) {
    await ensurePlaceExists({ ...place, id: normalized })
  } else {
    await ensurePlaceExists({ id: normalized })
  }

  if (collection === 'kitchens') {
    const existingSnap = await getDoc(doc(db, 'kitchens', normalized))
    if (!existingSnap.exists()) {
      await createKitchen({ id: normalized, website: '' })
    }
  }
}

const handleConfirmedPlace = async (
  item: ExperienceEntry,
  payload: PlaceConfirmedPayload
) => {
  const collection = resolvePlaceCollection(item)
  if (!collection && placeCollectionOptions.value.length > 1) return

  item.place_collection = collection
  onPlaceConfirmed(item, payload.placeId, payload.place)

  await ensurePlaceCollection(collection, payload.placeId, payload.place as PlaceUpsertInput)
}

const newExperienceItem = (): ExperienceEntry => ({
  role: '',
  place_id: '',
  place_collection: placeCollectionOptions.value.length === 1
    ? placeCollectionOptions.value[0].value
    : '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  ongoing: false,
  responsibilities: '',
})
</script>