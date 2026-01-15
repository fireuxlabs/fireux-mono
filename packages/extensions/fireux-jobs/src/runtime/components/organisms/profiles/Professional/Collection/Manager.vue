<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Professionals</h2>
          <p class="text-xs text-gray-500">Browse professionals available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput v-model="query" size="xs" placeholder="Search professionals…" class="w-44" />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsProfilesProfessionalCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">No professionals found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional';

const props = defineProps<{ cards: ProfessionalCard.Card[]; total?: number }>()

const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ProfessionalCard.Card, ProfessionalCard.Card>({
    items: computed(() => props.cards ?? []),
    searchText: (card) =>
      `${card.displayName} ${card.tagline} ${card.id}`.trim().toLowerCase(),
    makeCard: (card) => card,
  })

const totalCount = computed(() => props.total ?? props.cards.length)
</script>
