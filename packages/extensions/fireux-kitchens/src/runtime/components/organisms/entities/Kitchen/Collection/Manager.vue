<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Kitchens</div>
          <p>Browse kitchens available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search kitchens…"
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

    <OrganismsEntitiesKitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <KitchenCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <KitchenCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesKitchenCollectionList>

    <p v-else>
      {{ query ? 'No kitchens match your search.' : 'No kitchens found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Kitchens (JSON)'"
        context="Kitchens collection manager · kitchens list · runtime-resolved"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';
import type { Kitchen } from '../../../../../models/objects/kitchen.model';

const props = defineProps<{ collection?: Kitchen[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useKitchenInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Kitchen, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (kitchen: Kitchen) => searchText(kitchen),
  makeCard: (kitchen: Kitchen) => makeCard(kitchen),
})
const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
