<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Places</div>
          <p class="text-xs text-dimmed">Browse places available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search places…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesPlaceCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No places match your search.' : 'No places found.' }}
    </p>

    <div v-if="isDev" class="pt-3">
      <DevJson
        :title="'Places (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { usePlacesInterface } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { BasePlace } from '../../../../../models/objects/place.model';

const props = defineProps<{ collection?: BasePlace[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = usePlacesInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<BasePlace, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (place: BasePlace) => searchText(place as any),
  makeCard: (place: BasePlace) => makeCard(place),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
