<template>
  <MoleculesFormsFirestoreObjectArray
    :label="label"
    :firebase-value="items"
    :update-function="onSave"
    :item-title="itemTitle"
    :item-date="itemDate"
    :show-actions="true"
  >
    <template #display="{ item }">
      <div class="space-y-2">
        <PlaceCardsPill
          v-if="resolvePlaceCard(item)"
          v-bind="resolvePlaceCard(item)"
          :show-badges="false"
          :link="false"
          class="max-w-full"
        />
        <span v-else class="text-sm text-dimmed">{{ formatPlace(item) }}</span>
        <p v-if="item.responsibilities" class="form-text form-text-muted">
          {{ item.responsibilities }}
        </p>
      </div>
    </template>

    <template #create="{ push }">
      <UButton
        size="xs"
        variant="soft"
        @click="push(newExperienceItem())"
      >
        {{ createLabel }}
      </UButton>
    </template>
  </MoleculesFormsFirestoreObjectArray>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { RadioGroupItem } from '@nuxt/ui'
import { doc, getDoc } from 'firebase/firestore'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import { mapPlaceToCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/mapPlaceToCard'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref, watch } from 'vue'
import { useFirestore } from 'vuefire'
import type { ExperienceItem } from '../../../../../models/profiles/Professional/supporting'

type ExperienceEntry = ExperienceItem

type DateRangeValue = {
  start?: CalendarDate | null
  end?: CalendarDate | null
}

const props = defineProps<{
  label: string
  items: ExperienceEntry[]
  onSave: (items: ExperienceEntry[]) => Promise<void>
  placeType?: string | null
  placeCollections?: string[]
}>()

const createLabel = computed(() => `Add ${props.label.toLowerCase()}`)
const itemTitle = (item: ExperienceEntry) => item.role || 'Role'
const itemDate = (item: ExperienceEntry) => formatRange(item)

const db = useFirestore()
const placeCache = ref<Record<string, Record<string, any>>>({})
const toPlaceCard = mapPlaceToCard()
const { ensurePlaceExists } = usePlaceSave()

const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' })

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const monthLookup = new Map(
  monthLabels.map((label, index) => [label.toLowerCase(), index + 1])
)

const collections = computed(() => props.placeCollections ?? [])
const selectedCollection = ref<string | null>(collections.value[0] ?? null)

const collectionOptions = computed<RadioGroupItem[]>(() =>
  collections.value.map((value) => ({
    label: value.replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }))
)

const resolvedPlaceType = computed(() => {
  const collection = selectedCollection.value
  if (collection === 'kitchens') return 'kitchen'
  if (collection === 'companies') return 'company'
  if (collection === 'places') return null
  if (collection && collection.endsWith('s')) return collection.slice(0, -1)
  return props.placeType ?? null
})

watch(
  collections,
  (next) => {
    if (!next.length) {
      selectedCollection.value = null
      return
    }
    if (!selectedCollection.value || !next.includes(selectedCollection.value)) {
      selectedCollection.value = next[0]
    }
  },
  { immediate: true }
)

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
  try {
    const snap = await getDoc(doc(db, 'places', placeId))
    if (!snap.exists()) {
      placeCache.value[placeId] = {}
      return
    }
    const data = snap.data() as Record<string, any>
    placeCache.value[placeId] = data
  } catch {
    placeCache.value[placeId] = {}
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
  const start = [item.from_month, item.from_year].filter(Boolean).join(' ')
  const end = item.ongoing
    ? 'Present'
    : [item.to_month, item.to_year].filter(Boolean).join(' ')
  return [start, end].filter(Boolean).join(' · ') || 'Dates not listed'
}

const normalizeMonth = (value?: string | null) => {
  if (!value) return null
  const key = value.trim().slice(0, 3).toLowerCase()
  return monthLookup.get(key) ?? null
}

const toCalendarDate = (month?: string | null, year?: string | null) => {
  const monthIndex = normalizeMonth(month)
  const yearValue = year ? Number.parseInt(String(year), 10) : Number.NaN
  if (!monthIndex || Number.isNaN(yearValue)) return null
  return new CalendarDate(yearValue, monthIndex, 1)
}

const toMonthLabel = (monthNumber: number) => monthLabels[monthNumber - 1] || ''

const rangeForItem = (item: ExperienceEntry): DateRangeValue => {
  const start = toCalendarDate(item.from_month, item.from_year)
  const end = item.ongoing ? null : toCalendarDate(item.to_month, item.to_year)
  return { start: start ?? null, end: end ?? null }
}

const applyRange = (item: ExperienceEntry, range: DateRangeValue) => {
  if (!range || !range.start) {
    item.from_month = ''
    item.from_year = ''
    item.to_month = ''
    item.to_year = ''
    item.ongoing = false
    return
  }

  if (range.start) {
    item.from_month = toMonthLabel(range.start.month)
    item.from_year = String(range.start.year)
  }

  if (!range.end) {
    item.to_month = ''
    item.to_year = ''
    item.ongoing = true
  } else {
    item.to_month = toMonthLabel(range.end.month)
    item.to_year = String(range.end.year)
    item.ongoing = false
  }
}

const onToggleOngoing = (item: ExperienceEntry, value: boolean) => {
  item.ongoing = value
  if (value) {
    item.to_month = ''
    item.to_year = ''
  }
}

const formatRangeLabel = (item: ExperienceEntry) => {
  const range = rangeForItem(item)
  if (!range?.start) return 'Pick a date'
  const start = dateFormatter.format(range.start.toDate(getLocalTimeZone()))
  if (!range.end) return start
  const end = dateFormatter.format(range.end.toDate(getLocalTimeZone()))
  return `${start} - ${end}`
}

const onSaveClick = (save: () => void, item: ExperienceEntry) => {
  console.log('[ExperienceSection] Save clicked', {
    item: { ...item },
  })
  save()
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
  return toPlaceCard({ ...cached, id: placeId })
}
const hasPlace = (item: ExperienceEntry) => Boolean(canonicalPlaceId(item?.place_id ?? undefined))
const newExperienceItem = (): ExperienceEntry => ({
  role: '',
  place_id: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  ongoing: false,
  responsibilities: '',
})

const onApplyPlaceConfirmed = async (
  payload: { placeId: string; place: PlaceUpsertInput },
  target: ExperienceEntry
) => {
  const placeId = canonicalPlaceId(payload.placeId) || payload.placeId
  if (placeId) {
    const placePayload = { ...payload.place, id: placeId }
    placeCache.value[placeId] = { ...placePayload }
    await ensurePlaceExists(placePayload)
  }
  target.place_id = placeId || ''
}
</script>
