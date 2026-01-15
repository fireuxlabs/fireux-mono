<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Apps</h2>
          <p class="text-xs text-gray-500">
            Browse apps available to this runtime.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search apps…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsAppCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch';

const props = defineProps<{ cards: AppCard.Card[]; total?: number }>()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<AppCard.Card, AppCard.Card>({
  items: computed(() => props.cards ?? []),
  searchText: (card) =>
    `${card.displayName} ${card.shortName ?? ''} ${card.id ?? ''} ${card.ecosystem ?? ''}`.toLowerCase(),
  makeCard: (card) => card,
})

const totalCount = computed(() => props.total ?? props.cards.length)
</script>
