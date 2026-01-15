<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Suppliers</h2>
          <p class="text-xs text-gray-500">Browse suppliers available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput v-model="query" size="xs" placeholder="Search suppliers…" class="w-44" />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsProfilesSupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">No suppliers found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier';

const props = defineProps<{ cards: SupplierCard.Card[]; total?: number }>()

const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<SupplierCard.Card, SupplierCard.Card>({
    items: computed(() => props.cards ?? []),
    searchText: (card) =>
      `${card.displayName} ${card.tagline} ${card.id}`.trim().toLowerCase(),
    makeCard: (card) => card,
  })

const totalCount = computed(() => props.total ?? props.cards.length)
</script>
