<template>
  <DevPane
    title="Places collection"
    description="Browse places resolved for this runtime and filter by model drift."
    :drift-kind="driftKind"
    :selected-field="selectedField"
    :filter-options="filterOptions"
    :copy-label="copying ? 'Copying…' : 'Copy filtered drift'"
    :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
    :copy-disabled="copying"
    @update:drift-kind="setDriftKind"
    @update:selected-field="(value) => (selectedField = value)"
    @copy="copyFiltered"
  >
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
        <component
          :is="wrapperFor(card)"
          v-for="card in filteredCards"
          :key="card.id"
          v-bind="wrapperPropsFor(card)"
          class="block"
        >
          <PlaceCardsCell
            v-bind="card"
            :prop="taglineById.get(card.id) || ''"
          />
        </component>
      </div>
    </div>
  </DevPane>

  <DevPane
    title="Places (JSON)"
    :json-title="'Places (JSON)'"
    :json-data="allJsonPayload"
    :json-default-open="false"
  />
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { usePlacesInterface } from '../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place as PlaceModel } from '../../models/objects/place.model'
import { Place as PlaceModelRuntime } from '../../models/objects/place.model'

const props = withDefaults(
  defineProps<{
    places?: PlaceModel[] | null
  }>(),
  {
    places: () => [],
  }
)

const placesList = computed<PlaceModel[]>(() => props.places ?? [])
const totalPlaces = computed(() => placesList.value.length)

const { copyJSON, copying } = useDevClipboard()
const { card: makeCard } = usePlacesInterface()

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
      map.set(
        card.id,
        `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${selected}`
      )
      continue
    }

    const first = list[0]
    if (first) {
      map.set(
        card.id,
        `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${first}`
      )
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

const wrapperFor = (card: { to?: string }) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string }) => (card.to ? { to: card.to } : {})
</script>
