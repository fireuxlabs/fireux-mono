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
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <PlaceCardsPill
                  v-if="resolvePlaceCard(item)"
                  v-bind="resolvePlaceCard(item)"
                  :show-badges="false"
                  :link="false"
                  class="max-w-full"
                />
                <UBadge
                  v-else
                  variant="soft"
                  color="neutral"
                  size="xs"
                  class="gap-1"
                >
                  <UIcon name="i-lucide-map-pin" class="h-3.5 w-3.5" />
                  <span>{{ formatPlace(item) }}</span>
                </UBadge>
              </div>
            </div>
          <p v-if="item.responsibilities" class="text-sm text-gray-600">
            {{ item.responsibilities }}
          </p>
          <p class="text-xs text-dimmed italic">
            To change the place, delete this entry and create a new one.
          </p>
        </div>
      </template>

    <template #edit="{ item, save, cancel }">
      <div class="space-y-2">
        <OrganismsEntitiesPlaceSearchSection
          v-if="!item.place_id"
          :type="resolvedPlaceType"
          placeholder="Search places"
          @confirmed="onApplyPlaceConfirmed($event, item)"
        />
        <div v-else class="flex flex-wrap items-center gap-2">
          <PlaceCardsPill
            v-if="resolvePlaceCard(item)"
            v-bind="resolvePlaceCard(item)"
            :show-badges="false"
            :link="false"
            class="max-w-full"
          />
          <UBadge
            v-else
            variant="soft"
            color="neutral"
            size="xs"
            class="gap-1"
          >
            <UIcon name="i-lucide-map-pin" class="h-3.5 w-3.5" />
            <span>{{ formatPlace(item) }}</span>
          </UBadge>
        </div>
        <URadioGroup
          v-if="!item.place_id && collectionOptions.length > 1"
          v-model="selectedCollection"
          :items="collectionOptions"
        />
        <p v-if="!hasPlace(item)" class="text-xs text-dimmed">
          Select a place before saving.
        </p>
        <UInput v-model="item.role" placeholder="Role" />
        <div class="space-y-2">
          <p class="text-xs text-dimmed">Dates</p>
          <UPopover>
            <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
              {{ formatRangeLabel(item) }}
            </UButton>

            <template #content>
              <UCalendar
                :model-value="rangeForItem(item)"
                range
                :number-of-months="2"
                class="p-2"
                @update:modelValue="applyRange(item, $event)"
              />
            </template>
          </UPopover>
        </div>
        <UCheckbox
          v-model="item.ongoing"
          label="Ongoing"
          @update:modelValue="onToggleOngoing(item, $event)"
        />
        <UTextarea v-model="item.responsibilities" :rows="3" placeholder="Responsibilities" />
        <div class="flex gap-2">
          <UButton
            size="xs"
            variant="solid"
            icon="i-lucide-check"
            @click="onSaveClick(save, item)"
          >
            Save
          </UButton>
          <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
            Cancel
          </UButton>
        </div>
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
