<!-- Concurrent edit — 2026-07-21 16:06 CEST — Misebox dev stability pass: stop eager logo discovery for every search result. -->
<template>
  <div v-if="cells.length" class="space-y-1">
    <template v-for="cell in cells" :key="cell.id">
      <PlaceCardsDropdownGoogle
        v-if="cell.source === 'google'"
        :name="cell.name"
        :address="resolveAddress(cell)"
        :image-url="resolveImageUrl(cell)"
        @select="onSelect(cell)"
      />
      <PlaceCardsDropdownFireux
        v-else
        :name="cell.name"
        :short-name="cell.shortName"
        :address="resolveAddress(cell)"
        :image-url="resolveImageUrl(cell)"
        :image-shade="cell.imageShade"
        @select="onSelect(cell)"
      />
    </template>
  </div>
  <div v-if="cells.length" class="pt-3">
    <div class="max-w-2xl">
<FireDiagnosticsDebugPanel
  object-origin="fetched"
        launcher
        include-route
        :title="'Places (Dropdown Debug)'"
        context="Places search dropdown · live cells"
        :objects="debugCells"
  :derived="{}"
        :default-open="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlaceSearchCell } from '../../composables/usePlaceSearch'
import type { BasePlace, PlaceSearchSource } from '../../composables/firestore/fetch/search/types'
import type { PlaceImageShade } from '../../utils/place-spine'


const props = withDefaults(
  defineProps<{
    cells?: PlaceSearchCell[] | null
  }>(),
  { cells: () => [] }
)

const emit = defineEmits<{
  (e: 'select', cell: BasePlace): void
}>()

const cells = computed(() => (props.cells ?? []) as PlaceSearchCell[])
const debugCells = computed(() =>
  cells.value.map((cell) => ({
    ...cell,
    imageUrl: resolveImageUrl(cell),
    address: resolveAddress(cell),
  }))
)

function resolveImageUrl(card: PlaceSearchCell) {
  return String(card?.imageUrl || '')
}

function resolveAddress(card: PlaceSearchCell) {
  return String(
      card.shortAddress ||
      card.formattedAddress ||
      ''
  ).trim()
}

function toBasePlace(card: PlaceSearchCell): BasePlace {
  return {
    id: card.id,
    name: card.name || '',
    short_name: card.shortName || '',
    place_type: 'physical',
    formatted_address: card.formattedAddress || '',
    short_address: card.shortAddress || '',
    lat: (card as any).lat ?? 0,
    lng: (card as any).lng ?? 0,
    image_url: resolveImageUrl(card),
    image_shade: (card.imageShade as PlaceImageShade) ?? 'none',
    claimed_by: (card.claimedBy as string) ?? '',
    slug: String((card as any).slug || ''),
    source: (card.source as PlaceSearchSource) ?? 'fireux',
    entity_families: [],
  }
}

function onSelect(card: PlaceSearchCell) {
  emit('select', toBasePlace(card))
}
</script>
