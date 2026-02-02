<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Places</div>
          <p>Browse places available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search places…"
          />

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesPlaceCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
      gap="0.5rem"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to" class="block max-w-full">
          <PlaceCardsPill
            v-bind="card"
            :show-badges="false"
            :show-subtitle="true"
          />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <PlaceCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesPlaceCollectionList>

    <p v-else>
      {{ query ? 'No places match your search.' : 'No places found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Places (JSON)'"
        context="Places collection manager · places list · runtime-resolved"
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
const { pill, searchText } = usePlacesInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<BasePlace, ReturnType<typeof pill>>({
  items: collection,
  searchText: (place: BasePlace) => searchText(place as any),
  makeCard: (place: BasePlace) => pill(place),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
