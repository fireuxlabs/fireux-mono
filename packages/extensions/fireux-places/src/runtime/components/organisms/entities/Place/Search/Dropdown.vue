<template>
  <div v-if="cells.length" class="space-y-1">
    <template v-for="cell in cells" :key="cell.id">
      <PlaceCardsDropdownGoogle
        v-if="cell.source === 'google'"
        :name="cell.name"
        :address="cell.subtitle"
        :image-url="cell.imageUrl"
        @select="onSelect(cell)"
      />
      <PlaceCardsDropdownFireux
        v-else
        :name="cell.name"
        :short-name="cell.shortName"
        :address="cell.subtitle"
        :image-url="cell.imageUrl"
        :image-shade="cell.imageShade"
        :source="cell.source || 'fireux'"
        :show-source="true"
        @select="onSelect(cell)"
      />
    </template>
  </div>
  <div v-if="cells.length" class="pt-3">
    <div class="max-w-2xl">
      <DevJson
        :title="'Places (Dropdown Debug)'"
        context="Places search dropdown · live cells"
        :data="cells"
        :default-open="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { PlaceSearchCell } from '../../../../../composables/fireux/firestore/objects/place/fetch/search/usePlacesSearch'
import { loadLogoForPlace } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlaceLogos'
import type { BasePlace, PlaceImageShade, PlaceSource } from '../../../../../models/objects/place.model'
import PlaceCardsDropdownFireux from '../Cards/Dropdown/Fireux.vue'
import PlaceCardsDropdownGoogle from '../Cards/Dropdown/Google.vue'

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

const logoLoading = new Set<string>()

watch(
  cells,
  (next) => {
    if (!Array.isArray(next)) return
    for (const card of next) {
      if (!card || card.source !== 'google') continue
      if (card.imageUrl) continue
      if (logoLoading.has(card.id)) continue
      logoLoading.add(card.id)
      const base = toBasePlace(card)
      void loadLogoForPlace(base, { timeoutMs: 6000, priority: false })
        .then((url) => {
          if (url) {
            card.imageUrl = url
          }
        })
        .finally(() => {
          logoLoading.delete(card.id)
        })
    }
  },
  { immediate: true }
)

function toBasePlace(card: PlaceSearchCell): BasePlace {
  return {
    id: card.id,
    name: card.name || '',
    short_name: card.shortName || '',
    formatted_address: card.formattedAddress || card.subtitle || '',
    short_address: card.shortAddress || '',
    lat: (card as any).lat ?? 0,
    lng: (card as any).lng ?? 0,
    image_url: card.imageUrl || '',
    image_shade: (card.imageShade as PlaceImageShade) ?? 'none',
    claimed_by: (card.claimedBy as string) ?? '',
    source: (card.source as PlaceSource) ?? 'fireux',
  }
}

function onSelect(card: PlaceSearchCell) {
  emit('select', toBasePlace(card))
}
</script>

