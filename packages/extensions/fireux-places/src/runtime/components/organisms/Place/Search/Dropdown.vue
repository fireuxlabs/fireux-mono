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
        :source="cell.source"
        @select="onSelect(cell)"
      />
    </template>
  </div>
  <div v-if="cells.length" class="pt-3">
    <div class="max-w-2xl">
      <DevJson
        :title="'Places (Dropdown Debug)'"
        context="Places search dropdown · live cells"
        :data="debugCells"
        :default-open="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { loadLogoForPlace } from '../../../../composables/fireux/firestore/place/utils/view/usePlaceLogos';
import type { PlaceCard } from '../../../../composables/fireux/firestore/place/utils/view/usePlacesInterface';
import type { BasePlace, PlaceImageShade, PlaceSource } from '../../../../models/place.model';


const props = withDefaults(
  defineProps<{
    cells?: PlaceCard.Card[] | null
  }>(),
  { cells: () => [] }
)

const emit = defineEmits<{
  (e: 'select', cell: BasePlace): void
}>()

const cells = computed(() => (props.cells ?? []) as PlaceCard.Card[])
const debugCells = computed(() =>
  cells.value.map((cell) => ({
    ...cell,
    imageUrl: resolveImageUrl(cell),
    address: resolveAddress(cell),
  }))
)

const logoLoading = new Set<string>()
const logoById = ref<Record<string, string>>({})

watch(
  cells,
  (next) => {
    if (!Array.isArray(next)) return
    const activeIds = new Set<string>()
    for (const card of next) {
      const cardId = String(card?.id || '').trim()
      if (cardId) activeIds.add(cardId)
      if (!card || card.source !== 'google') continue
      if (card.imageUrl) continue
      if (logoById.value[cardId]) continue
      if (logoLoading.has(cardId)) continue
      logoLoading.add(cardId)
      void loadLogoForPlace(card, { timeoutMs: 6000, priority: true })
        .then((url) => {
          if (!url) return
          logoById.value = {
            ...logoById.value,
            [cardId]: url,
          }
        })
        .finally(() => {
          logoLoading.delete(cardId)
        })
    }

    // Keep cache aligned to currently rendered rows.
    const nextLogoById: Record<string, string> = {}
    for (const [id, url] of Object.entries(logoById.value)) {
      if (!activeIds.has(id)) continue
      nextLogoById[id] = url
    }
    logoById.value = nextLogoById
  },
  { immediate: true }
)

function resolveImageUrl(card: PlaceCard.Card) {
  const cardId = String(card?.id || '').trim()
  if (!cardId) return String(card?.imageUrl || '')
  return String(logoById.value[cardId] || card.imageUrl || '')
}

function resolveAddress(card: PlaceCard.Card) {
  return String(
    card.subtitle ||
      card.shortAddress ||
      card.formattedAddress ||
      ''
  ).trim()
}

function toBasePlace(card: PlaceCard.Card): BasePlace {
  return {
    id: card.id,
    name: card.name || card.title || '',
    short_name: card.shortName || '',
    place_type: 'physical',
    formatted_address: card.formattedAddress || card.subtitle || '',
    short_address: card.shortAddress || '',
    lat: (card as any).lat ?? 0,
    lng: (card as any).lng ?? 0,
    image_url: resolveImageUrl(card),
    image_shade: (card.imageShade as PlaceImageShade) ?? 'none',
    claimed_by: (card.claimedBy as string) ?? '',
    source: (card.source as PlaceSource) ?? 'fireux',
  }
}

function onSelect(card: PlaceCard.Card) {
  emit('select', toBasePlace(card))
}
</script>
