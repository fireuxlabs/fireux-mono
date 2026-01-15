<template>
  <UPage>
    <UPageHeader
      title="Dev · Places (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Place model)."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="Places collection"
        description="Browse places resolved for this runtime and filter by model drift."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ driftKind }}:</span>

          <UButton
            v-for="option in filterOptions"
            :key="option.value"
            size="xs"
            :variant="selectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="selectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!filteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching places"
            description="Adjust filters or add place documents to Firestore."
          />

          <div v-else class="space-y-2">
            <OrganismsObjectsPlaceCardsCell
              v-for="card in filteredCards"
              :key="card.id"
              v-bind="card"
              :prop="taglineById.get(card.id) || ''"
            />
          </div>
        </div>
      </DevPane>

      <DevPane
        title="Places (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Places (Ext) · All data"
        :debug-data="allJsonPayload"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { usePlaces } from '../../composables/fireux/firestore/objects/place/usePlaces'
import { usePlacesInterface } from '../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place as PlaceModel } from '../../models/objects/place.model'
import { Place as PlaceModelRuntime } from '../../models/objects/place.model'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-places'],
  nav: {
    key: 'dev-ext-places',
    label: 'Places (Ext)',
    icon: 'i-lucide-map-pin',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { copyJSON, copying } = useDevClipboard()
const { card: makeCard } = usePlacesInterface()

const { collection } = usePlaces<PlaceModel>()
const placesList = computed<PlaceModel[]>(() => collection.value ?? [])
const totalPlaces = computed(() => placesList.value.length)

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
  filteredCollection,
} = useDevDriftFilter({
  collection: placesList,
  runtimeModel: PlaceModelRuntime as unknown as Record<string, unknown>,
})

const filteredCards = computed(() =>
  filteredCollection.value
    .map((place) => makeCard(place))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const taglineById = computed(() => {
  const map = new Map<string, string>()
  for (const card of filteredCards.value) {
    const drift = driftById.value.get(card.id)
    if (!drift) continue
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra

    const selected = selectedField.value
    if (selected && list.includes(selected)) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${selected}`)
      continue
    }

    const first = list[0]
    if (first) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${first}`)
    }
  }
  return map
})

const filteredPayload = computed(() =>
  filteredCards.value.map((card) => {
    const drift = driftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      formattedAddress: card.formattedAddress,
      drift,
    }
  })
)

const allJsonPayload = computed(() => ({
  totalPlaces: totalPlaces.value,
  places: placesList.value,
  driftById: Object.fromEntries(driftById.value),
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      totalPlaces: totalPlaces.value,
      places: filteredPayload.value,
    },
    { label: 'Dev · Places (Ext) · Filtered drift' }
  )
}
</script>
