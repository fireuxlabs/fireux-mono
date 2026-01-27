<template>
  <MoleculesFormsFirestoreObjectArray
    :label="label"
    :firebase-value="items"
    :update-function="onSave"
    :item-title="itemTitle"
    :item-date="itemDate"
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
          :type="placeType"
          placeholder="Search places"
          @confirmed="onApplyPlaceConfirmed($event, item)"
        />
        <UInput v-model="item.role" placeholder="Role" />
        <div class="grid gap-2 sm:grid-cols-2">
          <UInput v-model="item.from_month" placeholder="From month" />
          <UInput v-model="item.from_year" placeholder="From year" />
          <UInput v-model="item.to_month" placeholder="To month" />
          <UInput v-model="item.to_year" placeholder="To year" />
        </div>
        <UCheckbox v-model="item.ongoing" label="Ongoing" />
        <UTextarea v-model="item.responsibilities" :rows="3" placeholder="Responsibilities" />
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
import { doc, getDoc } from 'firebase/firestore'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { mapPlaceToCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/mapPlaceToCard'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref, watch } from 'vue'
import { useFirestore } from 'vuefire'
import type { ExperienceItem } from '../../../../../models/profiles/Professional/supporting'

type ExperienceEntry = ExperienceItem & {
  name?: string
  place_name?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
}

const props = defineProps<{
  label: string
  items: ExperienceEntry[]
  onSave: (items: ExperienceEntry[]) => Promise<void>
  placeType?: string | null
  includeSnapshot?: boolean
}>()

const createLabel = computed(() => `Add ${props.label.toLowerCase()}`)
const itemTitle = (item: ExperienceEntry) => item.role || 'Role'
const itemDate = (item: ExperienceEntry) => formatRange(item)

const db = useFirestore()
const placeCache = ref<Record<string, Record<string, any>>>({})
const toPlaceCard = mapPlaceToCard()

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

const formatPlace = (item: ExperienceEntry) => {
  const primary = item.name || item.place_name || ''
  if (primary.trim().length) return primary
  const placeId = canonicalPlaceId(item?.place_id ?? undefined)
  if (placeId && placeCache.value[placeId]) {
    const cached = placeCache.value[placeId]
    return (
      cached.name ||
      cached.short_address ||
      cached.formatted_address ||
      'Place'
    )
  }
  if (placeId) return 'Place loading…'
  return 'Place'
}

const resolvePlaceCard = (item: ExperienceEntry): PlaceCard.Card | null => {
  const placeId = canonicalPlaceId(item?.place_id ?? undefined)
  if (!placeId) return null
  const cached = placeCache.value[placeId]
  if (!cached) return null
  return toPlaceCard({ ...cached, id: placeId })
}
const newExperienceItem = (): ExperienceEntry => ({
  role: '',
  place_id: '',
  name: '',
  formatted_address: '',
  short_address: '',
  image_url: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  ongoing: false,
  responsibilities: '',
})

const onApplyPlaceConfirmed = (
  payload: { placeId: string; place: PlaceUpsertInput },
  target: ExperienceEntry
) => {
  const placeId = canonicalPlaceId(payload.placeId) || payload.placeId
  target.place_id = placeId || ''

  if (props.includeSnapshot) {
    const place = payload.place as PlaceUpsertInput & { place_image?: string }
    target.name = String(place.name ?? '')
    target.place_name = String((place as any).name ?? '')
    target.formatted_address = String(place.formatted_address ?? '')
    target.short_address = String((place as any).short_address ?? '')
    target.image_url = String((place as any).place_image ?? '')
  }
}
</script>
